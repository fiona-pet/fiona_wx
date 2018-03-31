/**
 * Created by zhongfan on 2017/5/27.
 */
import React from 'react'
import './SubmitFrom.scss'
import {
    Icon,
    ButtonArea,
    Button,
    Label,
    FormCell,
    Form,
    Input,
    Checkbox,
    Radio,
    TextArea,
    Select,
    CellsTitle,
    Cells,
    Cell,
    CellHeader,
    CellFooter,
    CellBody,
    Gallery,
    GalleryDelete,
    Dialog,
} from 'react-weui/build/packages';
import DynamicCells from '../../components/common/DynamicCells'
import Uploader from '../../components/common/Uploader'
import {
    getNodeId,
    workorderActionExecute,
    getOrderId,
    getWorkOrderType,
    getNodeByServiceCatalog,
    upload,
    deleteFile
} from '../../services/utilization'
import WorkSheetModel from '../../models/WorkSheet'
import SingleSelect from '../../components/common/cmdb/SingleSelect'
import MultiSelect from '../../components/common/cmdb/MultiSelect'
import DynamicCell from '../../components/common/DynamicCell'
import DynamicButton from '../../components/common/DynamicButton'
import Auth from '../../models/Auth'

import Page from '../../components/common/page'

const directory = "directory";
const user = "user";
const FAULT_CI_TYPE = '0eea99f2-d189-4875-8e23-2f326c1f8ca0';//表示故障单的id

//请求服务单
class SubmitFrom extends React.Component {
    constructor(props) {
        super(props);

        document.title = "填写工单";

        this.allData = [];
        this.orderId = '';
        this.nodeId = '';
        this.processId = '';
        this.workOrderType = '';
        this.catalogId = '';
        this.catalogName = '';
        this.pageIndex = 1;
        this.ciTypes = [];
        this.rules = [];

        this.state = {
            demoFiles: [],
            type: '',
            id: '',
            desc: '',
            directory: {display_name: '请选择'},
            user: {display_name: Auth.getUser().name, id: Auth.getId()},
            isToastShown: false,
            isTipShown: true,
            isUploaderShown: false,//如果是请求单，不显示上传附件
            tipText: '',
            index: '',
            components: [],
            lookup_popUp: false,
            multi_lookup_popUp: false,
            lookUpDataSource: [],
            selectedItem:{editor: ''},
            dynamicButtons: [],
            showAlert: false,
            alert: {
                content: '',
                buttons: [
                    {
                        label: '确定',
                        onClick: this.hideAlert.bind(this)
                    }
                ]
            },
        }
    }

    componentDidMount() {
        let params = this.props.match.params;
        this.catalogId = params.catalogId;
        this.processId = params.processId;
        this.catalogName = params.catalogName;
        this.getNodeId();
        this.getWorkOrderType();
        this.getOrderId();
        this.loadDynamicButtons()
    }

    getWorkOrderType() {
        getWorkOrderType(this.processId).then(res => {
            let obj = JSON.parse(res);
            this.workOrderType = obj.result.workorder_type.id;
        })
    }

    getOrderId() {
        getOrderId().then(res => {
            let obj = JSON.parse(res);
            this.orderId = obj.result;
            this.loadDynamicViews(this.catalogId, this.orderId);
        })
    }

    getNodeId() {
        getNodeId(this.catalogId).then(res => {
            let obj = JSON.parse(res);
            this.nodeId = obj.result;
        });
    }

    loadDynamicButtons() {
        getNodeByServiceCatalog(this.catalogId).then(res => {
            let obj = JSON.parse(res);
            if (typeof obj.error === 'object') {
                return
            }
            if (obj.result) {
                this.setState({dynamicButtons: obj.result})
            }
        });
    }

    loadDynamicViews(serviceId, orderId) {
        WorkSheetModel.getFormsByCatalog(serviceId, "apply", {"create_user": null, "id": orderId}, (result, components, rules, ciTypes) => {
            this.rules = rules;
            this.ciTypes = ciTypes;
            console.log(components);
            this.setState({components: components});
            if (this.ciTypes[0] === FAULT_CI_TYPE) {
                this.setState({isUploaderShown: true})
            }
        })
    }

    showAlert(msg) {
        this.setState({
            showAlert: true,
            alert: Object.assign(this.state.alert, {content: msg}),
        });
    }

    hideAlert() {
        this.setState({showAlert: false});
    }
    searchChange(value) {
        if (!this.state.lookup_popUp && !this.state.multi_lookup_popUp) return;
        this.pageIndex = 1;
        WorkSheetModel.loadLookUpData([], this.state.selectedItem, value, this.pageIndex, (allData, resIndex) => {
            this.allData = allData;
            this.pageIndex = resIndex;
            if (this.state.selectedItem.editor == 'userselector' || this.state.selectedItem.editor == 'roleselector') {
                this.setState({multi_lookup_popUp: true, lookUpDataSource: allData});
            } else {
                this.setState({lookup_popUp: true, lookUpDataSource: allData});
            }
        })
    }
    cellClick(popUpProps) {
        this.setState({...popUpProps});
    }
    onLoadMore(resolve, finish) {
        WorkSheetModel.loadLookUpData(this.allData, this.state.selectedItem, '', this.pageIndex, (allData, resIndex) => {
            this.allData = allData;
            this.pageIndex = resIndex;
            this.setState({lookUpDataSource: allData});
            resolve()
        }, finish)
    }

    // 动态列表选择页面的取消
    handleCancelClick() {
        this.setState({
            lookup_popUp: false,
            multi_lookup_popUp: false,
            replyComment: false,
        })
    }

    // 动态列表选择页面的确定
    handleOKClick(item) {
        this.setState({lookup_popUp: false, multi_lookup_popUp: false});
        WorkSheetModel.setComponentsValue(this.state.components, item, this.state.selectedItem.id);
        WorkSheetModel.changeComponentsRule(this.state.components, this.rules, this.ciTypes, this.state.selectedItem.name, this.orderId, (components) => {
            this.setState({components:components})
        });
    }
    defaultSelected() {
        return this.state.selectedItem.defaultId
    }
    buttonClick(title, index) {
        let action = this.state.dynamicButtons[index];
        let actionId = action.id;
        let [detailData, alarmNames] = WorkSheetModel.mapData(this.state.components, this.ciTypes, this.orderId);
        console.log(alarmNames)
        if (alarmNames.length > 0) {
            this.props.showMessage(alarmNames[0], "warn");
            return
        }

        let createData = [{
            "id": this.orderId,
            "type": this.workOrderType,
            "node": this.nodeId
        }, ...detailData, {
            "service_catalog": this.catalogId
        }];

        console.log(createData, alarmNames)
        this.props.showMessage("正在提交", "info");
        workorderActionExecute([actionId, createData]).then(res => {
            let obj = JSON.parse(res);
            if (obj.result) {
                this.props.history.replace('/utilization/serviceTracking');
            } else {
                this.props.showMessage(obj.error.localizedMessage ? obj.error.localizedMessage:"动作异常", "error");
            }
        }, (error) => {
            this.props.showMessage("网络异常", "error");
        });
    }

    uploadFile(file) {
        this.props.showMessage("正在上传", "info");
        upload(file.data, this.orderId).then(res => {
            let obj = {"url":  res.url, "id": res.id};
            let newFiles = [...this.state.demoFiles, obj];
            this.setState({
                demoFiles: newFiles
            });
        });
    }

    deleteFile(index) {
        let file = this.state.demoFiles[index];
        deleteFile(file.id).then(res => {
            this.setState({
                demoFiles: this.state.demoFiles.filter((e, i) => i != index),
                gallery: false
            })
        })
    }

    renderGallery() {
        if (!this.state.gallery) return false;
        let src = this.state.demoFiles.map(file => file.url);

        return (
            <Gallery
                src={src}
                show
                defaultIndex={this.state.gallery.index}
                onClick={ e => {
                    //avoid click background item
                    e.preventDefault()
                    e.stopPropagation();
                    this.setState({gallery: false})
                }}
            >

                <GalleryDelete onClick={ (e, index) => {
                    this.deleteFile(index)
                }}/>

            </Gallery>
        )
    }

    render() {
        let titles = [];
        this.state.dynamicButtons.map(item => {
            titles.push(item.display_name)
        });
        const dynamicButtonsProps = {
            titles:titles,
            buttonClick:this.buttonClick.bind(this)
        };
        const dynamicCellsProps = {
            components:this.state.components,
            ciTypes:this.ciTypes,
            rules:this.rules,
            orderId:this.orderId,
            cellClick:this.cellClick.bind(this)
        };
        return <div className="SubmitFrom">
            { this.renderGallery() }
            <Page className={titles.length > 4 ? "container2" : "container1"}>
                <CellsTitle>
                    <Cell>
                        <CellHeader>
                            填写工单信息
                        </CellHeader>
                        <CellBody>
                        </CellBody>
                        <CellFooter>
                            {this.catalogName}
                        </CellFooter>
                    </Cell>
                </CellsTitle>
                <DynamicCells {...dynamicCellsProps}/>
                <Cells>
                    {this.state.isUploaderShown ?
                        <Cell>
                            <CellBody>
                                <Uploader
                                    title="上传附件"
                                    maxCount={6}
                                    files={this.state.demoFiles}
                                    onError={msg => this.showAlert(msg)}
                                    onChange={(file, e) => {
                                        console.log(file)
                                        this.uploadFile(file)
                                    }}
                                    onFileClick={
                                        (e, file, i) => {
                                            this.setState({
                                                gallery: {url: file.url, id: file.id, index: i}
                                            })
                                        }
                                    }
                                    lang={{
                                        maxError: maxCount => `最多上传${maxCount}张图片`
                                    }}
                                />
                            </CellBody>
                        </Cell> : ''}
                </Cells>
            </Page>

            <DynamicButton {...dynamicButtonsProps}/>
            <Dialog buttons={this.state.alert.buttons} show={this.state.showAlert}>
                {this.state.alert.content}
            </Dialog>
            <SingleSelect show={this.state.lookup_popUp} dataSource={this.state.lookUpDataSource}
                          handleOKClick={this.handleOKClick.bind(this)}
                          handleCancelClick={this.handleCancelClick.bind(this)}
                          searchChange={this.searchChange.bind(this)}
                          onLoadMore={this.onLoadMore.bind(this)}
                          defaultValue={this.defaultSelected()}
            />
            <MultiSelect show={this.state.multi_lookup_popUp} dataSource={this.state.lookUpDataSource}
                         handleOKClick={this.handleOKClick.bind(this)}
                         handleCancelClick={this.handleCancelClick.bind(this)}
                         searchChange={this.searchChange.bind(this)}
                         onLoadMore={this.onLoadMore.bind(this)}
                         defaultValue={this.defaultSelected()}
            />
        </div>
    }
}

export default SubmitFrom
