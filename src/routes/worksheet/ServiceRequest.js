import React from 'react'
import './ServiceRequest.scss'
import Page from '../../components/common/page'
import Title from 'react-title-component'
import {
    Cells, Cell, CellBody, CellFooter, CellHeader, CellsTitle,
} from 'react-weui/build/packages'
import {withRouter} from "react-router-dom";

import {
    getRequestTypeList,
} from '../../services/worksheet';

//选择故障
class ServiceRequest extends React.Component {

    constructor(props) {
        super(props);
        document.title = "服务申请";
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
        getRequestTypeList()
            .then(res => {
                let obj = JSON.parse(res);
                this.setState({resultList: obj.result});
            }, err => {
                console.log(err);
            });
    }

    /**
     * 提交
     */
    goSubmit(item) {
        console.log(item);
        this.props.history.replace({
            pathname: '/submit/' + item.id + "/" + item.process.id + "/" + item.display_name + "/request"
        });
    }

    render() {
        return <Page className="ServiceRequest">
            <Title render="服务申请"/>
            <CellsTitle>
                选择服务分类
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

export default withRouter(ServiceRequest)
