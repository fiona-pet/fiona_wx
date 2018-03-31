/**
 * Created by zhongfan on 2017/7/4.
 */
import {
    getMessageNum,
    getAssetMessages,
    getServicesMessages,
    getMonthlyMessages,
    getAssetsMessageNum,
    getServicesMessageNum,
} from '../services/message'
import Common from './Common'

export default {
    /*****************消息数量*******************/
    getMessageNumber(success, failure = () => {}) {
        Common.handlePage(getMessageNum(), messageNum => {
            success(messageNum)
        }, error => {
            failure()
        })
    },
    /*****************服务消息数量*******************/
    getServicesMessageNum(success, failure) {
        Common.handlePage(getServicesMessageNum(), success, failure)
    },
    getAssetsMessageNum(success, failure) {
        Common.handlePage(getAssetsMessageNum(), success, failure)
    },
    /*****************消息列表*******************/
    getAssetMessages(pageIndex, isAll, success, failure) {
        Common.handlePage(getAssetMessages(pageIndex, isAll), success, failure)
    },
    getServiceMessages(pageIndex, isAll, success, failure) {
        Common.handlePage(getServicesMessages(pageIndex, isAll), success, failure)
    },
    getMonthlyMessages(pageIndex, isAll, success, failure) {
        Common.handlePage(getMonthlyMessages(pageIndex, isAll), success, failure)
    },
}
