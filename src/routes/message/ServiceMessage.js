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
import Page from '../../components/common/page';
import {
    readMessage
} from "../../services/message"
import Auth from '../../models/Auth'

import Title from 'react-title-component'

class ServiceMessage extends React.Component {
    constructor(props) {
        super(props);
        document.title = Auth.getUserType() == 0 ? "我的消息" : "服务单";
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
        EngineerModel.getServiceMessages(pageIndex, true, (result, resIndex) => {
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
        console.log("gotoDetail")
        readMessage(item.id).then(() => {
            this.refresh();
            let items = JSON.parse(item.link);
            this.props.history.push({
                pathname: '/utilization/orderDetail/' + items.params.param.id + "/" + ' ' + "/" + items.params.param.workorder_type + "/" + ' ' + "/" + "no state",
            });
        })
    }

    render() {
        if (this.state.data.length <= 0) {
            return <div>
                <Empty
                show={this.state.emptyShow}
                src={'message'}
                remind={'暂无消息'}/>
            </div>
        }
        return <Page className="AssetMessage">
            <ScrollView onDown={this.refresh.bind(this)} onUp={this.loadMore.bind(this)}>
                <Cells>
                    {this.state.data.map((item, index) => (
                            <MessageCell key={index}
                                         time={DataUtil.dateStringFormat(item.create_time)}
                                         content={item.content}
                                         read={item.state === 1}
                                         onClick={this.goDetail.bind(this, item)} access/>
                        ))}
                </Cells>
            </ScrollView>
        </Page>
    }
}

export default ServiceMessage
