import React from 'react'
import {
    CellsTitle, Cells, Cell, CellBody, CellFooter, CellHeader
} from 'react-weui/build/packages'
import './User.scss'
import Page from '../../components/common/page'
import Cookie from '../../core/Cookie';
import EngineerModel from '../../models/Engineer'
import UtilizationModel from '../../models/Utilization'

import {withRouter} from "react-router-dom";

const user_background = require("../../../asset/user/user_background.png");
const ico_service = require("../../../asset/user/ico-service.svg");
const ico_baoxiu = require("../../../asset/user/ico-baoxiu.svg");

class User extends React.Component {
    constructor(props) {
        super(props);

        document.title = "用户";

        this.state = {
            avatar: user_background,//头像
            name: '',//显示名
            serviceNum: 0,//
            messageNum: 0
        }
    }

    componentDidMount() {
        let user = Cookie.getUser();
        if (user.type === "0") {
            this.setState({avatar:user.avatar, name:user.name});
        }else {
            this.props.history.replace('/login');
        }


        let canvas = document.getElementById("background-draw");
        let cxt = canvas.getContext("2d");

        cxt.width = 375;
        cxt.height = canvas.height;

        //实心三角形
        cxt.beginPath();
        cxt.moveTo(-10, cxt.height);
        cxt.lineTo(cxt.width, 0);
        cxt.lineTo(cxt.width, cxt.height);
        cxt.closePath();
        cxt.fillStyle = "#ffffff";
        cxt.fill();

        this.getMessageNum();
    }

    getMessageNum() {
        EngineerModel.getServiceMessages(1, false, (result) => {
            this.setState({messageNum: result.totalRecord});
        });

        UtilizationModel.getUserServiceTrackingList('37ea4a70-af77-4c1a-9422-7582afc0de41', 1, '', (result) => {
            this.setState({serviceNum: result.totalRecord});
        });
    }

    goServiceRequest() {
        this.props.history.push('/serviceRequest');
    }

    goTroubleRepairing() {
        this.props.history.push('/troubleRepairing');
    }

    goServiceTracking() {
        this.props.history.push('/utilization/serviceTracking');
    }

    goServiceMessage() {
        this.props.history.push('/message/serviceMessage');
    }

    /**
     * 前往我页面 测试用
     */
    toProfile() {
        this.props.history.push({
            pathname:'/profile/1'
        })
    }

    render() {
        return <div className="User">
            <Page>
                <CellsTitle>
                    <div width="100px">
                        <canvas id="background-draw">
                        </canvas>
                    </div>
                    <table>
                        <tr className="UserInfo">
                            <td className="UserName">
                                <div>
                                    <div className="avatar">
                                        <img src={this.state.avatar} onClick={this.toProfile.bind(this)}/>
                                    </div>
                                    &nbsp;
                                </div>
                                <div>
                                    {this.state.name}
                                </div>
                            </td>
                            <td className="ServiceReqestNum" onClick={this.goServiceTracking.bind(this)}>
                                <div>
                                    {this.state.serviceNum}
                                </div>
                                <div className="TabTitle">
                                    我的服务单
                                </div>
                            </td>
                            <td className="MessageNum" onClick={this.goServiceMessage.bind(this)}>
                                <div>
                                    {this.state.messageNum}
                                </div>
                                <div className="TabTitle">
                                    我的消息
                                </div>
                            </td>
                        </tr>
                    </table>
                </CellsTitle>
                <Cells>
                    <Cell onClick={this.goTroubleRepairing.bind(this)}>
                        <CellBody>
                            <div className="title">
                                故障报修
                            </div>
                            <div className="describe">
                                快速提交您的故障问题
                            </div>
                        </CellBody>
                        <CellFooter>
                            <img src={ico_baoxiu}/>
                        </CellFooter>
                    </Cell>
                    <Cell onClick={this.goServiceRequest.bind(this)}>
                        <CellBody>
                            <div className="title">
                                服务申请
                            </div>
                            <div className="describe">
                                快速提交您的服务申请
                            </div>
                        </CellBody>
                        <CellFooter>
                            <img src={ico_service}/>
                        </CellFooter>
                    </Cell>
                </Cells>
            </Page>
        </div>
    }
}

export default withRouter(User)
