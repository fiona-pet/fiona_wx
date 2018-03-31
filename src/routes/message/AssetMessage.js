import React from 'react'
import './AssetMessage.scss'
import {
    Cells
} from 'react-weui/build/packages'
import MessageCell from '../../components/common/MessageCell'
import ScrollView  from '../../components/common/ScrollView'
import EngineerModel from '../../models/Engineer'
import Empty from '../../components/common/NoData'
import Page from '../../components/common/page';
import DataUtil from '../../utils/DateUtil'
import Title from 'react-title-component'

import {
    readMessage
} from "../../services/message"

class AssetMessage extends React.Component {
    constructor(props) {
        super(props)
        document.title = "资产消息";
        this.pageIndex = 1;

        this.state = {
            emptyShow: false,
            data: [],
        };
    }

    componentDidMount() {
        this.getAssetMessages(1);
    }

    getAssetMessages(pageIndex) {
        EngineerModel.getAssetMessages(pageIndex, true, (result, resIndex) => {
            let data = result.data;
            if (pageIndex !== 1) {
                data = this.state.data.concat(data);
            }
            this.setState({data: data,emptyShow: true});
            this.pageIndex = resIndex;
        });
    }

    loadMore() {
        this.getAssetMessages(this.pageIndex)
    }

    refresh() {
        this.getAssetMessages(1)
    }

    gotoDetail(item) {
        readMessage(item.id).then(() => {
            this.refresh();
            let items = JSON.parse(item.link);
            console.log(items);
            if (items.params === undefined) {
                this.props.history.push({
                    pathname: '/utilization/assetDetail/' + items.id + "/" + items.ci_type,
                });
            } else {
                this.props.history.push({
                    pathname: '/utilization/assetDetail/' + items.params.param.id + "/" + items.params.param.type.id
                });
            }

        })
    }

    render() {
        if (this.state.data.length <= 0) {
            return <div>
                <Title render="资产"/>
                <Empty
                    show={this.state.emptyShow}
                    src={'message'}
                    remind={'暂无消息'}/>
            </div>
        }
        return <Page className="AssetMessage">
            <Title render="资产"/>
            <ScrollView onDown={this.refresh.bind(this)} onUp={this.loadMore.bind(this)}>
                <Cells>
                    {this.state.data.map((item, index) => (
                            <MessageCell
                                content={item.content}
                                read={item.state === 1}
                                time={DataUtil.dateStringFormat(item.create_time)}
                                key={index} {...item}
                                onClick={this.gotoDetail.bind(this, item)}/>
                        ))}
                </Cells>
            </ScrollView>
        </Page>
    }
}

export default AssetMessage
