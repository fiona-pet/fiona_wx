/**
 * Created by zhongfan on 2017/7/5.
 */
import {
    onDeliver,
    getCitype,
    getAssetDetailForm,
    getAssetDetail,
    getWidgetIdFromGetByContext,
    getAssetList,
    getServiceTrackingList,
    getUserServiceTrackingList,
    getTodoList,
    getAssetListNum
} from '../services/utilization'
import DateUtil from '../utils/DateUtil'
import JsonUtil from '../utils/JsonUtil'
import Common from './Common'

export default {
    /*****************出库*******************/
    deliver(id, desc, location, user, success, failure) {
        onDeliver(id, desc, location, user).then((res) => {
            let obj = JSON.parse(res);
            if (obj.result != undefined) {
                success()
            }else {
                failure("属性值不正确")
            }
        }, err => {
            failure("网络请求失败")
        });
    },

    /*****************动态表单*******************/
    getCiType(id, typeId, success, failure) {
        getCitype().then(res => {
            let obj = JSON.parse(res);
            for (let i = 0; i < obj.result.length;i++){
                let mtype = obj.result[i];
                if (mtype.id === typeId){
                    getWidgetIdFromGetByContext(mtype.id).then(res => {
                        let obj = JSON.parse(res);
                        let widgetId = JsonUtil.getChildren(obj.result, 'widgetId')[0];
                        getAssetDetailForm([widgetId]).then(res => {
                            let obj = JSON.parse(res);
                            let components = obj.result.config.components;
                            getAssetDetail([typeId, id]).then(res=>{
                                let obj = JSON.parse(res);
                                for (let j = 0; j < components.length; j++){
                                    let val = obj.result[components[j].name];
                                    if ( typeof(val) === "object"){
                                        components[j].defaultValue=val.display_name;
                                    }else{
                                        if (components[j].editor === 'datepicker') {
                                            components[j].defaultValue = val ? DateUtil.datetimeFormat(val):'';
                                        }else if (components[j].editor === 'datetimepicker') {
                                            components[j].defaultValue = val ? DateUtil.defaultFormatTime(val):'';
                                        }else{
                                            components[j].defaultValue = val;
                                        }
                                    }
                                }
                                success(components, obj.result)
                            });
                        }, err => console.log(err));

                    }, err => console.log(err));
                }
            }

        }, err => console.log(err));
    },
    getAssetList(pageIndex, query, success, failure) {
        Common.handlePage(getAssetList(pageIndex, query), success, failure)
    },
    getServiceTrackingList(statusType, pageIndex, searchText, success, failure) {
        Common.handlePage(getServiceTrackingList(statusType, pageIndex, searchText), success, failure)
    },
    getUserServiceTrackingList(statusType, pageIndex, searchText, success, failure) {
        Common.handlePage(getUserServiceTrackingList(statusType, pageIndex, searchText), success, failure)
    },
    getTodoList(statusType, pageIndex, searchText, success, failure) {
        Common.handlePage(getTodoList(statusType, pageIndex, searchText), success, failure)
    },
    getAssetNum(success, failure) {
        Common.handlePage(getAssetListNum(), success, failure)
    }
}
