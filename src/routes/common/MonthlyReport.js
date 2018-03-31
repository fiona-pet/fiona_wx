/**
 * 微信月报 当前月
 * Created by zhongfan on 2017/7/25.
 */
import React from 'react';
import { Keyframes, Frame } from 'react-keyframes';

import './MonthlyReport.scss'

//导入echarts
const echarts = require('echarts/lib/echarts'); //必须
//饼图
require('echarts/lib/chart/pie');
// 柱状图
require('echarts/lib/chart/bar');
//标题插件
require('echarts/lib/component/title');

import ReactTouchEvents from "react-touch-events";
import { Line, Circle } from 'rc-progress';

import lwWx from '../../../asset/common/img/lw-wx.jpg'
import noData from '../../../asset/insight/monthlyNoData.svg'
import Loading from '../../components/common/Loading'
import Title, { flushTitle } from 'react-title-component'

import {
    getMonthlyTotal,
    getCountByCampusWithoutExtension,
    getCountByCampusWithExtensionTrue,
    getCountByCampusWithExtensionFalse,
    getCountByChannel,
    getCount,
    getCountForTrouble,
    getCountForRequest,
    getConfigByMonth
} from '../../services/insight'

import DateUtil from '../../utils/DateUtil'
import JsonUtil from '../../utils/JsonUtil'

class MonthlyReport extends React.Component {

    constructor(props){
        super(props);

        this.cur_page = 0;
        this.page_count = 7;

        this.state = {
            containerName:'slide_div',
            month: '',
            monthTitle:'',
            config: [],
            page_count: 0,
            isLoading: true,
            isEmpty: true,
            isSR: false,

            monthlyTotal: {},
            countByCampus: {},
            countByChannel: {},
            count: {},
            countForTrouble: {},
            countForRequest: {},
        }
    }

    componentDidMount() {
        let month = this.props.match.params.month;
        let isSR = this.props.match.params.isSR;
        if (month === undefined) {
            month = new Date().getTime();
        }
        if (isSR === undefined) {
            isSR = true
        }
        let now = new Date();
        if (month !== '-1') {
            now.setTime(month);
            this.setState({monthTitle:now.getMonth() + 1 + '月运维服务报告'})
        } else {
            this.setState({monthTitle:now.getMonth() + '月运维服务报告'})
        }
        this.setState({isSR});
        this.initConfig(month);
    }

    /**
     * 初始化配置信息
     */
    initConfig(month) {
        if (month === '-1') {
            this.setState({
                config: [-1],
                isLoading: false
            });
            return
        }
        getConfigByMonth(month).then(res => {
            let result = JSON.parse(res).result;
            if (result === undefined || result.config === undefined) {
                this.setState({
                    config: [-1],
                    isLoading: false
                });
                return
            }
            let config = JSON.parse(result.config);
            let count = 0;

            for (let i = 0; i < config.length; i++) {
                if (config[i].isshow) count++
            }
            this.setState({config: config});
            this.setState({page_count: count});
            //分别获取配置内第一天的0:00:00，以及最后一天的23:59:59的毫秒值
            let start = DateUtil.getStartOfThisMonth(month);
            let end = DateUtil.getEndOfThisMonth(month);
            this.init(start, end);

            document.querySelector('body').addEventListener('touchstart', this.bodyScroll(), false);
        })
    }

    /**
     * 月度总计信息
     * @param start 开始时间
     * @param end 结束时间
     */
    init(start, end) {
        getMonthlyTotal(start, end).then(res => {
            let countTotal = JSON.parse(res).result;
            if (!countTotal.length) {
                this.setState({isLoading: false});
                return
            }
            let total = 0;
            let trouble = 0;
            let request = 0;
            for (let i = 0; i < countTotal.length; i++) {
                let item = countTotal[i];
                total += item.countValue;
                if (item.classify.id === '1') {
                    trouble = item.countValue;
                }
                if (item.classify.id === '0') {
                    request = item.countValue
                }
            }
            this.setState({
                isLoading: false,
                isEmpty: false,
                monthlyTotal: {
                    total: total,
                    trouble: trouble,
                    request: request,
                    //保留整数部分，四舍五入
                    troublePercent: Math.round(trouble * 100 / total),
                    requestPercent: Math.round(request * 100 / total)
                }
            });
            let pieChart = echarts.init(this.refs.pieChart); //初始化echarts
            //设置options
            pieChart.setOption(this.pieOption(this.state.isSR === 'true'));
            //加载其它信息
            this.initByCampus(start, end);
            this.initByChannel(start, end);
            this.initCounts(start, end);
            this.initForTrouble(start, end);
            this.initForRequest(start, end);
        })
    }

    /**
     * 校区分布信息（生成）
     * @param start 开始时间
     * @param end 结束时间
     */
    initByCampus(start, end) {
        let config = this.state.config[1];
        console.log(config)
        let tag = config.extension_tag;
        let isSR = this.state.isSR;
        if (isSR === 'false' && this.state.config[5].isshow) {
            let count = this.state.page_count;
            this.setState({page_count: count - 1});
        }
        if (!config.isSetCondition) {
            getCountByCampusWithoutExtension(start, end, isSR).then(res => {
                let result = JSON.parse(res).result;
                if (result.length) {
                    this.setCampusData(result)
                }
            })
        } else {
            if (tag.field.is_extension) {
                getCountByCampusWithExtensionTrue(start, end,
                    tag.ci_type.id, tag.field.name).then(res => {
                    this.setCampusData(JSON.parse(res).result)
                })
            } else {
                getCountByCampusWithExtensionFalse(start, end,
                    tag.ci_type.id, tag.field.name).then(res => {
                    this.setCampusData(JSON.parse(res).result)
                })
            }
        }
    }

    /**
     * 校区分布信息（展示）
     * @param countByCampus
     */
    setCampusData(countByCampus) {
        if (!countByCampus.length) {
            let count = this.state.page_count;
            this.setState({page_count: count - 1});
            return
        }
        let data = [];
        for (let i = 0; i < countByCampus.length; i++) {
            let item = countByCampus[i];
            if (item.countValue !== 0) {
                let obj = {
                    value: item.countValue,
                    name: JsonUtil.getChildForMR(item, 'display_name') + ' ' + item.countValue
                };
                data.push(obj);
            }
        }
        this.setState({countByCampus: data});
        let config = this.state.config;
        if (config[1].isshow) {
            // let pieChartForArea = echarts.init(this.refs.pieChartForArea); //初始化echarts
            // pieChartForArea.setOption(this.pieChartForAreaOption())
        }
    }

    /**
     * 来源分布信息
     * @param start 开始时间
     * @param end 结束时间
     */
    initByChannel(start, end) {
        let isSR = this.state.isSR;
        getCountByChannel(start, end, isSR).then(res => {
            let countByChannel = JSON.parse(res).result;
            if (countByChannel.length === 0) {
                return
            }
            let data = {
                nameData: [],
                countData: []
            };
            for (let i = 0; i < countByChannel.length; i++) {
                let item = countByChannel[i];
                data.nameData.push(item.source !== undefined ? item.source.display_name : '其它');
                data.countData.push(item.countValue);
            }
            this.setState({countByChannel: data});
            // let barChartForSource = echarts.init(this.refs.barChartForSource) //初始化echarts
            // barChartForSource.setOption(this.barChartForSourceOption())
        })
    }

    /**
     * 所有 top5
     * @param start 开始时间
     * @param end 结束时间
     */
    initCounts(start, end) {
        getCount(start, end).then(res => {
            let count = JSON.parse(res).result;
            if (!count.length) {
                return
            }
            let top5 = [];
            let length = count.length >= 5 ? 5 : count.length;
            for (let i = 0; i < length; i++) {
                let item = count[i];
                top5.push({
                    name: item.service_catalog.display_name,
                    count: item.countValue,
                    percent: Math.round(item.countValue * 100 / this.state.monthlyTotal.total)
                })
            }
            this.setState({count: top5})
        })
    }

    /**
     * 故障top5
     * @param start 开始时间
     * @param end 结束时间
     */
    initForTrouble(start, end) {
        getCountForTrouble(start, end).then(res => {
            let countForTrouble = JSON.parse(res).result;
            if (!countForTrouble.length) {
                return
            }
            let top5 = [];
            let length = countForTrouble.length >= 5 ? 5 : countForTrouble.length;
            for (let i = 0; i < length; i++) {
                let item = countForTrouble[i];
                top5.push({
                    name: item.service_catalog.display_name,
                    count: item.countValue,
                    percent: Math.round(item.countValue * 100 / this.state.monthlyTotal.trouble)
                })
            }
            this.setState({countForTrouble: top5})
        })
    }

    /**
     * 请求top5
     * @param start 开始时间
     * @param end 结束时间
     */
    initForRequest(start, end) {
        getCountForRequest(start, end).then(res => {
            let countForRequest = JSON.parse(res).result;
            if (!countForRequest.length) {
                return
            }
            let top5 = [];
            let length = countForRequest.length >= 5 ? 5 : countForRequest.length;
            for (let i = 0; i < length; i++) {
                let item = countForRequest[i];
                top5.push({
                    name: item.service_catalog.display_name,
                    count: item.countValue,
                    percent: Math.round(item.countValue * 100 / this.state.monthlyTotal.request)
                })
            }
            this.setState({countForRequest: top5})
        })
    }

    bodyScroll(event){
        if (event) {
            event.preventDefault();
        }
    }

    componentWillUnmount() {
        document.querySelector('body').removeEventListener('touchstart',this.bodyScroll(), false);
    }

    /**
     * 背景星光效果
     * @returns {XML}
     */
    renderSpotLights() {
        return <Keyframes loop={true} component="pre" delay={0} style={{position: 'fixed' ,zIndex: 0,width: '100%',height: '100hv'}}>
            <Frame duration={100}>
                <svg width="100%" height="667px">
                    <circle id="Oval-2-Copy" fill="#CA9004" fillOpacity="0.1" cx="313.5" cy="5.5" r="1.5"/>
                    <circle id="Oval-2-Copy-7" fill="#BA8F2E" fillOpacity="0.1" cx="315" cy="168" r="1"/>
                    <circle id="Oval-2-Copy-13" fill="#348BB6" fillOpacity="0.1" cx="315" cy="357" r="1"/>
                    <circle id="Oval-2-Copy-19" fill="#EDEDED" fillOpacity="0.1" cx="27" cy="395" r="1"/>
                    <circle id="Oval-2-Copy-3" fill="#348BB6" fillOpacity="0.1" cx="210.5" cy="278.5" r="1.5"/>
                    <circle id="Oval-2-Copy-15" fill="#EDEDED" fillOpacity="0.1" cx="290" cy="382" r="2"/>
                    <circle id="Oval-2-Copy-16" fill="#CA9004" fillOpacity="0.1" cx="248" cy="470" r="1"/>
                    <circle id="Oval-2-Copy-22" fill="#EDEDED" fillOpacity="0.1" cx="3.5" cy="500.5" r="1.5"/>
                    <circle id="Oval-2-Copy-9" fill="#EDEDED" fillOpacity="0.1" cx="269" cy="295" r="2"/>
                </svg>
            </Frame>
            <Frame duration={100}>
                <svg width="100%" height="667px">
                    <circle id="Oval-2-Copy" fill="#CA9004" fillOpacity="0.3" cx="313.5" cy="5.5" r="1.5"/>
                    <circle id="Oval-2-Copy-13" fill="#348BB6" fillOpacity="0.3" cx="315" cy="357" r="1"/>
                    <circle id="Oval-2-Copy-18" fill="#EDEDED" fillOpacity="0.3" cx="105" cy="442" r="1"/>
                    <circle id="Oval-2-Copy-19" fill="#EDEDED" fillOpacity="0.3" cx="27" cy="395" r="1"/>
                    <circle id="Oval-2-Copy-3" fill="#348BB6" fillOpacity="0.3" cx="210.5" cy="278.5" r="1.5"/>
                    <circle id="Oval-2-Copy-15" fill="#EDEDED" fillOpacity="0.3" cx="290" cy="382" r="2"/>
                    <circle id="Oval-2-Copy-16" fill="#CA9004" fillOpacity="0.3" cx="248" cy="470" r="1"/>
                    <circle id="Oval-2-Copy-22" fill="#EDEDED" fillOpacity="0.3" cx="3.5" cy="500.5" r="1.5"/>
                    <circle id="Oval-2-Copy-9" fill="#EDEDED" fillOpacity="0.3" cx="269" cy="295" r="2"/>
                </svg>
            </Frame>
            <Frame duration={300}>
                <svg width="100%" height="667px">
                    <circle id="Oval-2-Copy" fill="#CA9004" fillOpacity="0.5" cx="313.5" cy="5.5" r="1.5"/>
                    <circle id="Oval-2-Copy-7" fill="#BA8F2E" fillOpacity="0.5" cx="315" cy="168" r="1"/>
                    <circle id="Oval-2-Copy-13" fill="#348BB6" fillOpacity="0.5" cx="315" cy="357" r="1"/>
                    <circle id="Oval-2-Copy-19" fill="#EDEDED" fillOpacity="0.5" cx="27" cy="395" r="1"/>
                    <circle id="Oval-2-Copy-3" fill="#348BB6" fillOpacity="0.5" cx="210.5" cy="278.5" r="1.5"/>
                    <circle id="Oval-2-Copy-15" fill="#EDEDED" fillOpacity="0.5" cx="290" cy="382" r="2"/>
                    <circle id="Oval-2-Copy-16" fill="#CA9004" fillOpacity="0.5" cx="248" cy="470" r="1"/>
                    <circle id="Oval-2-Copy-22" fill="#EDEDED" fillOpacity="0.5" cx="3.5" cy="500.5" r="1.5"/>
                    <circle id="Oval-2-Copy-9" fill="#EDEDED" fillOpacity="0.5" cx="269" cy="295" r="2"/>
                </svg>
            </Frame>
            <Frame duration={100}>
                <svg width="100%" height="667px">
                    <circle id="Oval-2-Copy" fill="#CA9004" fillOpacity="0.5" cx="313.5" cy="5.5" r="1.5"/>
                    <circle id="Oval-2-Copy-7" fill="#BA8F2E" fillOpacity="0.5" cx="315" cy="168" r="1"/>
                    <circle id="Oval-2-Copy-13" fill="#348BB6" fillOpacity="0.5" cx="315" cy="357" r="1"/>
                    <circle id="Oval-2-Copy-18" fill="#EDEDED" fillOpacity="0.5" cx="105" cy="442" r="1"/>
                    <circle id="Oval-2-Copy-19" fill="#EDEDED" fillOpacity="0.5" cx="27" cy="395" r="1"/>
                    <circle id="Oval-2-Copy-15" fill="#EDEDED" fillOpacity="0.5" cx="290" cy="382" r="2"/>
                    <circle id="Oval-2-Copy-16" fill="#CA9004" fillOpacity="0.5" cx="248" cy="470" r="1"/>
                    <circle id="Oval-2-Copy-22" fill="#EDEDED" fillOpacity="0.5" cx="3.5" cy="500.5" r="1.5"/>
                    <circle id="Oval-2-Copy-9" fill="#EDEDED" fillOpacity="0.5" cx="269" cy="295" r="2"/>
                </svg>
            </Frame>
            <Frame duration={100}>
                <svg width="100%" height="667px">
                    <circle id="Oval-2-Copy" fill="#CA9004" fillOpacity="0.7" cx="313.5" cy="5.5" r="1.5"/>
                    <circle id="Oval-2-Copy-7" fill="#BA8F2E" fillOpacity="0.7" cx="315" cy="168" r="1"/>
                    <circle id="Oval-2-Copy-13" fill="#348BB6" fillOpacity="0.7" cx="315" cy="357" r="1"/>
                    <circle id="Oval-2-Copy-18" fill="#EDEDED" fillOpacity="0.7" cx="105" cy="442" r="1"/>
                    <circle id="Oval-2-Copy-19" fill="#EDEDED" fillOpacity="0.7" cx="27" cy="395" r="1"/>
                    <circle id="Oval-2-Copy-3" fill="#348BB6" fillOpacity="0.7" cx="210.5" cy="278.5" r="1.5"/>
                    <circle id="Oval-2-Copy-16" fill="#CA9004" fillOpacity="0.7" cx="248" cy="470" r="1"/>
                    <circle id="Oval-2-Copy-22" fill="#EDEDED" fillOpacity="0.7" cx="3.5" cy="500.5" r="1.5"/>
                    <circle id="Oval-2-Copy-9" fill="#EDEDED" fillOpacity="0.7" cx="269" cy="295" r="2"/>
                </svg>
            </Frame>
            <Frame duration={100}>
                <svg width="100%" height="667px">
                    <circle id="Oval-2-Copy" fill="#CA9004" cx="313.5" cy="5.5" r="1.5"/>
                    <circle id="Oval-2-Copy-7" fill="#BA8F2E" cx="315" cy="168" r="1"/>
                    <circle id="Oval-2-Copy-13" fill="#348BB6" cx="315" cy="357" r="1"/>
                    <circle id="Oval-2-Copy-18" fill="#EDEDED" cx="105" cy="442" r="1"/>
                    <circle id="Oval-2-Copy-19" fill="#EDEDED" cx="27" cy="395" r="1"/>
                    <circle id="Oval-2-Copy-3" fill="#348BB6" cx="210.5" cy="278.5" r="1.5"/>
                    <circle id="Oval-2-Copy-15" fill="#EDEDED" cx="290" cy="382" r="2"/>
                    <circle id="Oval-2-Copy-16" fill="#CA9004" cx="248" cy="470" r="1"/>
                    <circle id="Oval-2-Copy-9" fill="#EDEDED" cx="269" cy="295" r="2"/>
                </svg>
            </Frame>
            <Frame duration={200}>
                <svg width="100%" height="667px">
                    <circle id="Oval-2-Copy" fill="#CA9004" fillOpacity="0.5" cx="313.5" cy="5.5" r="1.5"/>
                    <circle id="Oval-2-Copy-7" fill="#BA8F2E" fillOpacity="0.5" cx="315" cy="168" r="1"/>
                    <circle id="Oval-2-Copy-13" fill="#348BB6" fillOpacity="0.5" cx="315" cy="357" r="1"/>
                    <circle id="Oval-2-Copy-18" fill="#EDEDED" fillOpacity="0.5" cx="105" cy="442" r="1"/>
                    <circle id="Oval-2-Copy-19" fill="#EDEDED" fillOpacity="0.5" cx="27" cy="395" r="1"/>
                    <circle id="Oval-2-Copy-3" fill="#348BB6" fillOpacity="0.5" cx="210.5" cy="278.5" r="1.5"/>
                    <circle id="Oval-2-Copy-15" fill="#EDEDED" fillOpacity="0.5" cx="290" cy="382" r="2"/>
                    <circle id="Oval-2-Copy-16" fill="#CA9004" fillOpacity="0.5" cx="248" cy="470" r="1"/>
                    <circle id="Oval-2-Copy-22" fill="#EDEDED" fillOpacity="0.5" cx="3.5" cy="500.5" r="1.5"/>
                    <circle id="Oval-2-Copy-9" fill="#EDEDED" fillOpacity="0.5" cx="269" cy="295" r="2"/>
                </svg>
            </Frame>

            <Frame duration={200}>
                <svg width="100%" height="667px">
                    <circle id="Oval-2-Copy-6" fill="#EDEDED" cx="323.5" cy="86.5" r="1.5"/>
                    <circle id="Oval-2-Copy-23" fill="#3495B6" cx="1" cy="281" r="1"/>
                    <circle id="Oval-2-Copy-8" fill="#EDEDED" cx="321" cy="243" r="1"/>
                    <circle id="Oval-2-Copy-10" fill="#EDEDED" cx="320" cy="531" r="1"/>
                    <circle id="Oval-2-Copy-2" fill="#EDEDED" cx="97" cy="277" r="1"/>
                    <circle id="Oval-2-Copy-4" fill="#EDEDED" cx="234.5" cy="212.5" r="1"/>
                    <circle id="Oval-2-Copy-16" fill="#CA9004" cx="248" cy="470" r="1"/>
                    <circle id="Oval-2-Copy-22" fill="#EDEDED" cx="3.5" cy="500.5" r="1.5"/>
                    <circle id="Oval-2-Copy-8" fill="#EDEDED" cx="239" cy="295" r="2"/>
                </svg>
            </Frame>
            <Frame duration={200}>
                <svg width="100%" height="667px">
                    <circle id="Oval-2-Copy-6" fill="#EDEDED" fillOpacity="0.5" cx="323.5" cy="86.5" r="1.5"/>
                    <circle id="Oval-2-Copy-23" fill="#3495B6" fillOpacity="0.5" cx="1" cy="281" r="1"/>
                    <circle id="Oval-2-Copy-8" fill="#EDEDED" fillOpacity="0.5" cx="321" cy="243" r="1"/>
                    <circle id="Oval-2-Copy-10" fill="#EDEDED" fillOpacity="0.5" cx="320" cy="531" r="1"/>
                    <circle id="Oval-2-Copy-2" fill="#EDEDED" fillOpacity="0.5" cx="97" cy="277" r="1"/>
                    <circle id="Oval-2-Copy-4" fill="#EDEDED" fillOpacity="0.5" cx="234.5" cy="212.5" r="1"/>
                    <circle id="Oval-2-Copy-16" fill="#CA9004" fillOpacity="0.5" cx="248" cy="470" r="1"/>
                    <circle id="Oval-2-Copy-22" fill="#EDEDED" fillOpacity="0.5" cx="3.5" cy="500.5" r="1.5"/>
                    <circle id="Oval-2-Copy-8" fill="#EDEDED" fillOpacity="0.5" cx="239" cy="295" r="2"/>
                </svg>
            </Frame>
        </Keyframes>
    }

    /**
     * 动态文字效果
     * @param s
     */
    renderDynamicText(s) {
        return <div className="info">
            <Keyframes component="info">
                <Frame duration={300}><div className="color0">{s}</div></Frame>
                <Frame duration={60}><div className="color1">{s}</div></Frame>
                <Frame duration={60}><div className="color2">{s}</div></Frame>
                <Frame duration={60}><div className="color3">{s}</div></Frame>
                <Frame duration={60}><div className="color4">{s}</div></Frame>
                <Frame duration={60}><div className="color5">{s}</div></Frame>
                <Frame duration={60}><div className="color6">{s}</div></Frame>
                <Frame duration={60}><div className="color7">{s}</div></Frame>
                <Frame duration={60}><div className="color8">{s}</div></Frame>
                <Frame duration={60}><div className="color9">{s}</div></Frame>
                <Frame duration={60}><div className="color10">{s}</div></Frame>
                <Frame duration={60}><div className="color11">{s}</div></Frame>
                <Frame duration={60}><div className="color12">{s}</div></Frame>
                <Frame duration={60}><div className="color13">{s}</div></Frame>
                <Frame duration={60}><div className="color14">{s}</div></Frame>
                <Frame duration={300}><div className="color15">{s}</div></Frame>
            </Keyframes>
        </div>
    }

    shortCut(s, num) {
        if (typeof s === 'string') {
            return s.length > num ? s.subString(0, num + 1) + '…' : s;
        }
    }

    render() {
        let config = this.state.config;
        let isLoading = this.state.isLoading;
        let isEmpty = this.state.isEmpty;
        let isSR = (this.state.isSR === 'true');
        let totalNum = isSR ? this.state.monthlyTotal.total : this.state.monthlyTotal.trouble;
        if (!config.length || isLoading) {
            return <Loading/>
        }
        if (isEmpty) {
            return <div className="MonthlyReport">
                    <Title render={this.state.monthTitle}/>
                {this.renderSpotLights()}
                <img src={noData} style={{
                    marginTop:"35%",
                    marginLeft:"17.5%",
                    width:"70%",
                    height:"20%"
                }}/>
                <div className="noDataInfo">本月无统计数据</div>
            </div>
        }
        return (
            <div className="MonthlyReport">
                <Title render={this.state.monthTitle}/>
                {this.renderSpotLights()}
                <ReactTouchEvents
                    swipeTolerance={100}
                    onTap={ this.handleTap.bind(this) }
                    onSwipe={ this.handleSwipe.bind(this) }>

                    <div className={this.state.containerName}>
                        {config[0].isshow ?
                            <div className="slide_page_3 slide_page">
                                <div className="total">
                                    <div ref="pieChart" style={{paddingTop:"77px", paddingBottom:"24px",width: "100%", height: "195px"}}>
                                    </div>
                                    <div className="content">
                                        <div className="data">
                                            <Keyframes component="info" delay={100}>
                                                <Frame duration={30}>{Math.round(1 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(2 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(3 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(4 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(5 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(6 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(7 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(8 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(9 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(10 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(11 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(12 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(13 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(14 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(15 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(16 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(17 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(18 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(19 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(20 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(21 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(22 * totalNum / 24)}</Frame>
                                                <Frame duration={30}>{Math.round(23 * totalNum / 24)}</Frame>
                                                <Frame duration={100}>{totalNum}</Frame>
                                            </Keyframes>
                                        </div>
                                        <div className="title">{config[0].name}</div>
                                    </div>
                                </div>
                                {isSR ?
                                    <div>
                                        <div className="legend">
                                            <li className="li_bug_icon"><span className="title">故障报修</span><span className="data">{this.state.monthlyTotal.troublePercent + '%'}</span></li>
                                        </div>
                                        <div className="legend">
                                            <li className="li_request_icon"><span className="title">服务请求</span><span className="data">{this.state.monthlyTotal.requestPercent + '%'}</span></li>
                                        </div>
                                    </div>
                                    : ''
                                }
                                {this.renderDynamicText(config[0].tipInfo)}
                            </div>
                            : ''
                        }
                        {config[1].isshow && this.state.countByCampus.length?
                            <div className="slide_page_2 slide_page">
                                    <div className="title">{config[1].name}</div>
                                    <div ref="pieChartForArea" style={{paddingTop:"32px", width: "100%", height: "200px"}}>
                                    asd
                                    </div>
                                    {this.renderDynamicText(config[1].tipInfo)}
                            </div>
                            : ''
                        }
                        {config[2].isshow ?
                            <div className="slide_page_4 slide_page">
                                <div className="title">{config[2].name}</div>
                                <div ref="barChartForSource" style={{marginLeft:"-3.75%",textAlign: "center", width: "100%", height: "256px"}}/>
                                {this.renderDynamicText(config[2].tipInfo)}
                            </div>
                            : ''
                        }
                        {config[3].isshow ?
                            <div className="slide_page_5 slide_page">
                                <div className="title">{config[3].name}</div>
                                <div className="line_group">
                                    <div className="line_title">{"1. " + JsonUtil.getSimpleChild(this.state.count[0], 'name')}</div>
                                    <div className="line_data">{JsonUtil.getSimpleChild(this.state.count[0], 'count')}</div>
                                    <Line percent={JsonUtil.getSimpleChild(this.state.count[0], 'percent')} strokeColor="rgba(165,48,48,1)" trailColor="rgba(0,0,0,0.5)" trailWidth="4" strokeWidth="4" />
                                </div>
                                <div className="line_group">
                                    <div className="line_title">{"2. " + JsonUtil.getSimpleChild(this.state.count[1], 'name')}</div>
                                    <div className="line_data">{JsonUtil.getSimpleChild(this.state.count[1], 'count')}</div>
                                    <Line percent={JsonUtil.getSimpleChild(this.state.count[1], 'percent')} strokeColor="rgba(175,69,24,1)" trailColor="rgba(0,0,0,0.5)" trailWidth="4" strokeWidth="4" />
                                </div>
                                <div className="line_group">
                                    <div className="line_title">{"3. " + JsonUtil.getSimpleChild(this.state.count[2], 'name')}</div>
                                    <div className="line_data">{JsonUtil.getSimpleChild(this.state.count[2], 'count')}</div>
                                    <Line percent={JsonUtil.getSimpleChild(this.state.count[2], 'percent')} strokeColor="rgba(180,104,2,1)" trailColor="rgba(0,0,0,0.5)" trailWidth="4" strokeWidth="4" />
                                </div>
                                <div className="line_group">
                                    <div className="line_title">{"4. " + JsonUtil.getSimpleChild(this.state.count[3], 'name')}</div>
                                    <div className="line_data">{JsonUtil.getSimpleChild(this.state.count[3], 'count')}</div>
                                    <Line percent={JsonUtil.getSimpleChild(this.state.count[3], 'percent')} strokeColor="rgba(174,124,3,1)" trailColor="rgba(0,0,0,0.5)" trailWidth="4" strokeWidth="4" />
                                </div>
                                <div className="line_group">
                                    <div className="line_title">{"5. " + JsonUtil.getSimpleChild(this.state.count[4], 'name')}</div>
                                    <div className="line_data">{JsonUtil.getSimpleChild(this.state.count[4], 'count')}</div>
                                    <Line percent={JsonUtil.getSimpleChild(this.state.count[4], 'percent')} strokeColor="rgba(175,154,3,1)" trailColor="rgba(0,0,0,0.5)" trailWidth="4" strokeWidth="4" />
                                </div>
                                {this.renderDynamicText(config[3].tipInfo)}
                            </div>
                            : ''
                        }
                        {config[4].isshow ?
                            <div className="slide_page_6 slide_page">
                                <div className="title">{config[4].name}</div>
                                <div className="line_group">
                                    <div className="line_title">{"1. " + JsonUtil.getSimpleChild(this.state.countForTrouble[0], 'name')}</div>
                                    <div className="line_data">{JsonUtil.getSimpleChild(this.state.countForTrouble[0], 'count')}</div>
                                    <Line percent={JsonUtil.getSimpleChild(this.state.countForTrouble[0], 'percent')} strokeColor="rgba(165,48,48,1)" trailColor="rgba(0,0,0,0.3)" trailWidth="4" strokeWidth="4" />
                                </div>
                                <div className="line_group">
                                    <div className="line_title">{"2. " + JsonUtil.getSimpleChild(this.state.countForTrouble[1], 'name')}</div>
                                    <div className="line_data">{JsonUtil.getSimpleChild(this.state.countForTrouble[1], 'count')}</div>
                                    <Line percent={JsonUtil.getSimpleChild(this.state.countForTrouble[1], 'percent')} strokeColor="rgba(175,69,24,1)" trailColor="rgba(0,0,0,0.3)" trailWidth="4" strokeWidth="4" />
                                </div>
                                <div className="line_group">
                                    <div className="line_title">{"3. " + JsonUtil.getSimpleChild(this.state.countForTrouble[2], 'name')}</div>
                                    <div className="line_data">{JsonUtil.getSimpleChild(this.state.countForTrouble[2], 'count')}</div>
                                    <Line percent={JsonUtil.getSimpleChild(this.state.countForTrouble[2], 'percent')} strokeColor="rgba(180,104,2,1)" trailColor="rgba(0,0,0,0.3)" trailWidth="4" strokeWidth="4" />
                                </div>
                                <div className="line_group">
                                    <div className="line_title">{"4. " + JsonUtil.getSimpleChild(this.state.countForTrouble[3], 'name')}</div>
                                    <div className="line_data">{JsonUtil.getSimpleChild(this.state.countForTrouble[3], 'count')}</div>
                                    <Line percent={JsonUtil.getSimpleChild(this.state.countForTrouble[3], 'percent')} strokeColor="rgba(174,124,3,1)" trailColor="rgba(0,0,0,0.3)" trailWidth="4" strokeWidth="4" />
                                </div>
                                <div className="line_group">
                                    <div className="line_title">{"5. " + JsonUtil.getSimpleChild(this.state.countForTrouble[4], 'name')}</div>
                                    <div className="line_data">{JsonUtil.getSimpleChild(this.state.countForTrouble[4], 'count')}</div>
                                    <Line percent={JsonUtil.getSimpleChild(this.state.countForTrouble[4], 'percent')} strokeColor="rgba(175,154,3,1)" trailColor="rgba(0,0,0,0.3)" trailWidth="4" strokeWidth="4" />
                                </div>
                                {this.renderDynamicText(config[4].tipInfo)}
                            </div>
                            : ''
                        }
                        {isSR && config[5].isshow ?
                            <div className="slide_page_7 slide_page">
                                <div className="title">{config[5].name}</div>
                                <div className="line_group">
                                    <div className="line_title">{"1. " + JsonUtil.getSimpleChild(this.state.countForRequest[0], 'name')}</div>
                                    <div className="line_data">{JsonUtil.getSimpleChild(this.state.countForRequest[0], 'count')}</div>
                                    <Line percent={JsonUtil.getSimpleChild(this.state.countForRequest[0], 'percent')} strokeColor="rgba(80,56,156,1)" trailColor="rgba(0,0,0,0.5)" trailWidth="4" strokeWidth="4" />
                                </div>
                                <div className="line_group">
                                    <div className="line_title">{"2. " + JsonUtil.getSimpleChild(this.state.countForRequest[1], 'name')}</div>
                                    <div className="line_data">{JsonUtil.getSimpleChild(this.state.countForRequest[1], 'count')}</div>
                                    <Line percent={JsonUtil.getSimpleChild(this.state.countForRequest[1], 'percent')} strokeColor="rgba(50,89,164,1)" trailColor="rgba(0,0,0,0.5)" trailWidth="4" strokeWidth="4" />
                                </div>
                                <div className="line_group">
                                    <div className="line_title">{"3. " + JsonUtil.getSimpleChild(this.state.countForRequest[2], 'name')}</div>
                                    <div className="line_data">{JsonUtil.getSimpleChild(this.state.countForRequest[2], 'count')}</div>
                                    <Line percent={JsonUtil.getSimpleChild(this.state.countForRequest[2], 'percent')} strokeColor="rgba(38,105,166,1)" trailColor="rgba(0,0,0,0.5)" trailWidth="4" strokeWidth="4" />
                                </div>
                                <div className="line_group">
                                    <div className="line_title">{"4. " + JsonUtil.getSimpleChild(this.state.countForRequest[3], 'name')}</div>
                                    <div className="line_data">{JsonUtil.getSimpleChild(this.state.countForRequest[3], 'count')}</div>
                                    <Line percent={JsonUtil.getSimpleChild(this.state.countForRequest[3], 'percent')} strokeColor="rgba(18,120,158,1)" trailColor="rgba(0,0,0,0.5)" trailWidth="4" strokeWidth="4" />
                                </div>
                                <div className="line_group">
                                    <div className="line_title">{"5. " + JsonUtil.getSimpleChild(this.state.countForRequest[4], 'name')}</div>
                                    <div className="line_data">{JsonUtil.getSimpleChild(this.state.countForRequest[4], 'count')}</div>
                                    <Line percent={JsonUtil.getSimpleChild(this.state.countForRequest[4], 'percent')} strokeColor="rgba(3,148,170,1)" trailColor="rgba(0,0,0,0.5)" trailWidth="4" strokeWidth="4" />
                                </div>
                                {this.renderDynamicText(config[5].tipInfo)}
                            </div>
                            : ''
                        }
                        {config[6].isshow ?
                            <div className="slide_page_1 slide_page">
                                <div className="contact">
                                    <img className="qr" src={config[6].url.length ? config[6].url : lwWx}/>
                                    <div className="qr_title">{config[6].chatName}</div>
                                    <br/>
                                    <div className="contact_body">
                                        <div className="contact_item contact_item_phone"><div className="contact_icon phone_icon"/><div className="contact_item_info">{config[6].phone}</div></div>
                                        <br/>
                                        <div className="contact_item contact_item_email"><div className="contact_icon email_icon"/><div className="contact_item_info">{this.shortCut(config[6].email, 24)}</div></div>
                                        <br/>
                                        <div className="contact_item contact_item_location"><div className="contact_icon location_icon"/><div className="contact_item_info">{config[6].address}</div></div>
                                    </div>
                                </div>
                                {this.renderDynamicText(config[6].tipInfo)}
                            </div>
                            : ''
                        }
                    </div>
                </ReactTouchEvents>
            </div>
        );
    }

    handleTap() {

    }

    handleSwipe(direction) {
        switch (direction) {
            case "top":
                if(this.cur_page == this.state.page_count-1) return;
                this.cur_page++;
                this.setState({containerName:'slide_div slide_animate_up_' + this.cur_page});
                break;
            case "bottom":
                if(this.cur_page == 0) return;
                this.cur_page--;
                this.setState({containerName:'slide_div slide_animate_down_' + this.cur_page})
                break;
            case "left":
            case "right":
        }
        if (1 === this.cur_page){
            let pieChartForArea = echarts.init(this.refs.pieChartForArea); //初始化echarts
            pieChartForArea.setOption(this.pieChartForAreaOption())
        }
        if (2 === this.cur_page){
            let barChartForSource = echarts.init(this.refs.barChartForSource) //初始化echarts
            barChartForSource.setOption(this.barChartForSourceOption())
        }
    }

    pieChartForAreaOption(){
        return {
            series: [
                {
                    name:'访问来源',
                    type:'pie',
                    selectedMode: 'single',
                    hoverAnimation: false,
                    radius: ['15%', '20%'],

                    label: {
                        normal: {
                            position: 'inner',
                            show: false
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data:[
                        {value:1}
                    ]
                },
                {
                    name:'各校区服务总量',
                    type:'pie',
                    radius: ['20%', '50%'],
                    data:this.state.countByCampus
                }
            ]
        }
    }

    //一个基本的echarts图表配置函数
    pieOption(isSR) {
        const placeHolderStyle = {
            normal: {
                color: 'rgba(18,120,158,1)',//未完成的圆环的颜色
                label: {
                    show: false
                },
                labelLine: {
                    show: false,
                    radius:10,
                }
            },
            emphasis: {
                color: 'rgba(18,120,158,1)'//未完成的圆环的颜色
            }
        };
        const placeHolderStyle1 = {
            normal: {
                color: 'rgba(174,124,3,1)',//未完成的圆环的颜色
                label: {
                    show: false
                },
                labelLine: {
                    show: false,
                    radius:10,
                }
            },
            emphasis: {
                color: 'rgba(174,124,3,1)'//未完成的圆环的颜色
            }
        };

        const data = isSR ? [
                {value: this.state.monthlyTotal.troublePercent, name: "是",itemStyle: placeHolderStyle},
                {value: this.state.monthlyTotal.requestPercent, name: "否",itemStyle: placeHolderStyle1}
            ] : [{value: this.state.monthlyTotal.troublePercent, name: "是",itemStyle: placeHolderStyle}];

        return {
            series : [
                {
                    name: '比例',
                    type: 'pie',
                    radius: ['80%', '90%'],
                    avoidLabelOverlap: true,
                    hoverAnimation: false,
                    clockWise: false,
                    data: data, //传入外部的data数据
                    label: {
                        normal: {
                            show: false
                        },
                        emphasis: {
                            show: false
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    }
                }
            ]
        }
    } //

    //source bar option
    barChartForSourceOption(){
        let nameData = [];
        let countData = [];
        let countByChannel = this.state.countByChannel;
        for (let i = 0; i < countByChannel.length; i++) {
            let item = countByChannel[i];
            nameData.push(item.source !== undefined ? item.source.display_name : '其它');
            countData.push(item.countValue);
        }
        return {
            grid: {
                left: '3%',
                right: '4%',
                bottom: '5%',
                containLabel: true
            },
            xAxis : [
                {
                    show:true,
                    axisLine: { show: false },
                    axisTick: { show: false },
                    data : this.state.countByChannel.nameData,
                    axisLabel:{
                        textStyle:{
                            fontSize:"16",
                            color:"rgba(255,255,255,0.84)",
                            baseline:'top'
                        }
                    },

                }
            ],
            yAxis : [
                {
                    show:false,
                }
            ],
            series : [
                {
                    name:'服务渠道分布',
                    type:'bar',
                    barWidth: '30%',
                    label:{
                        normal:{
                            show:true,
                            position:'top',
                            formatter:'{c}',
                            textStyle:{
                                fontSize:"16",
                                color:'rgba(255,255,255,0.48)'
                            }
                        }
                    },
                    itemStyle:{
                        normal:{
                            barBorderRadius:100,
                            color:function(idx) {
                                let color = ['#3259A4','#2669A6','#12789E'];
                                return color[idx.dataIndex % color.length]
                            }
                        }
                    },
                    data:this.state.countByChannel.countData
                }
            ]
        }
    }
}

export default MonthlyReport;
