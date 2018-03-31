/**
 * Created by zhongfan on 2017/5/16.
 */
import React from 'react'
import ReactDOM from 'react-dom'
import {HashRouter, Route, Redirect, withRouter, Switch} from 'react-router-dom'

import { ToastContainer, toast } from 'react-toastify';
import './src/utils/ReactToastify.min.css';

import Login from './src/routes/login/Login'
import User from './src/routes/user/User'
import Engineer from './src/routes/engineer/Engineer'
import Profile from './src/routes/profile/Profile'
import SelectDate from './src/routes/profile/SelectDate'
import Submit from './src/routes/worksheet/SubmitForm'
import AssetSubmit from './src/routes/worksheet/AssetSubmitFrom'
import test from './src/routes/common/test'
import MonthlyReport from './src/routes/common/MonthlyReport'

import AssetMessage from './src/routes/message/AssetMessage'
import ServiceMessage from './src/routes/message/ServiceMessage'
import MonthlyMessage from './src/routes/message/MonthlyMessage'

import AssetManage from './src/routes/utilization/AssetManage'
import AssetDetail from './src/routes/utilization/AssetDetail'
import AssetSearch from './src/routes/utilization/AssetSearch'
import AssetDeliver from './src/routes/utilization/AssetDeliver'
import ServiceTracking from './src/routes/utilization/ServiceTracking'
import Todo from './src/routes/utilization/Todo'
import OrderDetail from './src/routes/utilization/OrderDetail'
import CommentDetail from './src/routes/utilization/CommensDetail'
import SolvePopup from './src/routes/utilization/SolvePopup'
import OrderFileList from './src/routes/utilization/OrderFileList'

import RadioList from './src/routes/utilization/RadioList'

import TroubleRepairing from './src/routes/worksheet/TroubleRepairing'
import ServiceRequest from './src/routes/worksheet/ServiceRequest'
import AssetTroubleRepairing from './src/routes/worksheet/AssetTroubleRepairing'

import Bundle from './src/utils/bundle'
import Loading from './src/components/common/Loading'

import Auth from './src/models/Auth'

import 'weui'
import 'react-weui/build/packages'
import './global.scss'

const createComponent = (component) => (props) => (
    <Bundle load={component}>
        {
            (Component) => {
                if (Component) {
                    if (props.location.pathname.startsWith('/MonthlyReport')) {
                        document.querySelector('body').addEventListener('touchstart', touchStartEvent)
                    }else {
                        document.querySelector('body').removeEventListener('touchstart', touchStartEvent)
                    }
                    return <Component {...props} showMessage={handleMessage}/>
                }else {
                    return <Loading/>
                }
            }
        }
    </Bundle>
)
function touchStartEvent() {
    event.preventDefault();
}
function handleMessage(message, type = "warn") {
    console.log(message)
    switch (type) {
        case "warn":
            toast.warn(message);
            break;
        case "success":
            toast.success(message);
            break;
        case "error":
            toast.error(message);
            break;
        case "info":
            toast.info(message);
            break;
    }
}

class Application extends React.Component {
    componentDidMount() {
        console.log("Application")
        this.validation()
    }

    validation() {
        Auth.isAuthenticated((result) => {
            Auth.validation(((openid, token) => {}), ((message) => {}));
            if (!Auth.getId() || !Auth.getUser() || (typeof(Auth.getUser().deptid) == "undefined")) {
                let avatar = 'rpc?method=/v2/file/avatar&id=' + result.id;
                let user = {
                    id:result.id,
                    avatar: avatar,//头像
                    name: result.display_name,//显示名
                    sex: result.sex.display_name,//性别
                    dept: result.department.display_name,//部门
                    deptid: result.department.id,//部门id
                    tel: result.mobile,//电话
                    email: result.email,//邮箱
                    type: result.user_type.id,//用户类型 0普通用户 1工程师
                };
                Auth.saveId(result.id);
                Auth.saveUser(user);//保存用户信息
            }
            if (this.props.location.pathname == '/') {
                this.redirect()
            }
        },() => {
            Auth.validation(((openid, token) => {
                Auth.exchange(token, (() => {
                    this.redirect()
                }), ((message) => {
                    this.props.history.replace('/login');
                }))
            }), ((message) => {
                this.props.history.replace('/login');
            }));
        })
    }
    redirect() {
        if (Auth.getUserType() === "0") {
            this.props.history.replace('/user')
        }else if (Auth.getUserType() === "1") {
            this.props.history.replace('/engineer/utilization')
        }else {
            this.props.history.replace('/login')
        }
    }

    render() {
        return <div className="Application">
            <ToastContainer
                style={{zIndex:'5001'}}
                position="top-right"
                type="default"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnHover
            />

            <Switch>
                <Route path="/test" component={createComponent(test)}/>
                <Route path="/engineer" component={createComponent(Engineer)}/>
                <Route path="/login" component={createComponent(Login)}/>
                <Route path="/loading" component={createComponent(Loading)}/>
                <Route path="/user" component={createComponent(User)}/>
                <Route path="/selectdate" component={createComponent(SelectDate)}/>

                <Route path="/profile" component={createComponent(Profile)}/>
                <Route path="/submit/:catalogId/:processId/:catalogName/:type" component={createComponent(Submit)}/>
                <Route path="/assetSubmit/:catalogId/:processId/:catalogName/:type/:assetId/:assetName" component={createComponent(AssetSubmit)}/>

                <Route path="/MonthlyReport/:month/:isSR" component={createComponent(MonthlyReport)}/>

                <Route path="/message/assetMessage" component={createComponent(AssetMessage)}/>
                <Route path="/message/serviceMessage" component={createComponent(ServiceMessage)}/>
                <Route path="/message/MonthlyMessage" component={createComponent(MonthlyMessage)}/>

                <Route path="/utilization/assetManage" component={createComponent(AssetManage)}/>
                <Route path="/utilization/assetDetail/:id/:typeId/:from" component={createComponent(AssetDetail)}/>
                <Route path="/utilization/assetDetail/:id/:typeId" component={createComponent(AssetDetail)}/>
                <Route path="/utilization/assetSearch/:id" component={createComponent(AssetSearch)}/>
                <Route path="/utilization/assetDeliver/:id" component={createComponent(AssetDeliver)}/>
                <Route path="/utilization/serviceTracking" component={createComponent(ServiceTracking)}/>
                <Route path="/utilization/todo" component={createComponent(Todo)}/>
                <Route path="/utilization/orderDetail/:id/:typeName/:typeId/:name/:state" component={createComponent(OrderDetail)}/>
                <Route path="/utilization/CommentDetail/:id/:orderId" component={createComponent(CommentDetail)}/>
                <Route path="/utilization/solvePopup/:id/:interactionActionId/:actionId/:typeId" component={createComponent(SolvePopup)}/>
                <Route path="/utilization/fileList/:id" component={createComponent(OrderFileList)}/>
                <Route path="/utilization/assetTroubleRepairing/:assetId/:assetName" component={createComponent(AssetTroubleRepairing)}/>

                <Route path="/serviceRequest" component={createComponent(ServiceRequest)}/>
                <Route path="/troubleRepairing" component={createComponent(TroubleRepairing)}/>
                <Route path="/radioList" component={createComponent(RadioList)}/>
            </Switch>
        </div>
    }
}
export default Application

ReactDOM.render(
    <HashRouter>
        <Route path="/" component={Application}/>
    </HashRouter>
    , document.getElementById('root'));

if (module.hot) {
    module.hot.accept()
}
