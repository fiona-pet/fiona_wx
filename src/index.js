/**
 * Created by zhongfan on 2017/5/16.
 */
import React from 'react'
import ReactDOM from 'react-dom'
import {
    HashRouter,
    Route,
    Switch
} from 'react-router-dom'
import {
    Icon,
    TabBar,
    TabBarItem,
    TabBarIcon,
    TabBarLabel,
    Badge
} from 'react-weui'

import {ToastContainer, toast} from 'react-toastify';
import './utils/ReactToastify.min.css';
import Bundle from './utils/bundle'
import Loading from './components/common/Loading'
import 'weui'
import '../global.scss'
import AppConfig from './utils/AppConfig'

import Auth from './models/Auth'

import Login from './routes/login/Login'
import User from './routes/user/User'
import Engineer from './routes/engineer/Engineer'
import Profile from './routes/profile/Profile'
import SelectDate from './routes/profile/SelectDate'
import Submit from './routes/worksheet/SubmitForm'
import AssetSubmit from './routes/worksheet/AssetSubmitFrom'
import test from './routes/common/test'
import MonthlyReport from './routes/common/MonthlyReport'
import AssetMessage from './routes/message/AssetMessage'
import ServiceMessage from './routes/message/ServiceMessage'
import MonthlyMessage from './routes/message/MonthlyMessage'
import AssetManage from './routes/utilization/AssetManage'
import AssetDetail from './routes/utilization/AssetDetail'
import AssetSearch from './routes/utilization/AssetSearch'
import AssetDeliver from './routes/utilization/AssetDeliver'
import ServiceTracking from './routes/utilization/ServiceTracking'
import Todo from './routes/utilization/Todo'
import OrderDetail from './routes/utilization/OrderDetail'
import CommentDetail from './routes/utilization/CommensDetail'
import SolvePopup from './routes/utilization/SolvePopup'
import OrderFileList from './routes/utilization/OrderFileList'
import RadioList from './routes/utilization/RadioList'
import TroubleRepairing from './routes/worksheet/TroubleRepairing'
import ServiceRequest from './routes/worksheet/ServiceRequest'
import AssetTroubleRepairing from './routes/worksheet/AssetTroubleRepairing'

const loadComponent = (component, name) => (props) => {
    return <Bundle load={component} name={name}>
        {
            (Component) => {
                if (Component) {
                    if (name) document.title = name;
                    return <Component {...props} showMessage={handleMessage}/>
                }else {
                    return <Loading/>
                }
            }
        }
    </Bundle>
};

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
    constructor(props) {
        super(props)
        this.state = {
            messageNumber: 0
        }
    }

    validation() {
        Auth.isAuthenticated((result) => {
            if (!Auth.getId() || !Auth.getUser() || (typeof(Auth.getUser().deptid) == "undefined")) {
                let avatar = 'rpc?method=/v2/file/avatar&id=' + result.id;
                let user = {
                    id: result.id,
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
            this.redirect()
        }, () => {
            Auth.validation(((openid, token) => {
                Auth.exchange(token, (() => {
                    this.redirect()
                }), ((message) => {
                    const {location} = this.props.history.location;
                    this.replace('/login');
                }))
            }), ((message) => {
                const {location} = this.props.history.location;
                this.replace('/login');
            }));
        })
    }

    redirect() {
        let pathname = '';
        if (Auth.getUserType() === "0") {
            pathname = '/user'
        }else if (Auth.getUserType() === "1") {
            pathname = '/engineer'
        }else {
            pathname = '/login'
        }
        const {location} = this.props.history;
        if (location.pathname && location.pathname != "/") {
            pathname = location.pathname
        }
        this.props.history.replace({
            pathname: pathname
        })
    }

    replace(pathname) {
        const {location} = this.props.history;
        this.props.history.replace({
            pathname: pathname,
            search: encodeURIComponent(`prePathname=${location.pathname}`)
        })
    }

    componentDidMount() {
        console.log(this.props.history);
        // 消息点击跳转
        this.validation()
    }

    render() {
        let pathname = this.props.location.pathname;

        return <div className="Application">
            <ToastContainer
                style={{zIndex: '5001'}}
                position="top-right"
                type="default"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnHover
            />
            <Switch>
                <Route path="/test" component={loadComponent(test)}/>
                <Route path="/engineer" component={loadComponent(Engineer)}/>
                <Route path="/login" component={loadComponent(Login)}/>
                <Route path="/user" component={loadComponent(User)}/>
                <Route path="/selectdate" component={loadComponent(SelectDate)}/>

                <Route path="/profile" component={loadComponent(Profile)}/>
                <Route path="/submit/:catalogId/:processId/:catalogName/:type" component={loadComponent(Submit)}/>
                <Route path="/assetSubmit/:catalogId/:processId/:catalogName/:type/:assetId/:assetName"
                       component={loadComponent(AssetSubmit)}/>

                <Route path="/MonthlyReport/:month/:isSR" component={loadComponent(MonthlyReport)}/>

                <Route path="/message/assetMessage" component={loadComponent(AssetMessage)}/>
                <Route path="/message/serviceMessage" component={loadComponent(ServiceMessage)}/>
                <Route path="/message/MonthlyMessage" component={loadComponent(MonthlyMessage)}/>

                <Route path="/utilization/assetManage" component={loadComponent(AssetManage)}/>
                <Route path="/utilization/assetDetail/:id/:typeId/:from" component={loadComponent(AssetDetail)}/>
                <Route path="/utilization/assetDetail/:id/:typeId" component={loadComponent(AssetDetail)}/>
                <Route path="/utilization/assetSearch/:id" component={loadComponent(AssetSearch)}/>
                <Route path="/utilization/assetDeliver/:id" component={loadComponent(AssetDeliver)}/>
                <Route path="/utilization/serviceTracking" component={loadComponent(ServiceTracking)}/>
                <Route path="/utilization/todo" component={loadComponent(Todo)}/>
                <Route path="/utilization/orderDetail/:id/:typeName/:typeId/:name/:state"
                       component={loadComponent(OrderDetail)}/>
                <Route path="/utilization/CommentDetail/:id/:orderId" component={loadComponent(CommentDetail)}/>
                <Route path="/utilization/solvePopup/:id/:interactionActionId/:actionId/:typeId"
                       component={loadComponent(SolvePopup)}/>
                <Route path="/utilization/fileList/:id" component={loadComponent(OrderFileList)}/>
                <Route path="/utilization/assetTroubleRepairing/:assetId/:assetName"
                       component={loadComponent(AssetTroubleRepairing)}/>

                <Route path="/serviceRequest" component={loadComponent(ServiceRequest)}/>
                <Route path="/troubleRepairing" component={loadComponent(TroubleRepairing)}/>
                <Route path="/radioList" component={loadComponent(RadioList)}/>

                <Route component={Loading}/>
            </Switch>
        </div>
    }
}

export default Application

const root = document.getElementById('root');
root.innerHTML = '';

ReactDOM.render(
    <HashRouter>
        <Route path="/" component={Application}/>
    </HashRouter>, document.getElementById('root'));

if (module.hot) {
    module.hot.accept()
}
