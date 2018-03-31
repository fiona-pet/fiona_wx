/**
 * Created by zhongfan on 2017/7/5.
 */

export default {
    needCancel:false,

    enableNetWorking() {
        this.needCancel = false
    },
    cancelNetWorking() {
        this.needCancel = true
    },
    handlePage(promise, success, failure = ()=>{}) {
        promise.then(res => {
            if (this.needCancel) {
                failure();
                return
            }
            let obj = JSON.parse(res);
            if (obj.result != undefined) {
                let pageIndex = obj.result.pageIndex;
                let totalPage = obj.result.totalPage;
                if (pageIndex && totalPage) {
                    pageIndex = pageIndex <= totalPage ? pageIndex + 1 : pageIndex;
                    success(obj.result, pageIndex, totalPage)
                } else {
                    success(obj.result, 1)
                }
            } else {
                failure()
            }
        }, err => {
            failure()
        });
    }
}