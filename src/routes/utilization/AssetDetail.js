/**
 * Created by zhongfan on 2017/6/12.
 */
import React from 'react'
import './AssetDetail.scss'
import {
    ButtonArea,
    Button,
    Input,
    Cells,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
} from 'react-weui/build/packages'

import UtilizationModel from '../../models/Utilization'
import DateUtil from '../../utils/DateUtil'
import WorkSheetModel from '../../models/WorkSheet'
import {
    getAssetDetail,
    getAssetView
} from '../../services/seven/Asset'

import Title from 'react-title-component'

import BottomButtonGroup from '../../components/common/BottomButtonGroup';
import Page from "../../components/common/page";

class AssetDetail extends React.Component {

    constructor(props) {
        super(props);
        document.title = "资产详情";
        this.state = {
            permission: 'R',
            from: true,
            name: '',
            asset_status: {display_name: '', id: ''},
            lookUpDataSource: [],
            data: [],
            components: [],
        };
    }

    componentDidMount() {
        let params = this.props.match.params;
        if (params.from) {
            this.state.from = true;
        } else {
            this.state.from = false;
        }
        this.loadData(params.id, params.typeId);
    }

    loadData(id, typeId) {
        // UtilizationModel.getCiType(id, typeId, (components, result) => {
        //     this.setState({components: components, name: result.display_name, asset_status: result.asset_status});
        // })
        getAssetDetail(typeId, id).then(res => {
            let obj = JSON.parse(res);
            obj = obj.result;
            if (!obj) {
                getAssetDetail('686d3173-d259-4e6a-8fa5-7959d0a1a3c6', id).then(res => {
                    let obj = JSON.parse(res);
                    obj = obj.result;
                    this.state.permission = obj.permission;
                    this.getAssetView(typeId, obj);
                });
            } else {
                this.state.permission = obj.permission;
                this.getAssetView(typeId, obj);
            }
        })
    }

    getAssetView(typeId, obj) {
        getAssetView(typeId, obj).then(res => {
            let assetView = JSON.parse(res);
            let components = assetView.result.children[0].config.constructData;
            console.log(components);
            components = JSON.parse(components);
            let rules = (components.rules && components.rules.length) >= 1 ? components.rules[0] : [];
            console.log(rules);
            components = components.components;
            for (let j = 0; j < components.length; j++) {
                let val = obj[components[j].name];
                if (typeof(val) === "object") {
                    components[j].defaultValue = val.display_name;
                } else {
                    if (components[j].editor === 'datepicker') {
                        components[j].defaultValue = val ? DateUtil.defaultFormatAssertDate(val) : DateUtil.defaultFormateTime(new Date());
                    } else {
                        components[j].defaultValue = val;
                    }
                }

                if (rules.enable) {
                    let actionsConfig = rules.actionsConfig;
                    if (actionsConfig[components[j].name] && actionsConfig[components[j].name][0]) {
                        let hidden = actionsConfig[components[j].name][0].actions.changeVisibility.hidden;
                        if (hidden) {
                            components[j].hidden = true;
                        }
                    }
                }
                if (components[j].editor && (components[j].editor == 'group' || components[j].editor == 'table' || components[j].editor == 'twocolumn' ||
                        components[j].editor == 'radiogroup' ||
                        components[j].editor == 'checkbox' ||
                        components[j].editor.indexOf("column") > 0)) {
                    components[j].hidden = true;//过滤表格视图
                }
            }

            this.setState({components: components, name: obj.display_name, asset_status: obj.asset_status});
        });
    }

    toRepair() {
        let id = this.props.match.params.id;
        this.props.history.push({
            pathname: '/utilization/assetTroubleRepairing/' + id + "/" + this.state.name,
        });
    }

    toDeliver() {
        let id = this.props.match.params.id;
        this.props.history.push({
            pathname: '/utilization/assetDeliver/' + id,
        });
    }

    renderButton() {
        if (this.state.from) return;
        let stateName = this.state.asset_status ? this.state.asset_status.display_name : "未知";
        switch (stateName) {
            case '已报废':
            case '报废中':
            case '维修中':
                break;
            case '库存中':
                return this.state.permission === 'W' ?
                    <BottomButtonGroup
                        state='2'
                        positiveText='出库'
                        positiveIcon={require('../../../asset/assetdetail/deliver.svg')}
                        positiveClick={this.toDeliver.bind(this)}
                        negativeText='故障报修'
                        negativeIcon={require('../../../asset/assetdetail/trouble.svg')}
                        negativeClick={this.toRepair.bind(this)}/>
                    :
                    <BottomButtonGroup
                        state='1n'
                        negativeText='故障报修'
                        negativeIcon={require('../../../asset/assetdetail/trouble.svg')}
                        negativeClick={this.toRepair.bind(this)}/>;
            case '使用中':
            case '测试中':
            case '待入库':
                return <BottomButtonGroup
                    state='1n'
                    negativeText='故障报修'
                    negativeIcon={require('../../../asset/assetdetail/trouble.svg')}
                    negativeClick={this.toRepair.bind(this)}/>;
            default:
                break;
        }
    }

    render() {
        let params = this.props.match.params;
        return <Page>
            <Cells className="AssetDetail">
                <Title render="资产详情"/>
                <Cell className="title">
                    <CellHeader>
                        {this.state.name}
                    </CellHeader>
                    <CellBody>

                    </CellBody>
                    <CellFooter className="State">
                        {this.state.asset_status ? this.state.asset_status.display_name : "未知"}
                    </CellFooter>
                </Cell>
                {this.state.components.map((item, index) => (
                    item.hidden ?
                        '' : <Cell key={index}>
                            <CellHeader>
                                {item.label}
                            </CellHeader>
                            <CellBody>
                                {item.defaultValue ? item.defaultValue : ""}
                            </CellBody>
                        </Cell>
                ))}
                {this.renderButton()}
            </Cells>
        </Page>
    }
}

export default AssetDetail
