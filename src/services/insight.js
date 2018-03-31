import {rpcRequest} from '../utils/rpcRequest'
import SqlUtil from '../utils/SqlUtil'

const CI_TYPE = '37ea4a70-af77-4c1a-9422-7582afc0de41';//查询用id，固定值
const CI_TYPE_FAULT = '0eea99f2-d189-4875-8e23-2f326c1f8ca0';//故障id，固定值
const CI_TYPE_REQUEST = 'a81aff23-31bb-4ea8-a03b-6d7fe74c58be';//请求id，固定值
const CLASS_REQUEST = '0';//请求单
const CLASS_TROUBLE = '1';//故障单

const SQL_KEY = 'insighti';//sql密钥

/**
 * 获取请求key
 * @param start 开始时间
 * @param end 结束时间
 * @returns {*}
 */
function getKey(start, end) {
    let params = [CI_TYPE, {
        "filter":{
            "attribute":{
                "and":[{
                    "simple":{
                        "name":"create_time",
                        "operator":"between",
                        "value":[start, end]
                    }
                }]
            }
        }
    }];
    return rpcRequest('/insight/v2/portal/getCiSql', params);
}

/**
 * 获取分类的请求key（top5用）
 * @param start 开始时间
 * @param end 结束时间
 * @param classify 0请求单 1故障单
 * @returns {*}
 */
function getKeyByClass(start, end, classify) {
    let ciType = CI_TYPE;
    switch (classify) {
        case '0':
            ciType = CI_TYPE_REQUEST;
            break;
        case '1':
            ciType = CI_TYPE_FAULT;
            break;
        default:
            ciType = classify;
            break;
    }
    let params = [ciType, {
        "filter":{
            "attribute":{
                "and":[{
                    "simple":{
                        "name":"create_time",
                        "operator":"between",
                        "value":[start, end]
                    }}, {
                    "simple":{
                        "name":"classify",
                        "operator":"in",
                        "value":[classify]
                    }
                }]
            }
        }
    }];
    return rpcRequest('/insight/v2/portal/getCiSql', params);
}

function getKeyByClassWithExtension(start, end, classify) {
    let params = [classify, {
        "filter":{
            "attribute":{
                "and":[{
                    "simple":{
                        "name":"create_time",
                        "operator":"between",
                        "value":[start, end]
                    }}]
            }
        }
    }];
    return rpcRequest('/insight/v2/portal/getCiSql', params);
}

/**
 * 查询本月服务总量
 * @param start 开始时间
 * @param end 结束时间
 * @returns {*}
 */
export function getMonthlyTotal(start, end) {
    return getKey(start, end)
        .then(res => {
            let obj = JSON.parse(res).result;
            let key = obj.key;
            let sqlStr = 'WITH fact AS (' + SqlUtil.decode(SQL_KEY, obj.sqlStr) + ') ' +
                'SELECT count(fact.*) AS \"countValue\", fact.\"classify\" AS \"classify\" ' +
                'FROM fact ' +
                'GROUP BY \"classify\" ' +
                'ORDER BY \"countValue\" ' +
                'DESC;';
            let params = [CI_TYPE,
                {
                    "key": key,
                    "sqlStr": SqlUtil.encode(SQL_KEY, sqlStr)
                },
                []
            ];
            return rpcRequest('/insight/v2/portal/runCiSqlToCi', params)
        })
}

/**
 * 查询校区分布（没有extension时）
 * @param start 开始时间
 * @param end 结束时间
 * @param flag 是否只显示故障单
 * @returns {*}
 */
export function getCountByCampusWithoutExtension(start, end, flag) {
    return flag === 'true' ? getKey(start, end)
        .then(res => {
            return requestForCampusWithoutExtension(res, CI_TYPE)
        }) : getKeyByClass(start, end, CLASS_TROUBLE)
        .then(res => {
            return requestForCampusWithoutExtension(res, CI_TYPE_FAULT)
        })
}

function requestForCampusWithoutExtension(res, ciType) {
    let obj = JSON.parse(res).result;
    let key = obj.key;
    let sqlStr = 'WITH RECURSIVE workorder_location_bridge AS( ' +
        'SELECT id AS ancestor, id AS descendant, 0 AS depth ' +
        'FROM sec_location UNION ALL ' +
        'SELECT CTE.ancestor AS ancestor, C.id AS descendant, CTE.depth + 1 AS depth ' +
        'FROM sec_location AS C JOIN workorder_location_bridge AS CTE ON C.parent = CTE.descendant),workorder_user as( ' +
        'SELECT wo.id AS workorder_id, wo.create_user AS workorder_user_id, (su.attributes->>\'user_type\')::text as user_type ' +
        'FROM wf_workorder_fault wo ' +
        'LEFT JOIN sec_user su ON su.id=wo.create_user ' +
        'WHERE wo.create_user != \'\' AND wo.create_user NOTNULL ' +
        'UNION ALL ' +
        'SELECT wo.id AS workorder_id, wo.actual_handler AS workorder_user_id, (su.attributes->>\'user_type\')::text AS user_type ' +
        'FROM wf_workorder_fault wo ' +
        'LEFT JOIN sec_user su ON su.id=wo.actual_handler ' +
        'WHERE wo.actual_handler != \'\' AND wo.actual_handler NOTNULL AND wo.actual_handler != wo.create_user ' +
        '),' +
        'workorder_role AS ( ' +
        'SELECT source AS workorder_role_id, destination AS workorder_user_id ' +
        'FROM ci_relation ' +
        'WHERE type=\'62278b70-4b7d-4d30-88c1-ff818bea6919\' AND destination in (SELECT workorder_user_id FROM workorder_user) ' +
        '),' +
        't_usergroup_user AS ( ' +
        'SELECT id, flow_status, regexp_split_to_table(predefined_users, \',\') AS \"predefined_users\" FROM wf_workorder_fault WHERE predefined_users != \'\' ' +
        '),' +
        't_usergroup_group AS ( ' +
        'SELECT source AS t_usergroup_group_id, destination AS workorder_user_id ' +
        'FROM ci_relation ' +
        'WHERE type=\'62278b70-4b7d-4d30-88c1-ff818bea6919\' ' +
        '),' +
        't_usergroup_workorder AS ( ' +
        'SELECT id AS workgroup_workorder_id, t_usergroup_group.t_usergroup_group_id AS workgroup_role_id ' +
        'FROM wf_workorder_fault, t_usergroup_group ' +
        'WHERE wf_workorder_fault.actual_handler= t_usergroup_group.workorder_user_id ' +
        'UNION ' +
        'SELECT id AS workgroup_workorder_id, t_usergroup_group.t_usergroup_group_id AS workgroup_role_id ' +
        'FROM t_usergroup_user, t_usergroup_group WHERE t_usergroup_user.predefined_users= t_usergroup_group.workorder_user_id ' +
        'UNION ' +
        'SELECT id AS workgroup_workorder_id, regexp_split_to_table(predefined_roles, \',\') AS workgroup_role_id ' +
        'FROM wf_workorder_fault WHERE predefined_roles != \'\' ' +
        '), fact AS (' + SqlUtil.decode(SQL_KEY, obj.sqlStr) + ') ' +
        'SELECT count(fact.*) AS \"countValue\", workorder_location_bridge.ancestor AS \"workorder_location\" ' +
        'FROM workorder_location_bridge,sec_user,fact ' +
        'WHERE sec_user.id = fact.apply_user ' +
        'AND sec_user.attributes->>\'location\' = workorder_location_bridge.descendant ' +
        'GROUP BY workorder_location_bridge.ancestor limit 5000;';
    let params = [ciType,
        {
            "key": key,
            "sqlStr": SqlUtil.encode(SQL_KEY, sqlStr)
        },
        [{
            "isCustomizeDimension": true,
            "name": "workorder_user_id",
            "alias": "workorder_user_id",
            "ciType": "Workorder",
            "data_type": "REFERENCE",
            "reference": "fa09796e-762d-4240-be51-a7e1ba3d23b7",
            "reference_type": "eea70b6b-f9c3-40fa-b9da-a07e049b9479",
            "subsystem": "Workorder",
            "description": "记工作量的用户",
            "display_name": "员工",
            "group": "自定义维度",
            "is_extension": false,
            "is_active": true,
            "expr": "",
            "baseView": "workorder_user",
            "default_display_name": "员工",
            "id": "02944cef-0160-a036-da12-4019fe41d9c4",
            "_lineno": 3
        }, {
            "isCustomizeDimension": true,
            "name": "workorder_role_id",
            "alias": "workorder_role_id",
            "ciType": "Workorder",
            "data_type": "REFERENCE",
            "reference": "af31b929-529f-4d60-a473-9b70e3e54c09",
            "reference_type": "846a21df-7388-4d8e-9ea8-610f20f692b6",
            "subsystem": "Workorder",
            "description": "记工作量用户的角色",
            "display_name": "工作组",
            "group": "自定义维度",
            "is_extension": false,
            "is_active": true,
            "expr": "",
            "baseView": "workorder_role",
            "default_display_name": "工作组",
            "id": "01589007-0160-a036-da12-1259217a06eb",
            "_lineno": 3
        },{
            "isCustomizeDimension":true,
            "name":"workorder_location",
            "alias":"workorder_location",
            "ciType":"Workorder",
            "data_type":"REFERENCE",
            "reference":"716ddc03-09d6-479c-9977-cec07f0c57dc",
            "reference_type":"bd42128c-9ff3-4653-a3be-bca2465654de",
            "subsystem":"Workorder",
            "description":"申请用户地址",
            "display_name":"申请用户位置",
            "group":"自定义维度",
            "is_extension":false,
            "is_active":true,
            "expr":"",
            "baseView":"apply_location",
            "isHierarchy":true,
            "closureTable":{
                "table":"sec_location",
                "idField":"id",
                "parentField":"parent",
                "alias":"apply_location"
            },
            "id":"04cfdeb6-015d-4f3a-68db-096e9d4e8416"
        }]
    ];
    return rpcRequest('/insight/v2/portal/runCiSqlToCi', params)
}

/**
 * 查询校区分布（extension为true时）
 * @param start 开始时间
 * @param end 结束时间
 * @param factType fact类型
 * @param name 字段名
 * @returns {*}
 */
export function getCountByCampusWithExtensionTrue(start, end, factType, name) {
    return getKeyByClassWithExtension(start, end, factType)
        .then(res => {
            return requestForCampusWithExtensionTrue(res, name, factType)
        })
}

function requestForCampusWithExtensionTrue(res, name, ciType) {
    let obj = JSON.parse(res).result;
    let key = obj.key;
    let sqlStr = 'WITH workorder_user as( ' +
        'SELECT id as workorder_id, create_user AS workorder_user_id ' +
        'FROM wf_workorder_fault where create_user != \'\' ' +
        'UNION ALL ' +
        'SELECT id as workorder_id, actual_handler AS workorder_user_id ' +
        'FROM wf_workorder_fault ' +
        'WHERE actual_handler != \'\' AND actual_handler != create_user' +
        '),' +
        'workorder_role AS ( ' +
        'SELECT source AS workorder_role_id, destination AS workorder_user_id ' +
        'FROM ci_relation ' +
        'WHERE type=\'62278b70-4b7d-4d30-88c1-ff818bea6919\' AND destination in (' +
        'SELECT workorder_user_id ' +
        'FROM workorder_user)' +
        '),' +
        'fact AS (' + SqlUtil.decode(SQL_KEY, obj.sqlStr) + ') ' +
        'SELECT count(fact.*) AS \"countValue\", ' +
        'COALESCE( fact.\"attributes\"->>\'' + name + '\', \'\') ' +
        'AS \"' + name + '\"  FROM fact ' +
        'GROUP BY \"' + name + '\" limit 5000;';

    let params = [ciType,
        {
            "key": key,
            "sqlStr": SqlUtil.encode(SQL_KEY, sqlStr)
        },
        []
    ];
    return rpcRequest('/insight/v2/portal/runCiSqlToCi', params)
}

/**
 * 查询校区分布（extension为false时）
 * @param start 开始时间
 * @param end 结束时间
 * @param factType fact类型
 * @param name 字段名
 * @returns {*}
 */
export function getCountByCampusWithExtensionFalse(start, end, factType, name) {
    return getKeyByClassWithExtension(start, end, factType)
        .then(res => {
            return requestForCampusWithExtensionFalse(res, name, factType)
        })
}

function requestForCampusWithExtensionFalse(res, name, ciType) {
    let obj = JSON.parse(res).result;
    let key = obj.key;
    let sqlStr = 'WITH workorder_user as( ' +
        'SELECT id as workorder_id, create_user AS workorder_user_id ' +
        'FROM wf_workorder_fault where create_user != \'\' ' +
        'UNION ALL ' +
        'SELECT id as workorder_id, actual_handler AS workorder_user_id ' +
        'FROM wf_workorder_fault ' +
        'WHERE actual_handler != \'\' AND actual_handler != create_user' +
        '),' +
        'workorder_role AS ( ' +
        'SELECT source AS workorder_role_id, destination AS workorder_user_id ' +
        'FROM ci_relation ' +
        'WHERE type=\'62278b70-4b7d-4d30-88c1-ff818bea6919\' AND destination in (SELECT workorder_user_id FROM workorder_user)' +
        '),' +
        'fact AS (' + SqlUtil.decode(SQL_KEY, obj.sqlStr) + ') ' +
        'SELECT count(fact.*) AS \"countValue\", ' +
        'COALESCE( fact.\"' + name + '\" , \'\') AS \"' + name + '\"  FROM fact ' +
        'GROUP BY fact.\"' + name + '\" limit 5000;';
    let params = [ciType,
        {
            "key": key,
            "sqlStr": SqlUtil.encode(SQL_KEY, sqlStr)
        },
        []
    ];
    return rpcRequest('/insight/v2/portal/runCiSqlToCi', params)
}

/**
 * 查询渠道分布
 * @param start 开始时间
 * @param end 结束时间
 * @param flag 是否只显示故障单
 * @returns {*}
 */
export function getCountByChannel(start, end, flag) {
    return flag === 'true' ? getKey(start, end)
        .then(res => {
            return requestForChannel(res, CI_TYPE)
        }) : getKeyByClass(start, end, CLASS_TROUBLE)
        .then(res => {
            return requestForChannel(res, CI_TYPE_FAULT)
        })
}

function requestForChannel(res, ciType) {
    let obj = JSON.parse(res).result;
    let key = obj.key;
    let sqlStr = 'WITH fact AS (' + SqlUtil.decode(SQL_KEY, obj.sqlStr) + ') ' +
        'SELECT count(fact.*) AS \"countValue\", fact.\"source\" AS \"source\" ' +
        'FROM fact ' +
        'GROUP BY \"source\" ' +
        'ORDER BY \"countValue\" ' +
        'DESC ;';
    let params = [ciType,
        {
            "key": key,
            "sqlStr": SqlUtil.encode(SQL_KEY, sqlStr)
        },
        []
    ];
    return rpcRequest('/insight/v2/portal/runCiSqlToCi', params)
}

/**
 * 查询业务统计（故障单，父节点）
 * @param start
 * @param end
 * @returns {*}
 */
export function getCount(start, end) {
    return getKeyByClass(start, end, CLASS_TROUBLE)
        .then(res => {
            let obj = JSON.parse(res).result;
            let key = obj.key;
            let sqlStr = 'WITH RECURSIVE wsc AS( ' +
                'SELECT id AS ancestor, id AS descendant, 0 AS depth ' +
                'FROM wf_service_catalog UNION ALL ' +
                'SELECT CTE.ancestor AS ancestor, C.id AS descendant, CTE.depth + 1 AS depth ' +
                'FROM wf_service_catalog AS C ' +
                'JOIN wsc AS CTE ' +
                'ON C.parent = CTE.descendant), ' +
                'fact AS (' + SqlUtil.decode(SQL_KEY, obj.sqlStr) + ') ' +
                'SELECT count(fact.*) AS \"countValue\", wsc.ancestor AS \"service_catalog\" ' +
                'FROM wsc,fact, wf_service_catalog ' +
                'WHERE fact.\"service_catalog\" = wsc.descendant ' +
                'AND wsc.ancestor = wf_service_catalog.id ' +
                'AND (wf_service_catalog.parent is null or wf_service_catalog.parent=\'\') ' +
                'GROUP BY wsc.ancestor ' +
                'ORDER BY \"countValue\" ' +
                'DESC ;';
            let params = [CI_TYPE,
                {
                    "key": key,
                    "sqlStr": SqlUtil.encode(SQL_KEY, sqlStr)
                },
                []
            ];
            return rpcRequest('/insight/v2/portal/runCiSqlToCi', params)
        })
}

/**
 * 查询业务统计（故障单，末级节点）
 * @param start
 * @param end
 * @returns {*}
 */
export function getCountForTrouble(start, end) {
    return getKeyByClass(start, end, CLASS_TROUBLE)
        .then(res => {
            let obj = JSON.parse(res).result;
            let key = obj.key;
            let sqlStr = 'WITH fact AS (' + SqlUtil.decode(SQL_KEY, obj.sqlStr) + ') ' +
                'SELECT count(fact.*) AS \"countValue\", ' +
                'COALESCE( fact.\"service_catalog\" , \'\') ' +
                'AS \"service_catalog\"  ' +
                'FROM fact ' +
                'GROUP BY \"service_catalog\" ' +
                'ORDER BY \"countValue\" ' +
                'DESC limit 5;';
            let params = [CI_TYPE,
                {
                    "key": key,
                    "sqlStr": SqlUtil.encode(SQL_KEY, sqlStr)
                },
                []
            ];
            return rpcRequest('/insight/v2/portal/runCiSqlToCi', params)
        })
}

/**
 * 查询业务统计（请求单）
 * @param start
 * @param end
 * @returns {*}
 */
export function getCountForRequest(start, end) {
    return getKeyByClass(start, end, CLASS_REQUEST)
        .then(res => {
            let obj = JSON.parse(res).result;
            let key = obj.key;
            let sqlStr = 'WITH fact AS (' + SqlUtil.decode(SQL_KEY, obj.sqlStr) + ') ' +
                'SELECT count(fact.*) AS \"countValue\", ' +
                'COALESCE( fact.\"service_catalog\" , \'\') ' +
                'AS \"service_catalog\"  ' +
                'FROM fact ' +
                'GROUP BY \"service_catalog\" ' +
                'ORDER BY \"countValue\" ' +
                'DESC limit 5;';
            let params = [CI_TYPE,
                {
                    "key": key,
                    "sqlStr": SqlUtil.encode(SQL_KEY, sqlStr)
                },
                []
            ];
            return rpcRequest('/insight/v2/portal/runCiSqlToCi', params)
        })
}

/**
 * 获取最近一次月报配置
 * @returns {*}
 */
export function getCurrentConfigs() {
    return rpcRequest('/insight/v2/wechat/portal/getCurrentConfig')
}

export function getConfigByMonth(month) {
    return rpcRequest('/insight/v2/wechat/portal/getConfigByMonth', [month])
}

/**
 * 获取历史月报配置
 * @param num 月份数 如果已有的配置数目小于此值，则返回全部已有的配置
 * @returns {*}
 */
export function getHistoryConfigs(num) {
    return rpcRequest('/insight/v2/wechat/portal/getHistoryConfigs', [num])
}
