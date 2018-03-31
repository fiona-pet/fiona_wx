/**
 * 工单详情
 * Created by sufei on 2017/6/19.
 */
import React from 'react'
import './OrderDetail.scss'
import {
    ButtonArea,
    Button,
    Input,
    Cells,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
    CellsTitle,
    TextArea,
    ActionSheet,
    Dialog,
    Tab,
    NavBarItem,
    Article,
    Toptips,
    Footer,
    FooterText,
    FooterLinks,
    FooterLink
} from 'react-weui'
import DynamicCells from '../../components/common/DynamicCells'
import {
    getNodeByOrder,
    workorderActionExecute,
    getCommentsList,
    addComment,
    deleteComment,
    getActivityRecordById,
    getNodeIdByOrder,
    getFileNum,
    getBindAsset
} from '../../services/utilization'

import WorkSheetModel from '../../models/WorkSheet'
import InteractionPopup from '../../components/common/cmdb/InteractionPopup'
import DynamicButton from '../../components/common/DynamicButton'
import SingleSelect from '../../components/common/cmdb/SingleSelect'
import MultiSelect from '../../components/common/cmdb/MultiSelect'
import Page from '../../components/common/page'
import CommentCell from '../../components/common/CommentCell'
import ReplyComment from '../../components/common/ReplyComment'
import ActivityRecordCell from '../../components/common/ActivityRecordCell'
import Empty from '../../components/common/NoData'

import DataUtil from '../../utils/DateUtil'
import JsonUtil from '../../utils/JsonUtil'
import Auth from '../../models/Auth'

const VIP_ICON = require('../../../asset/utilization/vip.svg');

class OrderDetail extends React.Component {

    constructor(props) {
        super(props);
        document.title = "工单详情"
        this.allData = [];
        this.values = {};
        this.ciTypes = [];
        this.rules = [];
        this.nodeId = '';

        this.state = {
            selectedAction: {},
            assetName: '',
            assetId: '',
            priorityGroup:'低',
            assetTypeId: '',
            create_user: '',
            apply_department: '',
            dyCiTypes: [],
            dyRules: [],
            dynamicButtons: [],
            flow_status: '',
            type_display_name: '',
            data: [],
            components: [],
            lookup_popUp: false,
            multi_lookup_popUp: false,
            lookUpDataSource: [],
            selectedItem:{editor: ''},
            interactionDataSource: [],
            interaction_Popup: false,
            interactionPageName: '',
            commentsList: [],
            navBarCommentTitle: '评论',
            createUserId: '',
            emptyShow: false,
            replyComment: false,
            replyLevel: 1,
            commentsId: '',
            comments: [],
            commentsUserName: '',
            ios_show: false,
            showIOS2: false,
            code: '',
            createTime: '',
            menu1: [{
                label: '回复',
                onClick: this.showReplyComment.bind(this)
            }],
            menu2: [{
                label: '回复',
                onClick: this.showReplyComment.bind(this)
            }, {
                label: '删除',
                onClick: () => {
                    this.setState({showIOS2: true, ios_show: false,})
                }
            }],
            menu3: [{
                label: '删除',
                onClick: () => {
                    this.setState({showIOS2: true, ios_show: false,})
                }
            }],
            actions: [
                {
                    label: '取消',
                    onClick: this.hide.bind(this)
                }
            ],
            style2: {
                title: '确认要删除该评论',
                buttons: [
                    {
                        type: 'default',
                        label: '取消',
                        onClick: this.hide.bind(this)
                    },
                    {
                        type: 'primary',
                        label: '确定',
                        onClick: this.deleteComment.bind(this)
                    }
                ]
            },
            id: '',//工单id
            fileNum: 0,
            activityRecords: [],
            classify: '0'
        };
    }

    /**
     * 显示回复评论输入框
     */
    showReplyComment() {
        this.setState({
            replyComment: true,
            ios_show: false,
        })
    }

    /**
     * 隐藏弹窗
     */
    hide() {
        this.setState({
            ios_show: false,
            showIOS2: false,
        })
    }

    /**
     * 删除评论
     */
    deleteComment() {
        this.hide();
        this.deleteComments(this.getChildComment(this.state.commentsId));
    }

    /**
     * 循环删除评论 因为ci需要先删除父节点才能删除子节点
     * @param comments
     */
    deleteComments(comments) {
        if ((!comments) || comments.length == 0) {
            return
        }

        if (comments.length == 1) {
            deleteComment(this.state.commentsId).then(res => {
                this.getComments();
            }, err => console.log(err));
            return;
        }
        deleteComment(comments[0].id).then(res => {
            comments.splice(0, 1);
            if (comments.length == 1) {
                deleteComment(this.state.commentsId).then(res => {
                    this.getComments();
                }, err => console.log(err));
            } else {
                this.deleteComments(comments);
            }
        }, err => console.log(err));
    }

    /**
     * 回复评论
     * @param text
     */
    addComment(text) {
        if (!text) {
            this.props.showMessage("请输入评论内容", "warn");
            return;
        }
        this.setState({
            replyComment: false,
        });
        let params = this.props.match.params;
        addComment(params.id, this.state.commentsId, text).then(res => {
            this.getComments();
        }, err => console.log(err));
    }

    componentDidMount() {
        let params = this.props.match.params;

        this.loadData(params.id, params.typeId);
    }

    loadDynamicButtons(id) {
        getNodeByOrder(id).then(res => {
            let obj = JSON.parse(res);
            let staticButton = this.state.classify === '1'
                ? [{"display_name": "评论"}] : [];//需求更新为请求单不显示评论按钮
            if (obj.result) {
                this.setState({dynamicButtons: staticButton.concat(obj.result)})
            }
        });
    }

    loadData(id, typeId) {
        this.state.id = id;
        WorkSheetModel.loadData(typeId, id, "node", (result, components, rules, ciTypes) => {
            this.rules = rules;
            this.values = result;
            this.ciTypes = ciTypes;
            this.setState({
                create_user: result.create_user ? result.create_user.display_name : "",
                apply_department: result.apply_department ? result.apply_department.display_name : Auth.getUser().dept,
                flow_status: result.flow_status ? result.flow_status.display_name : "",
                type_display_name: result.type ? result.type.display_name : "",
                code: result.code,
                createTime: DataUtil.datetimeFormat(result.create_time),
                classify: result.classify.id,
                priorityGroup:result.priority_group ? result.priority_group.display_name ? result.priority_group.display_name : '低' : '低',
                components: components
            }, () => {
                this.getComments();
                this.loadDynamicButtons(id);
                this.getOthersById(id)
            });
        });

    }
    getOthersById(id){
        // 获取活动记录
        getActivityRecordById(id).then(res => {
            let activityRecords = [];
            let obj = JSON.parse(res);
            let data = obj.result;
            data.map((item, index) => {
                activityRecords.push({
                    content: item.description,
                    time: DataUtil.datetimeFormat(item.modify_time),
                    enable: (index === 0)
                })
            });

            this.setState({activityRecords: activityRecords});
        });

        getNodeIdByOrder(id).then(res => {
            let obj = JSON.parse(res);
            this.nodeId = obj.result;
        });

        getFileNum(id).then(res => {
            let obj = JSON.parse(res);
            this.setState({fileNum: obj.result})
        });

        getBindAsset(id).then(res => {
            let obj = JSON.parse(res);
            if (obj.result.length <= 0) return
            this.setState({
                assetName: obj.result[0].display_name, assetId: obj.result[0].id,
                assetTypeId: obj.result[0].type.id,
            });
        });
    }

    // 获取评论
    getComments() {
        getCommentsList(this.state.id).then(res => {
                let obj = JSON.parse(res);
                let data = obj.result;
                let comments = [];
                data.map((item, index) => {

                    if (!item.parent) {
                        item['count'] = 0;
                        item.t = [];
                        this.mapComment(item, item, data, item.count);
                        comments.push(item);
                    }
                });

                this.setState({
                    commentsList: comments,
                    navBarCommentTitle: '评论(' + comments.length + ')',
                    emptyShow: true,
                    comments: data
                });
            }
            , err => console.log(err))
    }

    /**
     * 获取某一评论节点集合
     * @param commentid
     * @returns {Array}
     */
    getChildComment(commentid) {
        let comments = [];
        let comment = {};
        for (var com in this.state.comments) {
            comment = this.state.comments[com];
            if (comment.id == commentid) {
                comments.push(comment);
                this.deletemapComments(comments, comment, this.state.comments, 1);
                comments.reverse();
                return comments;
            }
        }
    }

    /**
     * 递归获取待删除评论合集
     * @param ite1
     * @param ite2
     * @param data
     */
    deletemapComments(ite1, ite2, data, count) {
        data.map((item, index) => {
            if (item.parent) {
                if (ite2.id === item.parent) {
                    item['parentName'] = ite2.create_user.display_name;
                    item['count'] = count + 1;
                    ite1.push(item);
                    this.deletemapComments(ite1, item, data, item.count);
                }
            }
        });
    }

    /**
     * 递归获取评论合集
     * @param ite1
     * @param ite2
     * @param data
     */
    mapComment(ite1, ite2, data, count) {
        data.map((item, index) => {
            if (item.parent) {
                if (ite2.id === item.parent) {
                    item['parentName'] = ite2.create_user.display_name;
                    item['count'] = count + 1;
                    ite1.t.push(item);
                    this.mapComment(ite1, item, data, item.count);
                }
            }
        });
    }

    // 动作弹出页面的确定
    handleInteractionOKClick(components) {
        this.execute(components, this.state.selectedAction.id);
    }

    // 动作弹出页面的取消
    handleInteractionCancelClick() {
        this.setState({interaction_Popup: false})
    }

    toRepair() {

    }

    toDeliver() {
        let id = this.props.match.params.id;
        this.props.history.push({
            pathname: '/utilization/assetDeliver/' + id,
        });
    }

    searchChange(value) {
        if (!this.state.lookup_popUp && !this.state.multi_lookup_popUp) return;
        this.pageIndex = 1;
        WorkSheetModel.loadLookUpData([], this.state.selectedItem, value, this.pageIndex, (allData, resIndex) => {
            this.allData = allData;
            this.pageIndex = resIndex;
            if (this.state.selectedItem.editor == 'userselector' || this.state.selectedItem.editor == 'roleselector') {
                this.setState({multi_lookup_popUp: true, lookUpDataSource: allData});
            } else {
                this.setState({lookup_popUp: true, lookUpDataSource: allData});
            }
        })
    }
    cellClick(popUpProps) {
        this.setState({...popUpProps});
    }
    onLoadMore(resolve, finish) {
        WorkSheetModel.loadLookUpData(this.allData, this.state.selectedItem, '', this.pageIndex, (allData, resIndex) => {
            this.allData = allData;
            this.pageIndex = resIndex;
            this.setState({lookUpDataSource: allData});
            resolve()
        }, finish)
    }

    // 动态列表选择页面的取消
    handleCancelClick() {
        this.setState({
            lookup_popUp: false,
            multi_lookup_popUp: false,
            replyComment: false,
        })
    }

    // 动态列表选择页面的确定
    handleOKClick(item) {
        this.setState({lookup_popUp: false, multi_lookup_popUp: false});
        WorkSheetModel.setComponentsValue(this.state.components, item, this.state.selectedItem.id);
        WorkSheetModel.changeComponentsRule(this.state.components, this.rules, this.ciTypes, this.state.selectedItem.name, this.state.id, (components) => {
            this.setState({components:components})
        });
    }
    defaultSelected() {
        return this.state.selectedItem.defaultId
    }

    // 动作按钮按下
    buttonClick(title, index) {
        if (index == 0 && title == '评论') {
            this.setState({
                commentsId: '',
                commentsUserName: '发表评论：',
                createUserId: '',
                replyComment: true,
                ios_show: false,
            });
        } else {
            let action = this.state.dynamicButtons[index];
            this.setState({selectedAction: action});
            if (action.interaction) {
                let interaction = JSON.parse(action.interaction);
                let interactionValue = interaction.value;
                ///获取popupComponents组件视图
                WorkSheetModel.getDynamicForm(interactionValue, (result, components, dyRules, dyCiTypes) => {
                    this.setState({
                        dyCiTypes: dyCiTypes,
                        dyRules: dyRules,
                        interactionDataSource: components,
                        interaction_Popup: true
                    })
                })
            } else {
                this.execute([], action.id)
            }
        }
    }

    gotoDetail() {
        this.props.history.push({
            pathname: '/utilization/assetDetail/' + this.state.assetId + "/" + this.state.assetTypeId + "/true"
        });
    }

    // 设置数据，执行动作
    execute(interactionComponents, actionId) {
        let values = this.values;
        let [dataArr, alarmNames] = WorkSheetModel.mapData(this.state.components, this.ciTypes, values.id);
        let [dynamicDataArr, dyAlarmNames] = WorkSheetModel.mapData(interactionComponents, this.state.dyCiTypes, values.id);
        let id = values.id;
        let type = values.type.id;

        if (alarmNames.length > 0) {
            this.props.showMessage(alarmNames[0], "warn");
            return
        }
        if (dyAlarmNames.length > 0) {
            this.props.showMessage(dyAlarmNames[0], "warn");
            return
        }

        dataArr.map((o, index) => {
            o['type'] = type;
            o['id'] = id;
            for (let k in o) {
                if ("" === o[k] || undefined === o[k]) {
                    o[k] = null;
                }
            }
        })
        dynamicDataArr.map((o, index) => {
            for (let k in o) {
                if ("" === o[k] || undefined === o[k]) {
                    o[k] = null;
                }
            }
        })

        let executeData = [{
            "id": id,
            "type": type,
            "node": this.nodeId
        }, ...dataArr, {
            "service_catalog": values.service_catalog.id
        }, ...dynamicDataArr];

        this.props.showMessage("正在操作", "info");

        workorderActionExecute([actionId, executeData]).then(res => {
            let obj = JSON.parse(res);
            if (obj.result) {
                this.setState({interaction_Popup: false});
                this.props.history.goBack();
            } else {
                this.props.showMessage(obj.error.localizedMessage ? obj.error.localizedMessage : "动作异常", "error");
            }
        }, (error) => {
            this.props.showMessage("网络异常", "error");
        });
    }

    /**
     * 回复评论
     * @param name
     * @param id
     * @param userId
     */
    replyClick(name, id, userId, length) {
        this.state.replyLevel = length;

        if (length >= 3 && Auth.getId() != userId) {
            this.props.showMessage('此评论回复已达到3级，请重新发表评论', "warn");
            return;
        }
        this.setState({
            commentsId: id,
            commentsUserName: "回复：" + name,
            createUserId: userId,
            ios_show: true
        })
    }

    /**
     * 弹出提醒
     */
    showWarn(text) {
        this.props.showMessage(text, "warn");
    }

    /**
     * 查看更多评论
     */
    moreClick(id) {
        let params = this.props.match.params;
        this.props.history.push({
            pathname: '/utilization/CommentDetail/' + id + "/" + params.id,
        });
    }

    /**
     * 附件列表
     */
    toAccessory() {
        let id = this.state.id;
        if (id.length) {
            this.props.history.push({
                pathname: '/utilization/fileList/' + id,
            });
        }
    }


     getLevel(name) {
        let color = "#fff";
        let textColor = "#fff";

        switch (name) {
            case "高":
                color = "#Fcf0f0";
                textColor = "#e78888";
                break;
            case "中":
                color = "#fdf5eb";
                textColor = "#f3b05c";
                break;
            case "低":
                name = "主要";
                color = "#f7f3eb";
                textColor = "#94b747";
                break;
        }
        let style = {
            background: color, padding: 4, marginRight: 8, color: textColor
        };
        return style;
    }


    render() {
        let titles = [];
        let params = this.props.match.params;
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

        return <div className="OrderDetail">
            <Page className={titles.length > 4 ? "container2" : "container1"}>
                <Cells>
                    <Cell className="title">
                        <CellHeader>
                            工单编号:
                        </CellHeader>
                        <CellBody>
                            {this.state.code}
                        </CellBody>
                        <CellFooter className="State">
                            {Auth.getUserType() == 0 ? '' :
                                <label style={this.getLevel(this.state.priorityGroup)}>
                                {this.state.priorityGroup}
                                </label>}
                            {this.state.flow_status}
                        </CellFooter>
                    </Cell>
                    <Cell className="title">
                        <CellHeader className="weui-cell__hd__copy">
                            创建人
                        </CellHeader>
                        <CellBody>
                            <div className="name_text">{this.state.create_user}</div>
                            {Auth.getLevel() === 'vip' ? <img className="vip_icon" src={VIP_ICON}/> : ''}
                        </CellBody>
                        <CellFooter className="State">
                        </CellFooter>
                    </Cell>
                    <Cell className="title">
                        <CellHeader className="weui-cell__hd__copy">
                            部门
                        </CellHeader>
                        <CellBody>
                            {this.state.apply_department}
                        </CellBody>
                        <CellFooter className="State">
                        </CellFooter>
                    </Cell>
                    {this.values.actual_handler ? <Cell className="title">
                            <CellHeader className="weui-cell__hd__copy">
                                {'解决人'}
                            </CellHeader>
                            <CellBody>
                                {this.values.actual_handler.display_name}
                            </CellBody>
                            <CellFooter className="State">
                            </CellFooter>
                        </Cell>: ''
                    }
                    {this.state.flow_status == '草稿' || this.state.data.flow_status == 'no state'? '' :
                    <Cell className="title">
                        <CellHeader className="weui-cell__hd__copy">
                            {this.state.flow_status == '处理中' ? '经办人' : '预经办人'}
                        </CellHeader>
                        <CellBody>
                            {this.values.candidates ? this.values.candidates.join() : ''}
                        </CellBody>
                        <CellFooter className="State">
                        </CellFooter>
                    </Cell>
                    }
                    <Cell className="title">
                        <CellHeader>
                            申请时间
                        </CellHeader>
                        <CellBody>
                            {this.state.createTime}
                        </CellBody>
                        <CellFooter className="State">
                        </CellFooter>
                    </Cell>
                </Cells>
                <CellsTitle>
                    <Cell>
                         <Footer>
                            <FooterLinks>
                                <FooterLink href="javascript:void(0);" className="firstLink">{params.typeName}</FooterLink>
                                <FooterLink href="javascript:void(0);">{params.name}</FooterLink>
                            </FooterLinks>
                        </Footer>
                    </Cell>
                </CellsTitle>
                <DynamicCells {...dynamicCellsProps}/>
                <Cells>
                    {this.state.classify === '1' ?
                        <Cell access={this.state.fileNum >= 0} onClick={this.toAccessory.bind(this)}>
                            <CellHeader className="fileTitle">
                                {'附件(' + this.state.fileNum + ')'}
                            </CellHeader>
                            <CellBody>

                            </CellBody>
                            <CellFooter/>
                        </Cell> : ''
                    }

                    {
                        this.state.assetName ?
                            <Cell access className='DynamicCell' onClick={this.gotoDetail.bind(this)}>
                                <CellHeader>
                                    <div className="cell_body_head">
                                    </div>
                                    <div className="cell_body_content">
                                        关联资产
                                    </div>
                                </CellHeader>
                                <CellBody>
                                    {this.state.assetName}
                                </CellBody>
                                <CellFooter/>
                            </Cell> : ''
                    }

                </Cells>
                <Tab type="navbar">
                    {this.state.classify === '1' ?
                        <NavBarItem label={this.state.navBarCommentTitle}>
                            {this.state.commentsList.length ? this.state.commentsList.map((item, index) => (
                                    <CommentCell key={index} name={item.create_user.display_name}
                                                 time={DataUtil.dateStringFormat(item.create_time)}
                                                 content={item.description}
                                                 id={item.id}
                                                 icon={'rpc?method=/v2/file/avatar&id=' + item.create_user.id}
                                                 number='3'
                                                 createUserId={item.create_user.id}
                                                 replyList={item.t}
                                                 replyClick={this.replyClick.bind(this)}
                                                 moreClick={this.moreClick.bind(this)}

                                    >
                                    </CommentCell>
                                )) : <Empty
                                    show={this.state.emptyShow}
                                    src={''}
                                    remind={'暂无评论'}/>}
                        </NavBarItem> : ''
                    }
                    <NavBarItem label="活动记录">
                        {this.state.activityRecords.map((item, index) => (
                            <ActivityRecordCell key={index} content={item.content}
                                                time={item.time}
                                                enable={item.enable}
                                                index={index}>
                            </ActivityRecordCell>
                        ))}
                    </NavBarItem>
                </Tab>
            </Page>
            <ActionSheet
                menus={this.state.replyLevel >= 3 ? this.state.menu3 : (Auth.getId() == this.state.createUserId ? this.state.menu2 : this.state.menu1)}
                actions={this.state.actions}
                show={this.state.ios_show}
                type="ios"
                onRequestClose={e => this.setState({ios_show: false})}
            />

            <ReplyComment key={this.state.commentsList + this.state.commentsId + this.state.replyComment}
                          show={this.state.replyComment}
                          defaultValue={this.state.commentsUserName}
                          handleCancelClick={e => {
                              this.setState({replyComment: false,})
                          }}
                          handleOKClick={this.addComment.bind(this)}
            />

            <Dialog type="ios" title={'确认要删除该评论'} buttons={this.state.style2.buttons} show={this.state.showIOS2}>
            </Dialog>

            <SingleSelect show={this.state.lookup_popUp} dataSource={this.state.lookUpDataSource}
                          handleOKClick={this.handleOKClick.bind(this)}
                          handleCancelClick={this.handleCancelClick.bind(this)}
                          searchChange={this.searchChange.bind(this)}
                          onLoadMore={this.onLoadMore.bind(this)}
                          defaultValue={this.defaultSelected()}
            />
            <MultiSelect show={this.state.multi_lookup_popUp} dataSource={this.state.lookUpDataSource}
                         handleOKClick={this.handleOKClick.bind(this)}
                         handleCancelClick={this.handleCancelClick.bind(this)}
                         searchChange={this.searchChange.bind(this)}
                         onLoadMore={this.onLoadMore.bind(this)}
                         defaultValue={this.defaultSelected()}
            />
            <InteractionPopup
                      show={this.state.interaction_Popup}
                      ciTypes={this.state.dyCiTypes}
                      rules={this.state.dyRules}
                      key={this.state.selectedAction.id}
                      pageName={this.state.interactionPageName}
                      dataSource={this.state.interactionDataSource}
                      handleOKClick={this.handleInteractionOKClick.bind(this)}
                      handleCancelClick={this.handleInteractionCancelClick.bind(this)}
            />
            <DynamicButton {...dynamicButtonsProps}/>
        </div>
    }
}

export default OrderDetail
