/**
 * Created by zhongfan on 2017/5/27.
 */
import React from 'react'
import './SolvePopup.scss'
import {
    Icon,
    ButtonArea,
    Button,
    Label,
    Popup,
    PopupHeader,
    FormCell,
    Form,
    Input,
    Checkbox,
    Radio,
    TextArea,
    Select,
    CellsTitle,
    Cells,
    Cell,
    CellHeader,
    CellFooter,
    CellBody, Preview, PreviewHeader, PreviewFooter, PreviewBody, PreviewItem, PreviewButton
} from 'react-weui/build/packages';
import Page from '../../components/common/page'
import JsonUtil from '../../utils/JsonUtil'
import {
    getAssetDetailForm,
    workorderActionExecute,
    getViewById,
    getActionById,
    getNodeIdByOrder
} from '../../services/utilization'
import WorkSheetModel from '../../models/WorkSheet'

import SingleSelect from '../../components/common/cmdb/SingleSelect'
import DynamicCell from '../../components/common/DynamicCell'
import DynamicButtonCell from '../../components/common/DynamicButtonCell'

const directory = "directory";
const user = "user";

class SolvePopup extends React.Component {
    constructor(props) {
        super(props);

        this.allData = [];

        this.state = {
            type: '',
            lookup_popUp: false,
            lookUpDataSource: [],
            desc: '',
            directory: {display_name: '请选择'},
            user: {display_name: '请选择'},
            isToastShown: false,
            isTipShown: true,
            tipText: '',
            index: '',
            selectedItem: {},
            components: [],
            dyComponents: [],
            detailData: {},
            id: this.props.match.params.id,
            interactionActionId: this.props.match.params.interactionActionId,
            actionId: this.props.match.params.actionId,
            typeId: this.props.match.params.typeId,
            action: {},
            interaction: {pageName: ""},
            ciType: '',
            nodeId: '',
        }
    }

    componentDidMount() {
        let params = this.props.match.params;
        console.log(params);
        this.loadData(params.id, params.interactionActionId, params.actionId);
    }

    loadData(id, interactionActionId, actionId) {
        getActionById(actionId).then(res => {
            let obj = JSON.parse(res).result;
            this.setState({interaction: obj.interaction})
        });
        console.log("======")
        console.log(interactionActionId)
        getViewById(interactionActionId).then(res => {
            let obj = JSON.parse(res);
            let widgetIds = JsonUtil.getChildren(obj, "widgetId");
            this.state.ciType = JsonUtil.getChildren(obj, "ci_type")[0];//会报空，需注意
            let widgetId = widgetIds[0];
            getAssetDetailForm([widgetId]).then(res => {
                let obj = JSON.parse(res);
                console.log("getViewById->getAssetDetailForm", obj);
                let components = obj.result.config.components;
                this.setState({components: components});
            });

        });
        getNodeIdByOrder(id).then(res => {
            let obj = JSON.parse(res);
            this.setState({nodeId: obj.result});
        });
    }

    chooseDirectory(item) {
        WorkSheetModel.getDirectory((list) => {
            this.setState({lookup_popUp: true, lookUpDataSource: list, type: directory});
            this.allData = list
        })
    }

    handleOKClick(item) {
        console.log(item);
        this.setState({lookup_popUp: false});
        if (!item.id) {
            return
        }
        if (this.state.type == user) {
            this.setState({user: item});
        } else if (this.state.type == directory) {
            this.setState({directory: item, serviceId: item.id});
        } else {
            let components = this.state.components;
            components.map(component => {
                if (component.name == this.state.selectedItem.name) {
                    component.defaultValue = item.display_name;
                    component.defaultId = item.id;
                }
            });
            this.setState({components: components})

            this.state.detailData[this.state.selectedItem.name] = item.id;
        }
    }

    handleCancelClick() {
        this.setState({lookup_popUp: false});
    }

    defaultId() {
        if (this.state.type == user) {
            return this.state.user.id
        } else if (this.state.type == directory) {
            return this.state.directory.id
        } else {
            return this.state.selectedItem.defaultId
        }
    }

    searchChange(value) {
        if (this.allData.length <= 0) {
            return
        }
        let data = this.allData.filter((item) => {
            return item.display_name.indexOf(value) != -1
        });
        console.log(data);
        this.setState({lookUpDataSource:data})
    }

    valueChange(value, name, type) {
        console.log(value, name, type);
        if (name) {
            if ('richtext' === type) {
                this.state.detailData[name] = "{\"ops\":[{\"insert\":\" " + value + "\"}]}";
            }
        }
    }

    cellClick(item) {
        this.setState({selectedItem: item});
        if (item.dataType === "LOOKUP") {
            WorkSheetModel.getLookupList(item.referenceType, (result) => {
                this.setState({lookup_popUp: true, lookUpDataSource: result.data, type: ''})
                this.allData = result.data
            })
        }
        if (item.dataType === "REFERENCE") {
            WorkSheetModel.getReferenceList(item.reference, (result) => {
                this.setState({lookup_popUp: true, lookUpDataSource: result.data, type: ''})
                this.allData = result.data
            })
        }
        if (item.editor === "userselector") {
            WorkSheetModel.getPreUserList((result) => {
                this.setState({lookup_popUp: true, lookUpDataSource: result.data, type: ''})
                this.allData = result.data
            })
        }
        if (item.editor === "roleselector") {
            WorkSheetModel.getPreRoleList((result) => {
                this.setState({lookup_popUp: true, lookUpDataSource: result.data, type: ''})
                this.allData = result.data
            })
        }
    }

    buttonClick(t, actionId) {
        this.state.detailData["type"] = this.state.ciType;

        let createData = [{"id": this.state.id, "type": this.state.typeId,"node": this.state.nodeId}, this.state.detailData];

        console.log("buttonClick", this.state.actionId, createData);

        workorderActionExecute([this.state.actionId, createData]).then(res => {
            let obj = JSON.parse(res);
            if (obj.result) {
                this.props.history.push('/utilization/todo');
            }
        });
    }

    cancelClick() {
        this.props.history.goBack();
    }

    render() {
        return <Page className="SolvePopup">
            <CellsTitle>
                {this.state.interaction.pageName}
            </CellsTitle>
            <Cells>
                {this.state.components.map((item, index) => {
                    return <DynamicCell key={index} type={item.editor} title={item.label} name={item.name}
                                        required={item.required}
                                        readonly={item.readonly}
                                        defaultValue={item.defaultValue ? item.defaultValue : ""}
                                        valueChange={this.valueChange.bind(this)}
                                        onClick={this.cellClick.bind(this, item)}
                    >

                    </DynamicCell>
                })}
                <Preview>
                    <PreviewFooter>
                        <PreviewButton primary onClick={this.buttonClick.bind(this)}>确认</PreviewButton>
                        <PreviewButton onClick={this.cancelClick.bind(this)}>取消</PreviewButton>
                    </PreviewFooter>
                </Preview>
            </Cells>
            <SingleSelect show={this.state.lookup_popUp} dataSource={this.state.lookUpDataSource}
                          handleOKClick={this.handleOKClick.bind(this)}
                          handleCancelClick={this.handleCancelClick.bind(this)}
                          searchChange={this.searchChange.bind(this)} defaultValue={this.defaultId()}
            />
        </Page>
    }
}

export default SolvePopup
