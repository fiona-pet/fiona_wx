import React from 'react'
import {
    Popup,
    PopupHeader,
    Panel,
    PanelHeader,
    PanelBody,
    PanelFooter,
    MediaBox,
    MediaBoxHeader,
    MediaBoxBody,
    MediaBoxTitle,
    MediaBoxDescription,
    MediaBoxInfo,
    MediaBoxInfoMeta,
    Cells,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
    Form,
    FormCell,
    Radio,
} from 'react-weui/build/packages';
import './ServiceTracking.scss'

import SearchHeader from '../../components/common/SearchHeader'
import WorkSheetCell from '../../components/common/WorkSheetCell'
import ScrollView  from '../../components/common/ScrollView'
import Title from 'react-title-component'
import Empty from '../../components/common/NoData'

import DataUtil from '../../utils/DateUtil'
import UtilizationModel from '../../models/Utilization'
import Auth from '../../models/Auth'

const trouble = require("../../../asset/utilization/trouble.svg");
const service = require("../../../asset/utilization/service.svg");

/**
 * 服务工单列表
 */
class ServiceTracking extends React.Component {
    constructor(props) {
        super(props);
        document.title = Auth.getUserType() == 1 ? "服务跟踪" : '我的服务单';

        this.pageIndex = 1;
        this.state = {
            statusTypes: ["37ea4a70-af77-4c1a-9422-7582afc0de41",
                "0eea99f2-d189-4875-8e23-2f326c1f8ca0",
                "a81aff23-31bb-4ea8-a03b-6d7fe74c58be"],
            data: [],
            emptyShow: false,
            totalNum: 0,
            faultNum: 0,
            requestNum: 0,
            statusType: '37ea4a70-af77-4c1a-9422-7582afc0de41',
            typeIndex: 0,
            showFilterPopup: false,
            showCreateMenuPopup: false,
            searchText: '',
            searchTextCopy: ''
        };
    }

    componentDidMount() {
        console.log("componentDidMount");
        this.initNum(this.state.searchText);

        this.getData(this.state.statusType, 1);
    }

    /**
     * 根据搜索关键字，获取数目统计
     * @param text 关键字
     */
    initNum(text) {
        this.state.searchTextCopy = text;
        let types = this.state.statusTypes;
        if (Auth.getUserType() === 0) {
            for (let i = 0; i < types.length; i++) {
                UtilizationModel.getUserServiceTrackingList(types[i], 1, text, (result) => {
                    let count = result.totalRecord;
                    this.setNum(types[i], count)
                })
            }
        } else {
            for (let i = 0; i < types.length; i++) {
                UtilizationModel.getServiceTrackingList(types[i], 1, text, (result) => {
                    let count = result.totalRecord;
                    this.setNum(types[i], count)
                })
            }
        }
    }

    /**
     * 赋值
     * @param type 数据类型
     * @param num 数目
     */
    setNum(type, num) {
        let types = this.state.statusTypes;
        switch (type) {
            case types[0]:
                this.setState({totalNum: num});
                break;
            case types[1]:
                this.setState({faultNum: num});
                break;
            case types[2]:
                this.setState({requestNum: num});
                break;
        }
    }

    getData(statusType, pageIndex) {
        if(Auth.getUserType() == 0){
            //34cbf33c-1ac1-11e8-8104-f738ca959ff0 教育包
            //0071d586-8712-11e7-a655-1b8193ef95eb 普通包
            UtilizationModel.getUserServiceTrackingList('0071d586-8712-11e7-a655-1b8193ef95eb', pageIndex, this.state.searchText, (result, resIndex) => {
                let data = result.data;
                console.log(data)
                if (pageIndex != 1) {
                    data = this.state.data.concat(data);
                }

                if(resIndex > 1 && result.data != undefined && result.data.length == 0){
                    this.props.showMessage("没有更多了", "info");
                }

                this.setNum(statusType, result.totalRecord);
                this.setState({data: data, emptyShow: true});
                this.pageIndex = resIndex;
            })
        }else{
            UtilizationModel.getServiceTrackingList(statusType, pageIndex, this.state.searchText, (result, resIndex) => {
                let data = result.data;
                if (pageIndex != 1) {
                    data = this.state.data.concat(data);
                }

                if(resIndex > 1 && result.data != undefined && result.data.length == 0){
                    this.props.showMessage("没有更多了", "info");
                }

                this.setNum(statusType, result.totalRecord);
                this.setState({data: data, emptyShow: true});
                this.pageIndex = resIndex;
            })
        }
    }

    goServiceRequest() {
        this.props.history.push('/serviceRequest');
    }

    goTroubleRepairing() {
        this.props.history.push('/troubleRepairing');
    }

    hideFilterPopup() {
        this.setState({
            showFilterPopup: false,
        });
    }


    showFilterPopup() {
        if (this.state.searchText !== this.state.searchTextCopy) {
            this.initNum(this.state.searchText);
        }
        this.setState({
            showFilterPopup: true,
        });
    }

    hideCreateMenuPopup() {
        this.setState({
            showCreateMenuPopup: false,
        });
    }

    showCreateMenuPopup() {
        this.setState({
            showCreateMenuPopup: true,
        });
    }

    loadMore() {
        this.getData(this.state.statusType, this.pageIndex)
    }

    refresh() {
        this.getData(this.state.statusType, 1)
    }

    handleRadioClick(typeParams, index) {
        this.pageIndex = 1;
        this.setState({
            showFilterPopup: false,
            typeIndex: index,
            statusType: typeParams,
        });
        this.getData(typeParams, 1);
    }

    searchChange(value) {
        if ('' === value) {
            this.state.searchText = value;
            this.getData(this.state.statusType, 1)
        }
    }

    searchSubmit(text) {
        this.state.searchText = text;
        console.log(text);
        this.getData(this.state.statusType, 1)
    }

    goDetail(item) {
        console.log(item);
        this.props.history.push({
            pathname: '/utilization/orderDetail/' + item.id + "/" + ((item.classify.id == 1) ? '故障' : '请求') + "/" + item.type.id + "/" + item.service_catalog.display_name + "/" + (item.flow_status ? item.flow_status.display_name : "no state"),
        });
    }

    renderFilterPopup() {
        let {showFilterPopup, statusType, typeIndex} = this.state;
        // if (!statusTypes.length) {
        //     return null;
        // }
        return (
            <Popup
                className="filter-popup slide-down"
                show={showFilterPopup}
                onRequestClose={this.hideFilterPopup.bind(this)}
            >
                <Panel>
                    <PanelHeader>筛选</PanelHeader>
                    <PanelBody>
                        <MediaBox type="small_appmsg">
                            <Form radio>
                                <FormCell
                                    radio onClick={this.handleRadioClick.bind(this, this.state.statusTypes[0], 0)}>
                                    <CellBody>全部{"(" + this.state.totalNum + ")"}</CellBody>
                                    <CellFooter>
                                        <Radio name="typeIndex" defaultChecked={0 === typeIndex}/>
                                    </CellFooter>
                                </FormCell>
                            </Form>
                            <Form radio>
                                <FormCell
                                    radio onClick={this.handleRadioClick.bind(this, this.state.statusTypes[1], 1)}>
                                    <CellBody>故障{"(" + this.state.faultNum + ")"}</CellBody>
                                    <CellFooter>
                                        <Radio name="typeIndex" defaultChecked={1 === typeIndex}/>
                                    </CellFooter>
                                </FormCell>
                            </Form>
                            <Form radio>
                                <FormCell
                                    radio onClick={this.handleRadioClick.bind(this, this.state.statusTypes[2], 2)}>
                                    <CellBody>请求{"(" + this.state.requestNum + ")"}</CellBody>
                                    <CellFooter>
                                        <Radio name="typeIndex" defaultChecked={2 === typeIndex}/>
                                    </CellFooter>
                                </FormCell>
                            </Form>
                        </MediaBox>
                    </PanelBody>
                </Panel>
            </Popup>
        );
    }

    renderCreateMenuPopup() {
        let {showCreateMenuPopup, statusTypes, typeIndex} = this.state;
        // if (!statusTypes.length) {
        //     return null;
        // }
        return (
            <Popup
                className="filter-popup slide-down"
                show={showCreateMenuPopup}
                onRequestClose={this.hideCreateMenuPopup.bind(this)}
            >
                <Panel>
                    <PanelHeader>新建</PanelHeader>
                    <PanelBody>
                        <MediaBox type="small_appmsg">
                            <Form radio>
                                <FormCell
                                    radio
                                    onClick={this.goTroubleRepairing.bind(this)}
                                >
                                    <CellHeader><img className="image" src={trouble}/></CellHeader>
                                    <CellBody>故障报修</CellBody>
                                    <CellFooter>
                                        <Radio name="typeIndex"/>
                                    </CellFooter>
                                </FormCell>
                            </Form>
                            <Form radio>
                                <FormCell
                                    radio
                                    onClick={this.goServiceRequest.bind(this)}
                                >
                                    <CellHeader><img className="image" src={service}/></CellHeader>
                                    <CellBody>服务申请</CellBody>
                                    <CellFooter>
                                        <Radio name="typeIndex"/>
                                    </CellFooter>
                                </FormCell>
                            </Form>
                        </MediaBox>
                    </PanelBody>
                </Panel>
            </Popup>
        );
    }

    render() {
        return <div className="ServiceTracking">
            <SearchHeader filter={this.showFilterPopup.bind(this)} create={this.showCreateMenuPopup.bind(this)}
                          onChange={this.searchChange.bind(this)} onSubmit={this.searchSubmit.bind(this)}
                          isFilter={this.state.typeIndex != 0}
            />
            <ScrollView onDown={this.refresh.bind(this)} onUp={this.loadMore.bind(this)} className={Auth.getUserType() == 0 ? "user":"engineer"}>
                <Cells>
                    {this.state.data.length ? this.state.data.map((item, index) => (
                            <WorkSheetCell title={item.service_catalog ? item.service_catalog.display_name : "no title"}
                                           type={(item.classify.id == 1) ? 'trouble' : 'service'}
                                           state={item.flow_status ? item.flow_status.display_name : "no state"}
                                           describe={item.apply_description}
                                           engineer={Auth.getUserType() == 0 ? (item.actual_handler ? item.actual_handler.display_name : '-') : (item.apply_user ? item.apply_user.display_name : "no engineer")}
                                           time={DataUtil.dateStringFormat(item.create_time)}
                                           onClick={this.goDetail.bind(this, item)} key={index}
                                           priority={item.priority_group ? item.priority_group.display_name ? item.priority_group.display_name : '' : ''}
                            />
                        )) : <Empty
                            show={this.state.emptyShow}
                            src={'order'}
                            remind={'暂无工单'}/>}
                </Cells>
                <div style={this.state.data.length <= 6 ? {height:'22px'} : {height:'0px'}}></div>
            </ScrollView>
            {this.renderCreateMenuPopup()}
            {this.renderFilterPopup()}
        </div>
    }
}
export default ServiceTracking
