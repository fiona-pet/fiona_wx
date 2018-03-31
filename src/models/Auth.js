/**
 * Created by zhongfan on 2017/6/29.
 */
import cookie from 'react-cookie';
import Auth from '../services/auth'
import queryString from 'query-string';

const KEY_USER = 'user';
const KEY_ID = 'id';
const KEY_OPENID = 'openid';
const KEY_TOKEN = 'token';
const KEY_WXCODE = 'wxcode';
const KEY_SID = 'sid';

export default {

    saveUser(obj) {
        cookie.save(KEY_USER, obj, {path: '/'});
    },

    saveId(id) {
        cookie.save(KEY_ID, id, {path: '/'});
    },

    saveWXcode(code){
        cookie.save(KEY_WXCODE, code, {path: '/'});
    },

    saveOpenId(openid){
        cookie.save(KEY_OPENID, openid, {path: '/'});
    },

    saveToken(token){
        cookie.save(KEY_TOKEN, token, {path: '/'});
    },
    getWXcode() {
        let code = cookie.load(KEY_WXCODE);
        return code ? code : '';
    },
    getToken() {
        let token = cookie.load(KEY_TOKEN);
        return token ? token : '';
    },
    getOpenId() {
        let openid = cookie.load(KEY_OPENID);
        return openid ? openid : '';
    },
    getUser() {
        let user = cookie.load(KEY_USER);
        return user ? user : {};
    },

    getId() {
        let id = cookie.load(KEY_ID);
        return id ? id : '';
    },
    ///0普通用户 1工程师
    getUserType() {
        let user = this.getUser();
        return user.type
    },

    getLevel() {
        let user = this.getUser();
        return user.level
    },

    validation(success, failure){
        let params = queryString.parse(window.location.search);
        let ticket = params.ticket;//嵌入三方app

        if (ticket){
            success(ticket, '');
        }else{
            Auth.validation().then(res => {
                let respro = JSON.parse(res);
                if (respro.errorCode == 0) {
                    let code = params.code;
                    if (code)
                        this.saveWXcode(code);
                    let token = respro.data.token;
                    let openId = respro.data.openid
                    this.saveToken(token)
                    this.saveOpenId(openId);
                    success(openId, token);
                }else {
                    failure();
                }
            }, err => {
                failure('');
            });
        }
    },
    exchange(token, success, failure){
        Auth.exchange(token).then(res => {
            let ress = JSON.parse(res);
            if (ress.error) {
                if (ress.error.code == 402) {
                    failure(ress.error.message);
                    return;
                }
                let msg = typeof ress.error === 'string' ? ress.error : ress.error.errorMessage;
                failure(msg)
            } else {
                let resBody = JSON.parse(res);
                if (resBody.result === undefined) {
                    this.removeId();
                    this.removeUser();
                    failure(resBody.error.data);
                } else {
                    let avatar = 'rpc?method=/v2/file/avatar&id=' + resBody.result.id;
                    let user = {
                        avatar: avatar,//头像
                        name: resBody.result.display_name,//显示名
                        sex: resBody.result.sex.display_name,//性别
                        dept: resBody.result.department.display_name,//部门
                        deptid: resBody.result.department.id,//部门id
                        tel: resBody.result.mobile,//电话
                        email: resBody.result.email,//邮箱
                        type: resBody.result.user_type.id,//用户类型 0普通用户 1工程师
                    };
                    let id = resBody.result.id;
                    this.saveUser(user);//保存用户信息
                    this.saveId(id);//保存重复登录时的验证id
                    success();
                }
            }
        }, err => {
            this.removeId();
            this.removeUser();
            failure('');
        });
    },
    modify(create, callback){
        Auth.modify(create, {'openid': this.getOpenId()}).then(res => {
            res = JSON.parse(res);
            callback();
        }, err => {
            callback();
        });
    },
    /**
     //目前都是固定值，后续后端可能会有变动
     //用户故障：09e3de8a-b960-449f-993d-703680bc3e6a
     //工程师故障：45e02005-94d5-4f90-a519-02fd0cc122d3
     //请求（用户和工程师一样）：d8a4e2e6-32b8-4235-9707-e7f72110a81d
     */
    getTroubleTypeId() {
        let type = this.getUserType();
        console.log('userType', type);
        if (type == 0) {
            return "09e3de8a-b960-449f-993d-703680bc3e6a"
        }
        if (type == 1) {
            return "45e02005-94d5-4f90-a519-02fd0cc122d3"
        }
    },

    getRequestTypeId() {
        return "d8a4e2e6-32b8-4235-9707-e7f72110a81d"
    },


    removeUser() {
        cookie.remove(KEY_USER, {path: '/'});
    },

    removeId() {
        cookie.remove(KEY_ID, {path: '/'});
    },

    isAuthenticated(success, failure) {
        Auth.isAuthenticated().then(res => {
            let resObj= JSON.parse(res);
            if (resObj.result) {
                success(resObj.result)
            }else {
                failure()
            }
        }, () => {
            failure()
        })
    },
    login (username, password, success, failure) {
        Auth.login(username, password).then(res => {
            if (res.error) {
                let msg = typeof res.error === 'string' ? res.error : res.error.message;
                failure(msg)
            } else {
                let resBody = JSON.parse(res);
                if (resBody.result === undefined) {
                    failure(resBody.error.message)
                } else {
                    let avatar = 'rpc?method=/v2/file/avatar&id=' + resBody.result.id;
                    let user = {
                        avatar: avatar,//头像
                        name: resBody.result.display_name,//显示名
                        sex: resBody.result.sex ? resBody.result.sex.displayName : '男',//性别，默认男
                        dept: resBody.result.department.display_name,//部门
                        deptid: resBody.result.department.id,//部门id
                        tel: resBody.result.mobile,//电话
                        email: resBody.result.email,//邮箱
                        type: resBody.result.user_type ? resBody.result.user_type.id : '0',//用户类型 0普通用户 1工程师，默认普通用户
                        level: resBody.result.level ? resBody.result.level.id : 'normal'//用户级别 normal普通 vip重要，默认普通
                    };
                    let id = resBody.result.id;
                    this.saveUser(user);//保存用户信息
                    this.saveId(id);//保存重复登录时的验证id
                    success("登录成功");
                }
            }
        });
    },

    logout(success, failure) {
        Auth.logout().then(() => {
            this.removeUser();
            this.removeId();
            success();
        })
    }
}
