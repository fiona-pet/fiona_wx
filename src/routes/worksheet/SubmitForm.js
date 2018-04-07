/**
 * Created by zhongfan on 2017/5/27.
 */
import React from 'react'
import './SubmitFrom.scss'
import '../../components/common/cells/TextCell/TextCell.scss'
import '../../components/common/DynamicCells.scss'
import {
    Icon,
    ButtonArea,
    Button,
    Label,
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
    CellBody,
    Gallery,
    GalleryDelete,
    Dialog,
} from 'react-weui/build/packages';
import TextCell from '../../components/common/cells/TextCell/TextCell'
import DynamicCells from '../../components/common/DynamicCells'
import Uploader from '../../components/common/Uploader'
import {
    getNodeId,
    workorderActionExecute,
    getOrderId,
    getWorkOrderType,
    getNodeByServiceCatalog,
    upload,
    deleteFile
} from '../../services/utilization'
import WorkSheetModel from '../../models/WorkSheet'
import SingleSelect from '../../components/common/cmdb/SingleSelect'
import MultiSelect from '../../components/common/cmdb/MultiSelect'
import DynamicCell from '../../components/common/DynamicCell'
import DynamicButton from '../../components/common/DynamicButton'
import Auth from '../../models/Auth'

import Page from '../../components/common/page'

const directory = "directory";
const user = "user";
const FAULT_CI_TYPE = '0eea99f2-d189-4875-8e23-2f326c1f8ca0';//表示故障单的id

//请求服务单
class SubmitFrom extends React.Component {
    constructor(props) {
        super(props);

        document.title = "填写工单";

        this.allData = [];
        this.orderId = '';
        this.nodeId = '';
        this.processId = '';
        this.workOrderType = '';
        this.catalogId = '';
        this.catalogName = '';
        this.pageIndex = 1;
        this.ciTypes = [];
        this.rules = [];

        this.state = {
            demoFiles: [],
            type: '',
            id: '',
            desc: '',
            directory: {display_name: '请选择'},
            user: {display_name: Auth.getUser().name, id: Auth.getId()},
            isToastShown: false,
            isTipShown: true,
            isUploaderShown: false,//如果是请求单，不显示上传附件
            tipText: '',
            index: '',
            components: [],
            lookup_popUp: false,
            multi_lookup_popUp: false,
            lookUpDataSource: [],
            selectedItem:{editor: ''},
            dynamicButtons: [],
            showAlert: false,
            alert: {
                content: '',
                buttons: [
                    {
                        label: '确定',
                        onClick: this.hideAlert.bind(this)
                    }
                ]
            },
        }
    }

    
    showAlert(msg) {
        this.setState({
            showAlert: true,
            alert: Object.assign(this.state.alert, {content: msg}),
        });
    }

    hideAlert() {
        this.setState({showAlert: false});
    }
    
    cellClick(popUpProps) {
        this.setState({...popUpProps});
    }
    
  
    buttonClick(title, index) {
        let action = this.state.dynamicButtons[index];
        let actionId = action.id;
        let [detailData, alarmNames] = WorkSheetModel.mapData(this.state.components, this.ciTypes, this.orderId);
        console.log(alarmNames)
        if (alarmNames.length > 0) {
            this.props.showMessage(alarmNames[0], "warn");
            return
        }

        let createData = [{
            "id": this.orderId,
            "type": this.workOrderType,
            "node": this.nodeId
        }, ...detailData, {
            "service_catalog": this.catalogId
        }];

        console.log(createData, alarmNames)
        this.props.showMessage("正在提交", "info");
        workorderActionExecute([actionId, createData]).then(res => {
            let obj = JSON.parse(res);
            if (obj.result) {
                this.props.history.replace('/utilization/serviceTracking');
            } else {
                this.props.showMessage(obj.error.localizedMessage ? obj.error.localizedMessage:"动作异常", "error");
            }
        }, (error) => {
            this.props.showMessage("网络异常", "error");
        });
    }


    render() {
        let titles = ['提交','取消'];
        this.state.dynamicButtons.map(item => {
            titles.push(item.display_name)
        });
        const dynamicButtonsProps = {
            titles:titles,
            buttonClick:this.buttonClick.bind(this)
        };
        const dynamicCellsProps = {
            components:this.state.components,
            ciTypes:this.ciTypes,
            rules:this.rules,
            orderId:this.orderId,
            cellClick:this.cellClick.bind(this)
        };
        return <div className="SubmitFrom">
            <Page className={titles.length > 4 ? "container2" : "container1"}>
                <CellsTitle>
                    <Cell>
                        <CellHeader>
                            预约信息
                        </CellHeader>
                        <CellBody>
                        </CellBody>
                        <CellFooter>
                            {this.catalogName}
                        </CellFooter>
                    </Cell>
                </CellsTitle>
                <div className="DynamicCells">
                    <Cells>
                        <FormCell className="TextCell" select selectPos="after">
                          <CellHeader>
                              <div className="cell_body_head">
                                  <span className="isRequire">*</span>
                              </div>
                              <div  className="cell_body_content">
                                  类型
                              </div>
                          </CellHeader>
                          <CellBody>
                               <Select data={[
                                {
                                    value: 1,
                                    label: '美容'
                                },
                                {
                                    value: 2,
                                    label: '诊疗'
                                }
                            ]} />
                          </CellBody>
                          <CellFooter>
                          </CellFooter>
                      </FormCell>
                        <FormCell className="TextCell" select selectPos="after">
                          <CellHeader>
                              <div className="cell_body_head">
                                  <span className="isRequire">*</span>
                              </div>
                              <div  className="cell_body_content">
                                  爱宠
                              </div>
                          </CellHeader>
                          <CellBody>
                               <Select data={[
                                {
                                    value: 1,
                                    label: '小白'
                                },
                                {
                                    value: 2,
                                    label: '小黑'
                                },
                                {
                                    value: 3,
                                    label: '小小'
                                }
                            ]} />
                          </CellBody>
                          <CellFooter>
                          </CellFooter>
                      </FormCell>
                      <FormCell>
                        <CellHeader>
                            <Label>时间</Label>
                        </CellHeader>
                        <CellBody>
                            <Input type="datetime-local" defaultValue="" placeholder=""/>
                        </CellBody>
                    </FormCell>
                    <FormCell select selectPos="before">
                        <CellHeader>
                            <Select>
                                <option value="1">+86</option>
                            </Select>
                        </CellHeader>
                        <CellBody>
                            <Input type="tel" placeholder="输入电话" value="15801632955"/>
                        </CellBody>
                    </FormCell>
                    <FormCell>
                        <CellBody>
                            <TextArea placeholder="备注" rows="3" maxlength="200"></TextArea>
                        </CellBody>
                    </FormCell>
                    </Cells>
                </div>
            </Page>

            <DynamicButton {...dynamicButtonsProps}/>
            
        </div>
    }
}

export default SubmitFrom
