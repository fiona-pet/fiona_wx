import React from 'react'
import './ServiceMessage.scss'

import {
    Cells
} from 'react-weui/build/packages'
import MessageCell from '../../components/common/MessageCell'
import ScrollView  from '../../components/common/ScrollView'
import DataUtil from '../../utils/DateUtil'
import EngineerModel from '../../models/Engineer'
import Empty from '../../components/common/NoData'
import Title from 'react-title-component'

import {
    readMessage
} from "../../services/message"

class MonthlyMessage extends React.Component {
    constructor(props) {
        super(props);
        document.title = "月报消息";
        this.pageIndex = 1;
        this.state = {
            emptyShow: false,
            data: [],
        };
    }

    componentDidMount() {
        this.getServiceMessages(1);
    }

    getServiceMessages(pageIndex) {
        EngineerModel.getMonthlyMessages(pageIndex, true, (result, resIndex) => {
            let data = result.data;
            console.log(data)
            if (pageIndex != 1) {
                data = this.state.data.concat(data);
            }
            this.setState({data: data,emptyShow: true});
            this.pageIndex = resIndex;
        })
    }

    loadMore() {
        this.getServiceMessages(this.pageIndex)
    }

    refresh() {
        this.getServiceMessages(1)
    }

    goDetail(item) {
        // let items = JSON.parse(item);
        // this.props.history.push({
        //     pathname: '/utilization/orderDetail/' + items.params.param.id + "/" + ' ' + "/" + items.params.param.workorder_type + "/" + ' ' + "/" + "no state",
        // });
        readMessage(item.id).then(() => {
            this.refresh();
            let items = JSON.parse(item.link);
            this.props.history.push({
                pathname: '/MonthlyReport/' + items.month + "/" + items.isstatisticsrequest,
            });
        })
    }

    render() {
        if (this.state.data.length <= 0) {
            return <div>
                <Title render="微信月报"/>
                <Empty
                    show={this.state.emptyShow}
                    src={'message'}
                    remind={'暂无消息'}/>
            </div>
        }
        return <ScrollView className="AssetMessage" onDown={this.refresh.bind(this)} onUp={this.loadMore.bind(this)}>
            <Title render="微信月报"/>
            <Cells>
                {this.state.data.map((item, index) => (
                    <MessageCell
                        access
                        key={index}
                        time={DataUtil.dateStringFormat(item.create_time)}
                        content={item.content}
                        read={item.state === 1}
                        onClick={
                            this.goDetail.bind(this, item)
                        }/>
                ))}
            </Cells>
        </ScrollView>
    }
}

export default MonthlyMessage
