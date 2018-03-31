import {rpcRequest} from '../utils/rpcRequest'
import Auth from '../models/Auth'

const requestTypeId = 'b7d419b7-a043-4a27-add4-f3fd4e413306';

function getRequest(value) {

    return rpcRequest('/v2/cmdb/ci/list', [requestTypeId, {
        "filter": {
            "association": "R:D:51f7c457-88b6-4ff8-b7bc-ff665893fadb(d)",
            "attribute": {
                "and": [{
                    "simple": {
                        "name": "process",
                        "operator": "isnotnull"
                    }
                }, {
                    "simple": {
                        "name": "classify",
                        "operator": "eq",
                        "value": value//此处传0，其它都是固定值。
                    }
                }, {
                    "simple": {
                        "name": "is_release",
                        "operator": "eq",
                        "value": true
                    }
                }, {
                    "or": [{
                        "simple": {
                            "name": "d.id",
                            "operator": "eq",
                            "value": Auth.getUser().deptid,
                        }
                    }, {
                        "simple": {
                            "name": "is_global_visible",
                            "operator": "eq",
                            "value": true
                        }
                    }]
                }]
            }
        }
    }]);
}

/**
 * 请求列表
 * @returns {*}
 */
export function getRequestTypeList() {
    return getRequest(0);
}

/**
 * 故障列表
 * @returns {*}
 */
export function getTroubleTypeList() {
    return getRequest(1);
}

/*****************getClientIp*******************/
export function getClientIp() {
    return rpcRequest('/v2/login/getClientIp', [])
}
