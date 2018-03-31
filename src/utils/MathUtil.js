/**
 * 数学计算
 * Created by Jin on 2017/7/10.
 */
export default {

    /**
     * 文件大小格式化
     * @param size 待格式化的值 如：2048
     * @param accuracy 精确位数
     * @returns {*} 格式化后的值 如：2KB
     */
    formatSize(size, accuracy) {
        if (size === undefined) {
            return '未知大小'
        }
        if (size < 1024) {
            return size + 'B'
        } else if (size < (1024 * 1024)) {
            let kiloSize = size / 1024;
            kiloSize = kiloSize.toFixed(accuracy);
            return kiloSize + 'KB'
        } else if (size < (1024 * 1024 * 1024)) {
            let megaSize = size / (1024 * 1024);
            megaSize = megaSize.toFixed(accuracy);
            return megaSize + 'MB'
        } else {
            let giGaSize = size / (1024 * 1024 * 1024);
            giGaSize = giGaSize.toFixed(accuracy);
            return giGaSize + 'GB'
        }
    }

}
