/**
 * 附件
 * Created by Jin on 2017/7/10.
 */
import React from 'react'

import {
    Button,
    Cells,
    Cell,
    CellBody,
    CellHeader,
    CellFooter,
    Gallery,
    GalleryDelete,
    Dialog,
} from 'react-weui/build/packages'

import {
    getFileList,
    deleteById,
    upload
} from '../../services/utilization'

import './OrderFileList.scss'

import Page from '../../components/common/page';
import MathUtil from '../../utils/MathUtil';
import ButtonUploader from '../../components/common/Uploader/ButtonUploader';
import Empty from '../../components/common/NoData';
import Title from 'react-title-component'

export default class OrderFileList extends React.Component {

    constructor(props) {
        super(props);
        document.title = "附件列表";
        this.orderId = '';

        this.state = {
            emptyShow: false,
            list: [],
            imgList: [],
            imgSrc: [],
            showAlert: false,
            showAlertDelete: false,
            alert: {
                content: '',
                buttons: [
                    {
                        label: '确定',
                        onClick: this.hideAlert.bind(this)
                    }
                ]
            },
            alertDelete: {
                content: '',
                buttons: [
                    {
                        label: '取消',
                        type: 'default',
                        onClick: this.hideAlertDelete.bind(this, false)
                    },
                    {
                        label: '确定',
                        type: 'primary',
                        onClick: this.hideAlertDelete.bind(this, true)
                    }
                ]
            },
            isGalleryShown: false,
            currentId: ''
        }
    }

    componentDidMount() {
        this.loadData()
    }

    /**
     * 加载数据（从上一页面传来的）
     */
    loadData() {
        let id = this.props.match.params.id;
        this.orderId = id;
        getFileList(id).then(res => {
            let obj = JSON.parse(res);
            let list = obj.result;
            console.log(list)
            let imgList = [];
            list.map((item) => {
                if (this.checkExt(item.mime_type)) {
                    imgList.push({
                        id: item.id,
                        url: item.url
                    })
                }
            });

            this.state.emptyShow = imgList.length == 0 ? true : false;

            this.setState({
                list: list,
                imgList: imgList
            })

        });
    }

    /**
     * 检查扩展名（是否属于图片，非图片则不提供预览）
     * @param mimeType
     * @returns {boolean}
     */
    checkExt(mimeType) {
        let array = ['bmp', 'png', 'jpg', 'jpeg', 'gif', 'webp'];
        for (let i = 0; i < array.length; i++) {
            if (mimeType === array[i]) {
                return true;
            }
        }
        return false;
    }

    /**
     * 预览
     */
    preview(id, mimeType) {
        if (!this.checkExt(mimeType)) {
            return;
        }

        let imgListCopy = this.state.imgList;
        let imgSrc = [];
        let index = 0;
        for (let i = 0; i < imgListCopy.length; i++) {
            if (id === imgListCopy[i].id) {
                index = i;
                break;
            }
        }
        imgSrc = imgSrc.concat(imgListCopy.slice(index));
        imgSrc = imgSrc.concat(imgListCopy.slice(0, index));
        this.state.imgSrc = [];
        for (let i = 0; i < imgSrc.length; i++) {
            this.state.imgSrc.push(imgSrc[i].url);
        }

        this.setState({
            isGalleryShown: true
        })
    }


    uploadFile(file) {
        this.props.showMessage("正在上传", "info");
        upload(file.data, this.orderId).then(res => {
            this.loadData();
        });
    }

    showAlert(msg) {
        this.setState({
            showAlert: true,
            alert: Object.assign(this.state.alert, {content: msg}),
        });
    }

    showAlertDelete(msg) {
        this.setState({
            showAlertDelete: true,
            alertDelete: Object.assign(this.state.alertDelete, {content: msg})
        })
    }

    hideAlert() {
        this.setState({showAlert: false});
    }

    hideAlertDelete(bool) {
        if (bool) {
            deleteById(this.state.currentId).then(() => {
                this.loadData()
            })
        }
        this.setState({showAlertDelete: false})
    }

    delete(index) {
        let url = this.state.imgSrc[index];
        let list = this.state.imgList;
        let id = '';
        for (let i = 0; i < this.state.imgList.length; i++) {
            if (url === list[i].url) {
                id = list[i].id;
                break
            }
        }
        if (id.length) {
            this.state.currentId = id;
            this.showAlertDelete('要删除这个附件吗？');
        }
    }

    render() {

        return <Page className="OrderFileList">
            <Title render={this.state.list.length <= 0 ? "附件"
                : "附件(" + this.state.list.length + ")"}/>
            {this.state.list.length <= 0 ?
                <Empty
                    show={this.state.emptyShow}
                    src={'attachment'}
                    remind={'暂无附件'}/>
                :
                <Cells>
                    {this.state.list.map((item) => (
                        <Cell onClick={this.preview.bind(this, item.id, item.mime_type)}>
                            <CellHeader>
                                <img src={item.thumbnail}
                                     alt=""
                                     style={{display: `block`, width: `20px`, marginRight: `5px`}}/>
                            </CellHeader>
                            <CellBody className="weui-cell__bd">
                                {item.upload_file_name}
                            </CellBody>
                            <CellFooter>
                                {MathUtil.formatSize(item.file_size, 1)}
                            </CellFooter>
                        </Cell>))}
                </Cells>

            }

            <ButtonUploader
                title="上传附件"
                maxCount={6}
                files={this.state.imgList}
                onError={msg => this.showAlert(msg)}
                onChange={(file, e) => {
                    this.uploadFile(file);
                }}
                onFileClick={
                    (e, file, i) => {
                        console.log('file click', file, i)
                        this.setState({})
                    }
                }
                lang={{
                    maxError: maxCount => `最多上传${maxCount}张图片`
                }}
            />

            <Gallery
                src={this.state.imgSrc}
                show={this.state.isGalleryShown}
                onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.setState({isGalleryShown: false})
                }}>
                <GalleryDelete onClick={ (e, index) => {
                    this.delete(index)
                }}/>
            </Gallery>

            <Dialog buttons={this.state.alert.buttons} show={this.state.showAlert}>
                {this.state.alert.content}
            </Dialog>
            <Dialog buttons={this.state.alertDelete.buttons} show={this.state.showAlertDelete}>
                {this.state.alertDelete.content}
            </Dialog>
        </Page>
    }

}
