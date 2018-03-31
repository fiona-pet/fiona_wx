/**
 * Json 工具
 * Created by Jin on 2017/7/4.
 */
export default {

    /**
     * 获取 Json 对象某一节点的内容（只针对单层级的情况）
     * 如果对象未定义，则返回空字符串，防止报空
     * @param obj Json对象
     * @param nameKey 节点
     * @returns {*} 字段内容
     */
    getSimpleChild(obj, nameKey) {
        if (typeof obj !== 'object') {
            return ''
        }
        for (let key in obj) {
            if (key === nameKey) {
                return obj[key]
            }
        }
    },

    /**
     * 获取 Json 对象某一节点下的内容（不含节点本身）
     * @param obj Json对象
     * @param nameKey 节点
     * @returns {*} Json对象
     */
    getChild(obj, nameKey){
        if (typeof obj !== 'object') {
            return
        }
        let result = {};
        for (let key in obj) {
            let value = obj[key];
            if (key === nameKey) {
                return value;
            } else {
                if (typeof value === 'object') {
                    result = this.getChild(value, nameKey);
                }
            }
        }
        return result;
    },

    getChildForMR(obj, nameKey){
        if (typeof obj !== 'object') {
            return
        }
        let result = {};
        for (let key in obj) {
            let value = obj[key];
            if (key === nameKey) {
                return value;
            } else {
                if (typeof value === 'object') {
                    result = this.getChild(value, nameKey);
                }
            }
        }
        return result.length ? result : '(空数据)';
    },

    /**
     * 获取 Json 对象所有字段名为 nameKey 的内容（慎用）
     * @param obj Json对象
     * @param nameKey 节点
     * @returns {Array} 包含全部内容的数组
     */
    getChildren(obj, nameKey) {
        let result = [];
        this.traverseChildren(result, obj, nameKey);
        return result;
    },

    traverseChildren(result, obj, nameKey) {
        if (typeof obj !== 'object') {
            return
        }
        for (let key in obj) {
            let value = obj[key];
            if (key === nameKey) {
                if (value.length) {
                    result.push(value)
                }
            } else {
                if (typeof value === 'object') {
                    this.traverseChildren(result, value, nameKey)
                }
            }
        }
    }


}
