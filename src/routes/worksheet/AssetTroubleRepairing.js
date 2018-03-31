/**
 * Created by sufei on 2017/5/27.
 */
import React from 'react'
import './AssetTroubleRepairing.scss'
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
    Uploader
} from 'react-weui/build/packages';
import {
    getTroubleTypeList,
} from '../../services/worksheet';
import Page from '../../components/common/page'

//故障服务单类别选择
class AssetTroubleRepairing extends React.Component {

    constructor(props) {
        super(props);

        document.title = "故障报修";

        this.state = {
            assetId: '',
            assetName: '',
            resultList: [],//请求 类别列表
        }
    }

    componentDidMount() {
        let params = this.props.match.params;
        this.setState({assetName: params.assetName, assetId: params.assetId});
        this.loadData();
    }

    /**
     * 请求数据
     */
    loadData() {
        getTroubleTypeList().then(res => {
            let obj = JSON.parse(res);
            this.sort(obj.result);
        }, err => {
            console.log(err);
        });
    }

    /**
     * 排序
     * @param result 未排序的列表
     */
    sort(result) {
        let list = [];
        result.map((item) => {
            let parentId = item.id;
            if (item.parent === undefined) {
                list.push(item);
                this.sortChild(list, result, parentId, 1);
            }
        });

        result.map((item, index) => {
            if (item.parent) {
                let isHave = false;
                list.map((item1, index1) => {
                    if (item1.parent) {
                        if (item1.parent == item.parent && item1.id == item.id){
                            isHave = true;
                        }
                    }
                });
                if(!isHave){
                    list.push(item);
                }
            }
        });

        this.setState({resultList: list});
    }

    sortChild(list, result, parentId, count) {

        result.map((item, index) => {
            if (item.parent !== undefined) {
                if (item.parent === parentId) {
                    let i = 0;
                    let x = '';
                    while (i < count) {
                        x = x + "-";
                        i++;
                    }
                    item.display_name = '|' + x + item.display_name;
                    list.push(item);
                    this.sortChild(list, result, item.id, count + 1);
                }
            }
        });
    }

    /**
     * 提交
     */
    goSubmit(item) {
        console.log(item);
        this.props.history.push({
            pathname: '/assetSubmit/' + item.id + "/" + item.process.id + "/"  + item.display_name + "/trouble" + "/" + this.state.assetId + "/" + this.state.assetName
        });
    }

    render() {
        return <Page className="TroubleRepairing">
            <CellsTitle>
                选择故障分类
            </CellsTitle>
            <Cells>
                {this.state.resultList.map((item, index) => (
                    <Cell key={index} access onClick={this.goSubmit.bind(this, item)}>
                        <CellBody>{item.display_name}</CellBody>
                        <CellFooter/>
                    </Cell>
                ))}
            </Cells>
        </Page>
    }
}

export default AssetTroubleRepairing
