/**
 * 个人资料页
 */
import React from 'react';
import {
    Cells,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
    Dialog,
    Toast,
} from 'react-weui/build/packages';
import './Profile.scss';
import TabPage from '../../components/common/layout/TabPage'
import Auth from '../../models/Auth'
import Title from 'react-title-component'

import {withRouter} from "react-router-dom";

import {getHistoryConfigs} from '../../services/insight'

const female = require('../../../asset/profile/female@2x.png');
const male = require('../../../asset/profile/male@2x.png');

class Profile extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            avatar: '',//头像
            name: '',//显示名
            sex: '',//性别
            dept: '',//部门
            tel: '',//电话
            email: '',//邮箱

            isToastShown: false,
            isDialogShown: false,
            isMonthlyConfigShown: false,
            dialog: {
                buttons: [
                    {
                        type: 'default',
                        label: '取消',
                        onClick: this.hideDialog.bind(this),
                    },
                    {
                        type: 'primary',
                        label: '确定',
                        onClick: this.logout.bind(this),
                    }
                ]
            },
        }
    }

    componentDidMount() {
        let user = Auth.getUser();
        this.setState({avatar:user.avatar, name:user.name, sex:user.sex, dept:user.dept, tel:user.tel, email:user.email});

        getHistoryConfigs(6).then(res => {
            let result = JSON.parse(res).result;
            if (result) {
                this.setState({isMonthlyConfigShown: true})
            }
        })
    }

    /**
     * 弹出对话框
     */
    showDialog() {
        this.setState({isDialogShown: true});
    }

    /**
     * 关闭对话框
     */
    hideDialog() {
        this.setState({isDialogShown: false});
    }

    /**
     * 登出逻辑
     */
    logout() {
        this.hideDialog();
        this.setState({isToastShown: true});
        Auth.modify('delete', () => {
            Auth.logout(() => {
                this.setState({isToastShown: false});
                this.props.history.replace('/login');
            },() => {
                this.props.showMessage("退出失败");
            });
        });
    }

    /**
     * 占位符
     * @param s 传入的字符串
     * @returns {string} 显示值
     */
    placeHolder(s) {
        return s ? s : '暂无信息';
    }

    render() {
        return <TabPage className="Profile" hiddenTabBar={this.props.location.pathname === "/profile/1"}>
            <Title render="我"/>
            <Cells>
                <Cell>
                    <CellHeader>
                        <img className="avatar" src={this.state.avatar}/>
                    </CellHeader>
                    <CellBody>
                        <div className="profileTitle">
                            <p className="name">张女士</p>
                            <img src={this.state.sex === '男' ? male : female}/>
                        </div>
                        <p className="department">普通会员</p>
                    </CellBody>
                    <CellFooter/>
                </Cell>
            </Cells>
            <Cells>
                <Cell>
                    <CellBody>电话</CellBody>
                    <CellFooter>
                        { (this.state.tel && new RegExp("^[0-9]*$").test(this.state.tel)) ?
                            <a href={"tel:" + this.state.tel}>{this.placeHolder(this.state.tel)}</a>
                            :
                            <div>{this.placeHolder(this.state.tel)}</div>
                        }

                    </CellFooter>
                </Cell>
            </Cells>

            <Cells className="logout-cells">
                <Cell className="logout-cell" onClick={this.showDialog.bind(this)}>
                    <CellBody className="logout">注销</CellBody>
                </Cell>
            </Cells>
            <Toast icon="loading" show={this.state.isToastShown}>正在注销...</Toast>
            <Dialog buttons={this.state.dialog.buttons} show={this.state.isDialogShown}>确认注销登录？</Dialog>
        </TabPage>
    }
}

export default withRouter(Profile);
