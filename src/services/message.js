import {rpcRequest} from '../utils/rpcRequest'
import Cookie from '../core/Cookie';


const messageNumCiTypeId = "d9c9126e-7799-46e9-87ac-174e8f7df846";

/*****************getMseeagerNum*******************/
export function getMessageNum() {
    return rpcRequest('/v2/cmdb/ci/count', ["d9c9126e-7799-46e9-87ac-174e8f7df846", {//固定值，消息的查询id
        "filter": {
            "attribute": {
                "and": [

                    {
                        "simple": {//过滤对象1
                            "name": "receiver",//按接收人进行过滤
                            "operator": "eq",
                            "value": Cookie.getId()//传当前登录用户的id
                        }
                    },
                    {//过滤对象2
                        "simple": {
                            "name": "state",//按消息状态进行过滤
                            "operator": "eq",
                            "value": 0//0未读，1已读
                        }
                    }, {
                        "simple": {
                            "name": "link",
                            "operator": "not_ilike",
                            "value": "inventory"//微信端不实现资产盘点，因此只过滤和资产到保有关的消息(link字段没有url的)
                        }
                    },
                    {
                        "or": [{
                            "simple": {
                                "name": "msg_type",
                                "operator": "eq",
                                "value": "Asset"
                            }
                        }, {
                            "simple": {
                                "name": "msg_type",
                                "operator": "eq",
                                "value": "WorkOrder"
                            }
                        }, {
                            "simple": {
                                "name": "msg_type",
                                "operator": "eq",
                                "value": "WeChatReport"
                            }
                        }]
                    }]
            }
        },
        "orders": [{
            "name": "createTime",
            "type": "desc"
        }]
    }]);
}
/***************获取资产消息数量***************/
export function getAssetsMessageNum() {
    return rpcRequest('/v2/cmdb/ci/count', ["d9c9126e-7799-46e9-87ac-174e8f7df846", {//固定值，消息的查询id
        "filter": {
            "attribute": {
                "and": [
                    {
                        "simple": {//过滤对象1
                            "name": "receiver",//按接收人进行过滤
                            "operator": "eq",
                            "value": Cookie.getId()//传当前登录用户的id
                        }
                    },
                    {//过滤对象2
                        "simple": {
                            "name": "state",//按消息状态进行过滤
                            "operator": "eq",
                            "value": 0//0未读，1已读
                        }
                    },
                    {
                        "simple": {//过滤对象3
                            "name": "msg_type",//按消息类型进行过滤（如果不过滤，显示全部类型）
                            "operator": "eq",
                            "value": "Asset"//workorder服务单，knowledge知识库，task协同任务，asset资产，contract合同
                        }
                    },]
            }
        },
        "orders": [{
            "name": "createTime",
            "type": "desc"
        }]
    }]);
}
/***************获取服务消息数量***************/
export function getServicesMessageNum() {
    return rpcRequest('/v2/cmdb/ci/count', ["d9c9126e-7799-46e9-87ac-174e8f7df846", {//固定值，消息的查询id
        "filter": {
            "attribute": {
                "and": [
                    {
                        "simple": {//过滤对象1
                            "name": "receiver",//按接收人进行过滤
                            "operator": "eq",
                            "value": Cookie.getId()//传当前登录用户的id
                        }
                    },
                    {//过滤对象2
                        "simple": {
                            "name": "state",//按消息状态进行过滤
                            "operator": "eq",
                            "value": 0//0未读，1已读
                        }
                    },
                    {
                        "simple": {//过滤对象3
                            "name": "msg_type",//按消息类型进行过滤（如果不过滤，显示全部类型）
                            "operator": "eq",
                            "value": "WorkOrder"//workorder服务单，knowledge知识库，task协同任务，asset资产，contract合同
                        }
                    },]
            }
        },
        "orders": [{
            "name": "createTime",
            "type": "desc"
        }]
    }]);
}

/***************获取资产消息列表***************/
export function getServicesMessages(index, isAll) {
    let and = isAll ? [
        {//过滤条件和前面4.2一样（未读换成了已读）
            "simple": {//只过滤和当前登录用户相关的
                "name": "receiver",
                "operator": "eq",
                "value": Cookie.getId()
            }
        }, {
            "simple": {//过滤对象3
                "name": "msg_type",//按消息类型进行过滤（如果不过滤，显示全部类型）
                "operator": "eq",
                "value": "WorkOrder"//workorder服务单，knowledge知识库，task协同任务，asset资产，contract合同
            }
        }
    ] : [
        {//过滤条件和前面4.2一样（未读换成了已读）
            "simple": {//只过滤和当前登录用户相关的
                "name": "receiver",
                "operator": "eq",
                "value": Cookie.getId()
            }
        },
        {//只过滤已读的
            "simple": {
                "name": "state",
                "operator": "eq",
                "value": 0
            }
        }, {
            "simple": {//过滤对象3
                "name": "msg_type",//按消息类型进行过滤（如果不过滤，显示全部类型）
                "operator": "eq",
                "value": "WorkOrder"//workorder服务单，knowledge知识库，task协同任务，asset资产，contract合同
            }
        }
    ];
    return rpcRequest('/v2/cmdb/ci/page', [messageNumCiTypeId, {//这里传消息的查询id
        "filter": {
            "attribute": {
                "and": and
            },
            "query": ""
        },
        "orders": [{
            "name": "create_time",
            "type": "desc"
        }],
        "pageSize": 15,//每页显示条数
        "pageIndex": index//页码
    }
    ]);
}

/***************获取月报消息列表***************/
export function getMonthlyMessages(index, isAll) {
    let and = isAll ? [
        {//过滤条件和前面4.2一样（未读换成了已读）
            "simple": {//只过滤和当前登录用户相关的
                "name": "receiver",
                "operator": "eq",
                "value": Cookie.getId()
            }
        }, {
            "simple": {//过滤对象3
                "name": "msg_type",//按消息类型进行过滤（如果不过滤，显示全部类型）
                "operator": "eq",
                "value": "WeChatReport"
            }
        }
    ] : [
        {//过滤条件和前面4.2一样（未读换成了已读）
            "simple": {//只过滤和当前登录用户相关的
                "name": "receiver",
                "operator": "eq",
                "value": Cookie.getId()
            }
        },
        {//只过滤已读的
            "simple": {
                "name": "state",
                "operator": "eq",
                "value": 0
            }
        }, {
            "simple": {//过滤对象3
                "name": "msg_type",//按消息类型进行过滤（如果不过滤，显示全部类型）
                "operator": "eq",
                "value": "WeChatReport"
            }
        }
    ];
    return rpcRequest('/v2/cmdb/ci/page', [messageNumCiTypeId, {//这里传消息的查询id
        "filter": {
            "attribute": {
                "and": and
            },
            "query": ""
        },
        "orders": [{
            "name": "create_time",
            "type": "desc"
        }],
        "pageSize": 15,//每页显示条数
        "pageIndex": index//页码
    }
    ]);
}
/***************获取资产消息列表***************/
export function getAssetMessages(index, isAll) {
    let and = isAll ? [
        {//过滤条件和前面4.2一样（未读换成了已读）
            "simple": {//只过滤和当前登录用户相关的
                "name": "receiver",
                "operator": "eq",
                "value": Cookie.getId()
            }
        }, {
            "simple": {//过滤对象3
                "name": "msg_type",//按消息类型进行过滤（如果不过滤，显示全部类型）
                "operator": "eq",
                "value": "Asset"
            }
        }, {
            "simple": {
                "name": "link",
                "operator": "not_ilike",
                "value": "inventory"//微信端不实现资产盘点，因此只过滤和资产到保有关的消息(link字段没有url的)
            }
        }
    ] : [
        {//过滤条件和前面4.2一样（未读换成了已读）
            "simple": {//只过滤和当前登录用户相关的
                "name": "receiver",
                "operator": "eq",
                "value": Cookie.getId()
            }
        },
        {//只过滤已读的
            "simple": {
                "name": "state",
                "operator": "eq",
                "value": 0
            }
        }, {
            "simple": {//过滤对象3
                "name": "msg_type",//按消息类型进行过滤（如果不过滤，显示全部类型）
                "operator": "eq",
                "value": "Asset"
            }
        }, {
            "simple": {
                "name": "link",
                "operator": "not_ilike",
                "value": "inventory"//微信端不实现资产盘点，因此只过滤和资产到保有关的消息(link字段没有url的)
            }
        }
    ];
    return rpcRequest('/v2/cmdb/ci/page', [messageNumCiTypeId, {//这里传消息的查询id
        "filter": {
            "attribute": {
                "and": and
            },
            "query": ""
        },
        "orders": [{
            "name": "create_time",
            "type": "desc"
        }],
        "pageSize": 15,//每页显示条数
        "pageIndex": index//页码
    }
    ]);
}

/**
 * 读取消息
 * @param id 消息id
 * @returns {*}
 */
export function readMessage(id) {
    let params = {
        "type": messageNumCiTypeId,
        "id": id,
        "state": 1
    };
    return rpcRequest('/v2/cmdb/ci/update', [params])
}

