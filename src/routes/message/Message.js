/**
 * Created by zhongfan on 2017/5/18.
 */
import React from 'react'
import './Message.scss'
import {
    Badge, Cells, Cell, CellBody, CellFooter, CellHeader, CellsTitle,
} from 'react-weui/build/packages'
import {withRouter} from "react-router-dom"
import EngineerModel from '../../models/Engineer'
import TabPage from '../../components/common/layout/TabPage'
import DateUtil from "../../utils/DateUtil"

const msg_asset = require('../../../asset/message/msg_asset.png');
const msg_service = require('../../../asset/message/msg_service.png');
const msg_monthly = require('../../../asset/message/msg_monthly.svg');


class Message extends React.Component {
    constructor(props) {
        super(props);
        document.title = "消息"
        this.state = {
            messageAssetNum: 0,
            messageServicesNum: 0,
            messageMonthlyNum:0,
            messageAssetDigest: '',
            messageAssetTime:'',
            messageServicesDigest: '',
            messageServicesTime: '',
            messageMonthlyDigest:'',
            messageMonthlyTime: '',
        }
    }

    componentDidMount() {
        this.getMessageNum();
    }

    toAssetMessage() {
        this.props.history.push('/message/assetMessage');
    }

    toServiceMessage() {
        this.props.history.push('/message/serviceMessage');
    }
    toMonthlyMessage() {
        this.props.history.push('/message/MonthlyMessage');
    }

    getMessageNum() {
        EngineerModel.getServiceMessages(1, false, (result) => {
            let data = result;
            this.setState({
                messageServicesNum: data.totalRecord,
                messageServicesDigest: data.data.length ? this.shortCut(data.data[0].content, 16) : '',
                messageServicesTime: data.data.length ? data.data[0].create_time : '',
            });
        });
        EngineerModel.getAssetMessages(1, false, (result) => {
            let data = result;
            this.setState({
                messageAssetNum: data.totalRecord,
                messageAssetDigest: data.data.length ? this.shortCut(data.data[0].content, 16) : '',
                messageAssetTime: data.data.length ? data.data[0].create_time : '',
            });
        });
        EngineerModel.getMonthlyMessages(1, false, (result) => {
            let data = result;
            this.setState({
                messageMonthlyNum: data.totalRecord,
                messageMonthlyDigest: data.data.length ? this.shortCut(data.data[0].content, 16) : '',
                messageMonthlyTime: data.data.length ? data.data[0].create_time : '',
            });
        });
    }

    shortCut(s, num) {
        return s.length >= num ? s.slice(0, num) + '…' : s
    }

    render() {
        return <TabPage className="Message">
            <Cells>
                <Cell onClick={this.toServiceMessage.bind(this)}>
                    <CellHeader>
                        <img src={msg_service}/>
                        {this.state.messageServicesNum == 0 ? null :
                            <Badge>{this.state.messageServicesNum > 99 ? '99+' : this.state.messageServicesNum}</Badge>}
                    </CellHeader>
                    <CellBody>
                        <div className="item-hd">
                            <div className="type">活动优惠</div>
                            <div className="time">{this.state.messageServicesNum == 0
                                ? ""
                                : DateUtil.dateStringFormat(this.state.messageServicesTime)}</div>
                        </div>
                        <div className="content">暂无消息</div>
                    </CellBody>
                    <CellFooter>
                    </CellFooter>
                </Cell>
                <Cell className="lastCell">
                </Cell>
            </Cells>
        </TabPage>
    }
}

export default withRouter(Message)
