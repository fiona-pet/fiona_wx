/**
 * Created by sufei on 2017/7/25.
 * 选择日期
 */
import React from 'react';
import {
    Cells,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
    Picker,
    Toast,
} from 'react-weui/build/packages';
import Page from '../../components/common/page'
import Title from 'react-title-component'
import {
    getHistoryConfigs
} from '../../services/insight'
import DateUtil from '../../utils/DateUtil'
import {withRouter} from "react-router-dom";

class SelectDate extends React.Component {

    constructor(props) {
        super(props);
        document.title = "时间选择";
        this.state = {
            years: '',
            month: '',
            date: [],
            date_show: false,
            date_value: '',
            date_group: [
                {
                    items: [{label: '2013年'}, {label: '2014年'}, {label: '2015年'}, {label: '2016年'}, {label: '2017年',}, {label: '2018年'}, {label: '2019年'}, {label: '2020年'}, {label: '2021年'},
                        {label: '2022年'}, {label: '2023年'}, {label: '2024年'}, {label: '2025年'}, {label: '2026年'}, {label: '2027年'}, {label: '2028年'}, {label: '2029年'}, {label: '2030年'},]
                },
                {
                    items: [{label: '01月'}, {label: '02月',}, {label: '03月'}, {label: '04月'}, {label: '05月'}, {label: '06月'},
                        {label: '07月'}, {label: '08月'}, {label: '09月'}, {label: '10月'}, {label: '11月'}, {label: '12月'}
                    ]
                }
            ],
        }
    }

    componentDidMount() {
        getHistoryConfigs(24).then(res => {
            let data = JSON.parse(res).result;

            let items1 = [];
            let items2 = [];

            for (var i in  data) {
                let a = DateUtil.defaultFormateTime(data[i].month).substr(0, 5);
                let b = DateUtil.defaultFormateTime(data[i].month).substr(5, 3);
                if (items1.length != 0) {
                    let ishave = true;
                    for (var m in  items1) {
                        if (items1[m].label == a) {
                            ishave = false;
                            break;
                        }
                    }
                    if (ishave)
                        items1.push({label: a});
                } else {
                    items1.push({label: a});
                }
                if (items2.length != 0) {
                    let ishave = true;
                    for (var m in  items2) {
                        if (items2[m].label == b) {
                            ishave = false;
                            break;
                        }
                    }
                    if (ishave)
                        items2.push({label: b});
                } else {
                    items2.push({label: b});
                }
            }

            if (data.length > 6) {
                data = data.slice(0, 6);
            }

            this.setState({date: data, date_group: [{items: items1.reverse()}, {items: items2.reverse()}]});

        });
    }

    hide() {
        this.setState({
            picker_show: false,
            date_show: false,
        })
    }


    render() {
        return <Page>
            <Title render="微信历史月报"/>
            <div style={{paddingLeft: '12'}}>
                选择月份
            </div>

            <Cells>

                {this.state.date.map((item, index) => (
                    <Cell access key={index}>
                        <CellBody onClick={e => {
                            this.props.history.push({pathname: '/MonthlyReport/' + item.month + '/' + item.isstatisticsrequest});
                        }}>
                            {DateUtil.defaultFormateTime(item.month)}
                        </CellBody>
                        <CellFooter/>
                    </Cell>
                ))}
                {
                    this.state.date ? this.state.date.length >= 6 ?
                            <Cell>
                                <CellBody onClick={e => {
                                    e.preventDefault()
                                    this.setState({date_show: true})
                                }}>
                                    选择查看月份
                                </CellBody>
                            </Cell> : '' : ''
                }
            </Cells>


            <Picker
                lang={{rightBtn: '确定', leftBtn: '取消'}}
                onChange={selected => {
                    let value = ''
                    selected.forEach((s, i) => {
                        value = this.state.date_group[i]['items'][s].label
                        if (i == 0) {
                            this.setState({
                                years: value.replace('年', '-'),
                            })
                        } else {
                            this.setState({
                                month: value.replace('月', '-'),
                            })
                        }
                    })
                    this.setState({
                        date_show: false
                    })
                    this.props.history.push({pathname: '/MonthlyReport/' + (new Date(this.state.years + this.state.month + '01 00:00:00')).getTime() + '/false'});
                }}
                defaultSelect={[0, 0]}
                groups={this.state.date_group}
                show={this.state.date_show}
                onCancel={e => this.setState({date_show: false})}
            />
        </Page>
    }
}

export default withRouter(SelectDate);
