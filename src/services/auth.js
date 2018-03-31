/**
 * Created by zhongfan on 2017/5/17.
 */
import {rpcRequest, restRequest} from '../utils/rpcRequest'
import queryString from 'query-string';

export default {
    login (username, password) {
        return rpcRequest('/v2/login/login', [username, password, false]);
    },

    logout () {
        return rpcRequest('/v2/login/logout');
    },

    isAuthenticated () {
        return rpcRequest('/v2/login/isAuthenticated');
    },
    validation(){
        let params = queryString.parse(window.location.search);
        let code = params.code;
        if (code){
            return restRequest('GET', 'smart/api/wx/relax/userinfo?code=' + code + '&id=' + window.config.businessId);    
        }else {
            return rpcRequest()
        }
    },
    exchange(token){
        let params = queryString.parse(window.location.search);
        let ticket = params.ticket;
        if (ticket){
            return rpcRequest('/sso/cas/login/loginByTicket', [ticket]);
        }else{
            return rpcRequest('/v2/3rd/authentication/exchange', ["weixin", token]);
        }

    },
    modify(way, data){
        return rpcRequest('/v2/3rd/authentication/modify', [{
            "operator": way,
            "app": "weixin",
            "data": [
                data
            ]
        }])
            ;
    },
};