/**
 * Created by zhongfan on 2017/5/18.
 */
import React from 'react'
import './Utilization.scss'
import {
    Badge, Cells, Cell, CellBody, CellFooter, CellHeader, CellsTitle,Popup,PopupHeader
} from 'react-weui/build/packages'
import {withRouter} from "react-router-dom"
import UtilizationModel from '../../models/Utilization'
import {getCurrentConfigs} from '../../services/insight'
import TabPage from '../../components/common/layout/TabPage'

const asset = require('../../../asset/utilization/asset.svg');
const tracking = require('../../../asset/utilization/tracking.svg');
const todo = require('../../../asset/utilization/todo.svg');
const rectagnle = require('../../../asset/utilization/asset-rectangle.svg');

class Utilization extends React.Component {
    constructor(props) {
        super(props)
        document.title = "应用";
        this.state = {
            fullpage_show: false,
            todoNum: 0,
            serviceNum: 0,
            assetNum: 0,

            month: '',
            isEnable: false,
            isPublish: false,
            isStatisticsRequest: false
        }
    }

    click(event){
        console.log(event.target);

        let floatMenuList = document.getElementById("floatMenuList");
        if (floatMenuList){
            floatMenuList.className.indexOf("open") > -1?floatMenuList.className = "menu-list":floatMenuList.className = "menu-list open";
        }

        let floatMenu = document.getElementById("floatMenu");
        if (floatMenu){
            floatMenu.className.indexOf("open") > -1?floatMenu.className = "float-menu":floatMenu.className = "float-menu open";
        }

        this.setState({fullpage_show: !this.state.fullpage_show});
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        UtilizationModel.getTodoList('37ea4a70-af77-4c1a-9422-7582afc0de41', 1, '', (result) => {
            this.setState({todoNum: result.totalRecord});

        });
        UtilizationModel.getServiceTrackingList('37ea4a70-af77-4c1a-9422-7582afc0de41', 1, '', (result) => {
            this.setState({serviceNum: result.totalRecord});
        });
        UtilizationModel.getAssetNum((result) => {
            this.setState({assetNum: result.totalRecord});
        });

        getCurrentConfigs().then(res => {
            let obj = JSON.parse(res).result;
            if (!obj) return;
            this.setState({
                month: obj.month,
                isEnable: obj.isenable,
                isPublish: obj.ispublish,
                isStatisticsRequest: obj.isstatisticsrequest
            });
        })
    }

    goMonthlyReport() {
        let month = this.state.isPublish ? this.state.month : -1;
        this.props.history.push({
            pathname: '/MonthlyReport/' + month + '/' + this.state.isStatisticsRequest
        });
    }

    goAssetManage() {
        this.props.history.push('/utilization/assetManage');
    }

    goServiceTracking() {
        this.props.history.push('/utilization/serviceTracking');
    }

    goTodo() {
        this.props.history.push('/utilization/todo');
    }

    render() {
        return <TabPage className="Utilization">
            <Cells>
                <Cell access onClick={this.goTodo.bind(this)}>
                    <CellHeader>
                        <img src={todo}/>
                    </CellHeader>
                    <CellBody>
                        <div className="item-hd">
                            <div className="type">预约</div>
                        </div>
                        <div className="content">需要您赴约的服务单</div>
                    </CellBody>
                    <CellFooter>
                        {this.state.todoNum == 0 ? '' : this.state.todoNum}
                    </CellFooter>
                </Cell>
                <Cell access onClick={this.goServiceTracking.bind(this)}>
                    <CellHeader>
                        <img src={tracking}/>
                    </CellHeader>
                    <CellBody>
                        <div className="item-hd">
                            <div className="type">爱宠</div>
                        </div>
                        <div className="content">查看您绑定的所有爱宠</div>
                    </CellBody>
                    <CellFooter>
                        {this.state.serviceNum == 0 ? '' : this.state.serviceNum}
                    </CellFooter>
                </Cell>
                
                <Cell className="lastCell">
                </Cell>
            </Cells>

            <Popup
                show={this.state.fullpage_show}
                onRequestClose={this.click.bind(this)}
                id="popup"
            >
                <div style={{height: '100vh', overflow: 'scroll'}}>
                    <div id="floatMenuList" className="menu-list">
                        <a href="#/serviceRequest" className="link-home">美容</a>
                        <a href="#/troubleRepairing" className="link-my">诊疗</a>
                    </div>
                </div>
            </Popup>

            <div id="floatMenu" className="float-menu" onClick={this.click.bind(this)}>
                <div className="plus">
                    <div className="cross"></div>
                </div>
            </div>
        </TabPage>
    }
}

export default withRouter(Utilization)
