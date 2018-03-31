import { request, rpcRequest, fileRequest} from '../utils/rpcRequest'
import Cookie from '../core/Cookie';
import Auth from '../models/Auth'
import Base64ToFormData from '../utils/Base64ToFormData'
import JsonUtil from "../utils/JsonUtil";

const assetQueryId = "686d3173-d259-4e6a-8fa5-7959d0a1a3c6";
const userQueryId = "fa09796e-762d-4240-be51-a7e1ba3d23b7";
const locationQueryId = "716ddc03-09d6-479c-9977-cec07f0c57dc";

const FILE_TYPE_ID = "abd9683b-cbea-4a21-a6fd-7fc295569d14";

/*****************AssetSearch*******************/
export function getAssetList(pageIndex, text) {
    let params = [
        '686d3173-d259-4e6a-8fa5-7959d0a1a3c6',
        {
            "pageSize": 10,
            "pageIndex": pageIndex,
            "orders": [
                {
                    "name": "index",
                    "type": "desc"
                }
            ],
            "filter": {
                "attribute": {
                    "and": []
                },
                "query": text
            }
        }
    ];
    return rpcRequest('/v2/asset/asset/page', params)
}

/*****************AssetNum*******************/
export function getAssetListNum() {
    let params = [
        '686d3173-d259-4e6a-8fa5-7959d0a1a3c6',
        {
            "pageSize": 10,
            "pageIndex": 1,
            "orders": [
                {
                    "name": "index",
                    "type": "desc"
                }
            ]
        }
    ];
    return rpcRequest('/v2/asset/asset/page', params)
}

export function filterAssetList(text) {
    let params = [
        '686d3173-d259-4e6a-8fa5-7959d0a1a3c6',
        {
            "pageSize": 10,
            "pageIndex": pageIndex,
        }
    ];
    return rpcRequest('/v2/cmdb/ci/page', params)
}
/*****************AssetSearch*******************/
export function getBindAsset(ids) {
    let params = [
        '686d3173-d259-4e6a-8fa5-7959d0a1a3c6',
        {
            "filter": {
                "attribute": null,
                "relation": [
                    {
                        "type": "oneof",
                        "relationType": "6a6cfc33-6781-409e-ac0a-948e0a73cb06",
                        "ids": [
                            ids
                        ]
                    }
                ],
            },
        }
    ];
    return rpcRequest('/v2/asset/asset/list', params)
}
export function getLookupItem(id, name, pageIndex, query) {
    let params = [
        {
            "pageSize": 20,
            "pageIndex": pageIndex,
            "orders": [
                {
                    "name": "display_name",
                    "type": "desc"
                }
            ],
            "filter": {
                "query": query,
                "attribute": {
                    "and": [
                        {
                            "simple": {
                                "name": "lookup_type",
                                "operator": "eq",
                                "value": id
                            },
                            "simple": {
                                "name": "name",
                                "operator": "eq",
                                "value": name
                            },
                        }
                    ]
                }
            }
        }
    ];
    return rpcRequest('/v2/cmdb/meta/lookup/page', params)
}
export function getLookupList(id, pageIndex, query) {
    let params = [
        {
            "pageSize": 20,
            "pageIndex": pageIndex,
            "orders": [
                {
                    "name": "display_name",
                    "type": "desc"
                }
            ],
            "filter": {
                "query": query,
                "attribute": {
                    "and": [
                        {
                            "simple": {
                                "name": "lookup_type",
                                "operator": "eq",
                                "value": id
                            }
                        }
                    ]
                }
            }
        }
    ];
    return rpcRequest('/v2/cmdb/meta/lookup/page', params)
}
export function getReferenceList(id, pageIndex, query) {
    let params = [
        id,
        {
            "pageSize": 20,
            "pageIndex": pageIndex,
            "orders": [{
                "name": "display_name",
                "type": "desc"
            }],
            "filter": {
                "query": query,
            }
        }
    ];
    return rpcRequest('/v2/cmdb/ci/page', params)
}
export function getPriority(id, pageIndex, query) {
    let params = [
        id,
        {
            "pageSize": 20,
            "pageIndex": pageIndex,
            "orders": [{
                "name": "code",
                "type": "desc"
            }],
            "filter": {
                "query": query,
                "attribute": {
                    "simple": {
                        "name": "service_level",
                        "operator": "eq",
                        "value": "24438e10-45b0-4717-aae4-be24cda2216e"
                    }
                }
            }
        }
    ];
    return rpcRequest('/v2/cmdb/ci/page', params)
}
export function getPreUserList(pageIndex, query) {
    let params = [
        "fa09796e-762d-4240-be51-a7e1ba3d23b7",
        {
            "pageSize": 20,
            "pageIndex": pageIndex,
            "filter": {
                "query": query,
                "attribute": {
                    "simple": {"name": "user_type", "operator": "in", "value": [1]}
                },
                "orders": [{//排序条件
                    "name": "display_name",//不可省略
                    "type": "desc"//asc升序 desc降序
                }]
            }
        }
    ];
    return rpcRequest('/v2/cmdb/ci/page', params)
}
export function getPreRoleList(pageIndex, query) {
    let params = [
        "af31b929-529f-4d60-a473-9b70e3e54c09",
        {
            "pageSize": 20,
            "pageIndex": pageIndex,
            "filter": {
                "query": query,
            }
        }
    ];
    return rpcRequest('/v2/cmdb/ci/page', params)
}
/*****************getCitype*******************/
export function getCitype() {
    return rpcRequest('/v2/cmdb/meta/citype/list', [{
        "attributes": ["id", "display_name"],//过滤字段
        "filter": {
            "attribute": {
                "simple": {
                    "name": "id",
                    "operator": "inherit",
                    "value": assetQueryId //固定值，资产的查询id
                }
            }
        },
        "orders": [
            {
                "name": "id_path",
                "type": "asc"
            }
        ]
    }])
}

/*****************WidgetIdFromGetByContext*******************/
export function getWidgetIdFromGetByContext(typeId) {

    return rpcRequest('/v2/cmdb/ui/view/getViewList', [{
        "filter": {
            "attribute": {
                "and": [{
                    "simple": {
                        "name": "ci_type",
                        "operator": "eq",
                        "value": typeId
                    }
                }, {"simple": {"name": "view_type", "operator": "eq", "value": "form"}}, {
                    "simple": {
                        "name": "default",
                        "operator": "eq",
                        "value": true
                    }
                }]
            }
        }
    }])
}

/*****************WidgetIdFromGetByContext*******************/
export function getWidgetIdFromOrder() {
    return rpcRequest('/v2/cmdb/ui/view/getViewList', [{
        "filter": {
            "attribute": {
                "and": [{
                    "simple": {
                        "name": "ci_type",
                        "operator": "eq",
                        "value": "0eea99f2-d189-4875-8e23-2f326c1f8ca0"
                    }
                }, {
                    "simple": {
                        "name": "view_type",
                        "operator": "eq",
                        "value": "form"
                    }
                }]
            }
        }
    }
    ])
}

/*****************getWidgetIdByPermision*******************/
export function getWidgetIdByPermision(type, detail) {
    return rpcRequest('/v2/cmdb/ui/view/getByPermision', [type, detail])
}


/*****************AssetDetail*******************/
export function getAssetDetailForm(params) {
    return rpcRequest('/v2/cmdb/ui/widget/config/getById', params)
}

export function getFormsByCatalog(catalogId, type, result) {
    return rpcRequest('/v2/cmdb/ui/view/getFormsByCatalog', [catalogId, type, result])
}
export function getAssetDetail(params) {
    //更换接口，参数结构与原先一致，多了部分属性
    // return rpcRequest('/v2/cmdb/ci/getById', params)
    return rpcRequest('/v2/workorder/data/getById', params)
}

export function getAssetById(id) {
    return rpcRequest('/v2/asset/asset/getById', ["686d3173-d259-4e6a-8fa5-7959d0a1a3c6",//查询类型id，此处是查询资产
        id]
    );
}

export function findUserList(values) {
    return rpcRequest('/v2/cmdb/ci/list', [
        "fa09796e-762d-4240-be51-a7e1ba3d23b7",
        {
            "filter": {
                "attribute": {
                    "simple": {
                        "name": "id",
                        "operator": "in",
                        "value": values.split(",")
                    }
                }
            }
        }
    ]);
}

export function findRolesList(values) {
    return rpcRequest('/v2/cmdb/ci/list', [
        "af31b929-529f-4d60-a473-9b70e3e54c09",
        {
            "filter": {
                "attribute": {
                    "simple": {
                        "name": "id",
                        "operator": "in",
                        "value": values.split(",")
                    }
                }
            }
        }
    ]);
}

export function getUserList() {
    return rpcRequest('/v2/cmdb/ci/list', [
        userQueryId, {
            "attributes": ["id", "display_name"],
            "orders": [{
                "name": "display_name",
                "type": "desc"
            }],
            "filter": {}
        }
    ]);
}

export function onSearchUser(key) {
    return rpcRequest('/v2/cmdb/ci/list', [
        userQueryId, {
            "attributes": ["id", "display_name"],
            "orders": [{
                "name": "display_name",
                "type": "desc"
            }],
            "filter": {"query": key}
        }
    ]);
}

export function getLocationList() {
    return rpcRequest('/v2/cmdb/ci/list', [
        locationQueryId, {
            "attributes": ["id", "display_name"],
            "orders": [{
                "name": "display_name",
                "type": "desc"
            }],
            "filter": {}
        }
    ]);
}

export function onSearchLocation(key) {
    return rpcRequest('/v2/cmdb/ci/list', [
        locationQueryId, {
            "attributes": ["id", "display_name"],
            "orders": [{
                "name": "display_name",
                "type": "desc"
            }],
            "filter": {"query": key}
        }
    ]);
}

export function onDeliver(id, desc, location, user) {
    let locationName = location.display_name;
    if (!locationName.length) {
        return rpcRequest('/v2/asset/asset/batchUpdate', [
            [id],
            {
                "user": user,
                "asset_use": desc,
                "asset_status": "USING"
            }
        ]);
    } else {
        return rpcRequest('/v2/asset/asset/batchUpdate', [
            [id],
            {
                "user": user,
                "physical_location": location,
                "asset_use": desc,
                "asset_status": "USING"
            }
        ]);
    }
}


/*****************AssetManage*******************/
export function getsign(params) {
    return rpcRequest('/v2/cmdb/ci/page', params)
}

/*****************ServiceTracking*******************/
export function getServiceTrackingList(statusType, pageIndex, searchText) {
    return rpcRequest('/v2/workorder/data/page', [statusType, {
        "filter": {
            "attribute": {
                "and": [{
                    "simple": {
                        "name": "id",	//固定写法
                        "operator": "in-lookup",//固定写法
                        "value": ["2", "3", "4"]//0我的待办（包括草稿），1同组代办，2我创建的，3我的已办，4同组已办。一般查待办传0和1，查已办传3和4。 暂时去除2
                    }
                }
                ]
            },
            "query": searchText
        },
        "orders": [{
            "name": "index",
            "type": "desc"
        }],
        "pageSize": 6,
        "pageIndex": pageIndex
    }])
}

/*****************ServiceTracking*******************/
export function getUserServiceTrackingList(statusType, pageIndex, searchText) {
    return rpcRequest('/v2/workorder/data/page', [statusType, {
        "filter": {
            "attribute": {
                "and": [
                    {
                        "simple": {
                            "name": "apply_user",
                            "operator": "eq",
                            "value": Cookie.getId()
                        }
                    }
                ]
            },
            "query": searchText
        },
        "orders": [{
            "name": "index",
            "type": "desc"
        }],
        "pageSize": 6,
        "pageIndex": pageIndex
    }])
}

/*****************Todo*******************/
export function getTodoList(statusType, pageIndex, searchText) {
    return rpcRequest('/v2/workorder/data/page', [statusType, {
        "filter": {
            "attribute": {
                "and": [
                    {
                        "simple": {
                            "name": "id",
                            "operator": "in-lookup",
                            "value": ["0", "1", "5"]
                        }
                    }
                ]
            },
            "query": searchText
        },
        "orders": [{
            "name": "index",
            "type": "desc"
        }],
        "pageSize": 6,
        "pageIndex": pageIndex
    }])
}

/*****************Todo*******************/
export function getActions(workerNodeOrderId, id) {
    return rpcRequest('/v2/workorder/action/list', [workerNodeOrderId, id]);
}

/*****************Todo*******************/
export function getNodeByOrder(id) {
    var p1 = rpcRequest('/v2/workorder/orderConfig/getNodeByOrder', [id]);

    return p1.then(res => {
        let obj = JSON.parse(res);
        return getActions(obj.result, id);
    });
}

/*****************NodeId*******************/
export function getNodeIdByOrder(id) {
    return rpcRequest('/v2/workorder/orderConfig/getNodeByOrder', [id]);
}

/***************** workorder action execute *******************/
export function workorderActionExecute(param) {
    return rpcRequest('/v2/workorder/action/execute', param);
}

/***************** getNodeByServiceCatalog *******************/
export function getNodeByServiceCatalog(serviceCatalogId) {
    let p1 = rpcRequest('/v2/workorder/orderConfig/getNodeByServiceCatalog', [serviceCatalogId]);

    return p1.then(res => {
        let obj = JSON.parse(res);
        return getActions(obj.result, '');
    });
}

/***************** getNodeId *******************/
export function getNodeId(serviceCatalogId) {
    return rpcRequest('/v2/workorder/orderConfig/getNodeByServiceCatalog', [serviceCatalogId]);
}
/***************** getWorkOrderType *******************/
export function getWorkOrderType(catalogId) {
    return rpcRequest('/v2/cmdb/ci/getById', ["5be7a27c-0a85-402e-b54f-3efc5ed4623d", catalogId]);
}
/***************** 附件条数 *******************/
export function getFileNum(id) {
    return rpcRequest('/v2/cmdb/ci/count', [FILE_TYPE_ID, {
        "filter": {
            "attribute": {
                "and": [
                    {
                        "simple": {
                            "name": "instance",
                            "operator": "eq",
                            "value": id
                        }
                    },
                ]
            },
        }
    }])
}

/***************** 附件列表 *******************/
export function getFileList(id) {
    return rpcRequest('/v2/file/list', [{
        "filter": {
            "attribute": {
                "simple": {
                    "name": "instance",
                    "operator": "eq",
                    "value": id
                }
            }
        },
        "orders": [{
            "name": "create_time",
            "type": "desc"
        }]
    }])
}

/**
 * 删除附件
 * @param id 附件id
 * @returns {*}
 */
export function deleteById(id) {
    return rpcRequest('/v2/file/deleteById', [id])
}

/***************** 评论 *******************/
export function getCommentsList(orderrID) {
    return rpcRequest('/v2/cmdb/ci/list', ["d7f0604f-b63b-4946-9a2a-2c15ea50973c", {
        "attributes": [//建议过滤以下字段
            "id",
            "description",
            "parent",
            "create_user",
            "create_time"
        ],
        "filter": {
            "association": "[R:S:1a23f570-09b5-44cc-85b8-8487502c1755(a)]",
            "attribute": {
                "simple": {
                    "name": "a.id",
                    "operator": "eq",
                    "value": orderrID//这里填工单的id，其它都是固定值
                }
            }
        },
        "orders": [
            {
                "name": "create_time",
                "type": "desc"//建议按创建时间降序排列
            }
        ]
    }]);
}
/***************** 删除评论 *******************/
export function deleteComment(commenId) {
    return rpcRequest('/v2/cmdb/ci/deleteByIds', [[commenId]]);
}
/***************** 新增评论 *******************/
export function addComment(orderId, commenId, description) {
    if ('' == commenId) {
        return rpcRequest('/v2/cmdb/ci/createWithRel', [
                {
                    "description": description,
                    "type": "d7f0604f-b63b-4946-9a2a-2c15ea50973c",//评论的typeId，固定值
                    "create_user": Cookie.getId(), //回复人的id（四处都是同一个值）
                },
                [
                    {
                        "type": "f98328c0-60b5-4750-97ed-f2fd9e43c606",//评论和创建人的关联id，固定值
                        "destination": Cookie.getId(), //回复人的id
                        "modify_user": Cookie.getId()//回复人的id
                    },
                    {
                        "type": "1a23f570-09b5-44cc-85b8-8487502c1755",//评论和工单的关联id，固定值
                        "source": orderId,//工单id
                        "modify_user": Cookie.getId()//回复人的id
                    }
                ]
            ]
        );
    } else {
        return rpcRequest('/v2/cmdb/ci/createWithRel', [
                {
                    "description": description,
                    "type": "d7f0604f-b63b-4946-9a2a-2c15ea50973c",//评论的typeId，固定值
                    "create_user": Cookie.getId(), //回复人的id（四处都是同一个值）
                    "parent": commenId//回复别人评论时，这里传被回复的评论的id
                },
                [
                    {
                        "type": "f98328c0-60b5-4750-97ed-f2fd9e43c606",//评论和创建人的关联id，固定值
                        "destination": Cookie.getId(), //回复人的id
                        "modify_user": Cookie.getId()//回复人的id
                    },
                    {
                        "type": "1a23f570-09b5-44cc-85b8-8487502c1755",//评论和工单的关联id，固定值
                        "source": orderId,//工单id
                        "modify_user": Cookie.getId()//回复人的id
                    }
                ]
            ]
        );
    }

}
/***************** 反馈评分 *******************/
export function addEvauation(actionId, evaluationData) {
    return rpcRequest('/v2/workorder/action/execute', [actionId//上一步获取的评论动作id
            , evaluationData,
        ]
    );

}
export function conditionExecute(param) {
    return rpcRequest('/v2/workorder/condition/execute', param);
}

/***************** 获取工单id *******************/
export function getOrderId() {
    return rpcRequest('/v2/cmdb/ci/id', []);
}
/***************** 绑定工单资产 *******************/
export function createByKeys(assetId, orderId) {
    return rpcRequest('/v2/cmdb/relation/createByKeys', ['6a6cfc33-6781-409e-ac0a-948e0a73cb06', [assetId], [orderId]]);
}
/***************** getNodeByServiceCatalog *******************/
export function getViewCreateConfig() {
    console.log("getViewCreateConfig", Auth.getTroubleTypeId());
    return rpcRequest('/v2/cmdb/ui/view/getView', [Auth.getTroubleTypeId()]);
}

/***************** getDyViewCreate *******************/
export function getDyViewCreate(processId) {
    return getAssetDetail(["5be7a27c-0a85-402e-b54f-3efc5ed4623d", processId]).then(res => {
        let obj = JSON.parse(res);

        return rpcRequest('/v2/cmdb/ui/view/getByPermision', [obj.result.workorder_type.id, {}]);
    });
}
/***************** getViewDetailConfig *******************/
export function getCiList() {
    return rpcRequest('/v2/cmdb/ci/list', ["b7d419b7-a043-4a27-add4-f3fd4e413306", {
        "attributes": ["process"],
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
                        "value": "0"
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
                            "operator": "inherit",
                            "value": "949f9d0a-6929-4b19-8eb7-7dce4f4ad507"
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
    }
    ]);
}
export function getViewDetailConfig(classify, result) {

    if (classify.id != '1') {
        return getCiList().then(res => {
            let obj = JSON.parse(res);
            let ciList = obj.result;
            let processId = "";
            ciList.map((item) => {
                if (item.process.display_name == result.process.display_name) {
                    processId = item.process.id
                }
            });
            return getAssetDetail(["5be7a27c-0a85-402e-b54f-3efc5ed4623d", processId]).then(res => {
                let detailObj = JSON.parse(res);
                return rpcRequest('/v2/cmdb/ui/view/getByGroup', [detailObj.result.workorder_type.id, result]);
            });
        });

    } else {
        let detailTypeId = '9c26ab71-185d-4e35-8aaf-ef7d6c3fd256';
        return rpcRequest('/v2/cmdb/ui/view/getView', [detailTypeId]);
    }
}
/***************** getDynamicForm *******************/
export function getDynamicForm(id) {
    let params = [{
        "filter": {
            "attribute": {
                "and": [{
                    "simple": {
                        "name": "owner",
                        "operator": "eq",
                        "value": id
                    }
                }, {
                    "simple": {
                        "name": "clazz",
                        "operator": "eq",
                        "value": "dyform"
                    }
                }
                ]
            }
        }
    }]
    return rpcRequest('/v2/cmdb/ui/widget/config/list', params);
}
/***************** getViewById *******************/
export function getViewById(id) {
    return rpcRequest('/v2/cmdb/ui/view/getView', [id]);
}
/***************** getActionById *******************/
export function getActionById(id) {
    return rpcRequest('/v2/cmdb/ui/action/getById', [id]);
}
/***************** getActivityRecordById *******************/
export function getActivityRecordById(id) {
    return rpcRequest('/v2/cmdb/ci/list', ["737fb2a0-a9a5-41fd-b36f-d32d604e2128", {//查询id，固定值
        "filter": {
            "relation": [{
                "ids": [id],//工单id
                "relationType": "42e2bb1d-2d74-4cc7-a53b-ba5413b14792",//与工单的关联id，固定值
                "type": "oneof"
            }]
        },
        "orders": [{
            "name": "create_time",//建议按创建时间降序排列
            "type": "desc"
        }]
    }]);
}
/***************** 文件上传 *******************/
export function upload(base64, id) {
    let formData = Base64ToFormData(base64);
    formData.append("fileName", "uploadFile");
    formData.append("subsystem", 'eui');
    formData.append("instanceType", undefined);
    formData.append("instanceId", undefined);
    formData.append("instance", id);

    return fileRequest('?method=/v2/file/upload', formData);
}
/***************** 文件删除 *******************/
export function deleteFile(id) {
    return rpcRequest('/v2/file/deleteById', [id]);
}
