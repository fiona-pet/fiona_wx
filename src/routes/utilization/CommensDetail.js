/**
 * Created by qcm on 2017/7/4.
 */
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
    TextArea,
    ActionSheet,
    Dialog,
    Toptips
} from 'react-weui/build/packages'
import {
    getLookupList,
    getReferenceList,
    getCommentsList,
    addComment,
    deleteComment
} from '../../services/utilization'

import Page from '../../components/common/page'
import CommentCell from '../../components/common/CommentCell'
import ReplyComment from '../../components/common/ReplyComment'
import DataUtil from '../../utils/DateUtil'
import Auth from '../../models/Auth'


class CommensDetail extends React.Component {

    constructor(props) {
        super(props);
        document.title = "评论列表";
        this.state = {
            lookup_popUp: false,
            detailData: {},
            components: [],
            commentsList: [],
            showWarn: false,
            warnTimer: null,
            warnText: '',

            creatUserId: '',
            replycomment: false,
            replyLevel: 1,
            commentsId: '',
            comments: [],
            commentsUserName: '',
            ios_show: false,
            showIOS2: false,
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
            }
        };
    }

    showReplyComment() {
        this.setState({
            replycomment: true,
            ios_show: false,
        })
    }

    hide() {
        this.setState({
            ios_show: false,
            showIOS2: false,
        })
    }

    deleteComment() {
        this.hide();
        this.deleteComments(this.getChildComment(this.state.commentsId));
    }

    /**
     * 循环删除评论 因为ci需要先删除父节点才能删除子节点
     * @param comments
     */
    deleteComments(comments){
        if((!comments) || comments.length == 0){
            return
        }

        if(comments.length == 1){
            deleteComment(this.state.commentsId).then(res => {
                this.componentDidMount();
            }, err => console.log(err));
            return;
        }
        deleteComment(comments[0].id).then(res => {
            comments.splice(0, 1);
            if (comments.length == 1) {
                deleteComment(this.state.commentsId).then(res => {
                    this.componentDidMount();
                }, err => console.log(err));
                return;
            }else{
                this.deleteComments(comments);
            }
        }, err => console.log(err));
    }

    addComment(text) {
        if (!text) {
            this.showWarn('请输入评论信息');
            return;
        }
        this.setState({
            replycomment: false,
        });
        let params = this.props.match.params;
        addComment(params.orderId, this.state.commentsId, text).then(res => {
            this.componentDidMount();
        }, e => console.log(err));
    }


    componentDidMount() {
        let params = this.props.match.params;
        this.loadData(params.orderId);
    }

    componentWillUnmount() {
        this.state.warnTimer && clearTimeout(this.state.warnTimer);
    }

    loadData(id) {
        let params = this.props.match.params;
        getCommentsList(id).then(res => {
                let obj = JSON.parse(res);
                let data = obj.result;
                let comments = [];
                data.map((item, index) => {

                    if (!item.parent && item.id == params.id) {
                        item['count'] = 0;
                        item.t = [];
                        this.getCommenList(item, item, data, item.count);
                        comments.push(item);
                    }
                });

                console.log(comments);
                this.setState({commentsList: comments, comments: data});
            }
        , err => console.log(err))
        ;

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

    getCommenList(ite1, ite2, data, count) {
        data.map((item, index) => {
            if (item.parent) {
                if (ite2.id === item.parent) {
                    item['parentName'] = ite2.create_user.display_name;
                    item['count'] = count + 1;
                    ite1.t.push(item);
                    console.log(ite1);
                    this.getCommenList(ite1, item, data, item.count);
                    return;
                }
            }
        });
    }

    valueChange(value, name) {
        console.log(value, name);
        if (name) {
            this.state.detailData[name] = value;
        }
    }

    searchChange(value) {
        console.log(value)
    }

    cellClick(item) {
        console.log(item)
        this.setState({selectedItem: item});
        if (item.dataType === "LOOKUP") {
            getLookupList(item.referenceType).then(res => {
                let obj = JSON.parse(res);
                let data = obj.result.data;
                this.setState({lookup_popUp: true, lookUpDataSource: data})
            });
        }
        if (item.dataType === "REFERENCE") {
            getReferenceList(item.reference).then(res => {
                let obj = JSON.parse(res);
                let data = obj.result.data;
                this.setState({lookup_popUp: true, lookUpDataSource: data})
            });
        }
    }

    handleCancelClick() {
        this.setState({
            lookup_popUp: false,
            replycomment: false,
        })
    }


    replyClick(name, id, userId, length) {
        this.state.replyLevel = length;

        if (length >= 3 && Auth.getId() != userId) {
            this.showWarn('此评论回复已达到3级，请重新发表评论')
            return;
        }
        this.setState({
            commentsId: id,
            commentsUserName: name,
            creatUserId: userId,
            ios_show: true
        })
    }

    /**
     * 弹出提醒
     */
    showWarn(text) {
        this.setState({showWarn: true, warnText: text});

        this.state.warnTimer = setTimeout(() => {
            this.setState({showWarn: false});
        }, 2000);
    }

    render() {
        let params = this.props.match.params;
        return <Page className="OrderDetail">

            <Cells>
                <Cell className="CommentHeader">
                    <CellHeader>
                        评论({this.state.commentsList.length == 0 ? 0 : (this.state.commentsList.length + this.state.commentsList[0].t.length)})
                    </CellHeader>
                </Cell>

                {this.state.commentsList.map((item, index) => (
                    <CommentCell name={item.create_user.display_name} time={DataUtil.dateStringFormat(item.create_time)}
                                 content={item.description}
                                 id={item.id}
                                 icon={'rpc?method=/v2/file/avatar&id=' + item.create_user.id}
                                 number='1000000'
                                 creatUserId={item.create_user.id}
                                 replyList={item.t}
                                 replyClick={this.replyClick.bind(this)}

                    >
                    </CommentCell>
                ))}
            </Cells>

            <ActionSheet
                menus={this.state.replyLevel >= 3 ? this.state.menu3 : (Auth.getId() == this.state.creatUserId ? this.state.menu2 : this.state.menu1)}
                actions={this.state.actions}
                show={this.state.ios_show}
                type="ios"
                onRequestClose={e => this.setState({ios_show: false})}
            />

            <ReplyComment key={this.state.commentsId} show={this.state.replycomment}
                          defaultValue={"回复：" + this.state.commentsUserName}
                          handleCancelClick={this.handleCancelClick.bind(this)}
                          handleOKClick={this.addComment.bind(this)}
            />

            <Dialog type="ios" title={'确认要删除该评论'} buttons={this.state.style2.buttons} show={this.state.showIOS2}>
            </Dialog>
            <Toptips type="warn" show={this.state.showWarn}>{this.state.warnText}</Toptips>
        </Page>
    }
}

export default CommensDetail