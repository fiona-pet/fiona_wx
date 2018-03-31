import {rpcRequest} from '../../utils/rpcRequest'

const CI_TYPE_ASSET = '23df6b11-28d0-4a39-9328-c43b7aec9718';//资产的ciTypeId
const CI_TYPE_TRACK = '737fb2a0-a9a5-41fd-b36f-d32d604e2128';//活动记录的ciTypeId
const RELATION = '4e19d457-9c8a-4bb2-b288-23facffb863b';//资产与活动记录的关联id

/**
 * 获取资产列表
 * @returns {*}
 */
export function getAssetsList() {
    let params = [CI_TYPE_ASSET,
            {
                "filter": {
                    "attribute": {
                        "and": []
                    },
                    "query": ""
                },
                "orders": [
                    {
                        "name": "create_time",
                        "type": "desc"
                    }
                ],
                "pageSize": 15,
                "pageIndex": 1
            }
    ];

    return rpcRequest('/v2/asset/asset/page', params)
}

/**
 * 获取资产固定部分视图
 * @returns {*}
 */
export function getAssetView(id, obj) {
    let params = [
        {
            "filter": {
                "attribute": {
                    "and": [
                        {
                            "simple": {
                                "name": "ci_type",
                                "operator": "eq",
                                "value": id,
                            }
                        },
                        {
                            "simple": {
                                "name": "view_type",
                                "operator": "eq",
                                "value": "form"
                            }
                        }
                    ]
                }
            }
        },
        obj
    ];

    return rpcRequest('/v2/cmdb/ui/view/getByContext', params)
}

/**
 * 获取资产数据详情
 * @param typeId 资产类型id
 * @param id 资产id
 * @returns {*}
 */
export function getAssetDetail(typeId, id) {
    return rpcRequest('/v2/asset/asset/getById', [typeId, id])
}

/**
 * 获取资产活动记录列表
 * @param id 资产id
 * @returns {*}
 */
export function getAssetTrackList(id) {
    let params =  [CI_TYPE_TRACK,
        {
            "attributes": [
                "id",
                "display_name",
                "description",
                "create_time",
                "PcreateUser.id",
                "PcreateUser.display_name",
                "Pdepartment.id",
                "Pdepartment.display_name"
            ],
            "filter": {
                "association": "P:create_user(PcreateUser).P:department(Pdepartment)",
                "relation": [
                    {
                        "ids": [id],
                        "relationType": RELATION,
                        "type": "oneof"
                    }
                ]
            },
            "orders": [
                {
                    "name": "create_time",
                    "type": "desc"
                }
            ]
        }
    ];

    return rpcRequest('/v2/cmdb/ci/list', params)
}

/**
 * 变更资产
 * @param params 资产对象，要包含id，typeId和变更内容
 * @returns {*}
 */
export function updateAsset(params) {
    return rpcRequest('/v2/asset/asset/update', params)
}