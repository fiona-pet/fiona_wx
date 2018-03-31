/**
 * Created by zhongfan on 2017/5/27.
 */
import React from 'react'
import './TroubleRepairing.scss'
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
import Title from 'react-title-component'

//故障服务单
class TroubleRepairing extends React.Component {

    constructor(props) {
        super(props);
        document.title = "故障报修";
        this.state = {
            resultList: [],//请求 类别列表
        }
    }

    componentDidMount() {
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
        this.props.history.replace({
            pathname: '/submit/' + item.id + "/" + item.process.id + "/" + item.display_name + "/trouble"
        });
    }

    render() {
        return <Page className="TroubleRepairing">
            <Title render="故障报修"/>
            <CellsTitle>
                选择故障分类
            </CellsTitle>
            <Cells>
                {this.state.resultList.map((item, index) => {
                    // if (item.is_global_visible){
                        return <Cell key={index} access onClick={this.goSubmit.bind(this, item)}>
                            <CellBody>{item.display_name}</CellBody>
                            <CellFooter/>
                        </Cell>
                    // }
                })}
            </Cells>
        </Page>
    }
}

export default TroubleRepairing
