import $ from 'n-zepto';
/**
 * 全局 RPC请求类 按照relax请求风格实现zeptojs 的rpc请求。
 */
export function rpcRequest(method, params) {
    let data = {jsonrpc: "2.0", method: method, id: 1, params: params};
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            dataType: 'JSON',
            contentType :'application/json',
            url: 'rpc?t=' + new Date().getTime(),
            data: JSON.stringify(data),
            success: function (data) {
                resolve(data);
            },
            error: function (xhr, type) {
                reject(xhr);
            }
        })
    });
}
export function fileRequest(method, params) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            processData: false, // 必需为false 不会将 data 参数序列化字符串
            contentType: false, // 必需为false
            url: 'rpc'+ method,
            data: params,
            success: function (data) {
                resolve(data);
            },
            error: function (xhr, type) {
                reject(xhr);
            }
        })
    });
}
export function restRequest(type, url, data) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: type,
            dataType: 'JSON',
            contentType :'application/json',
            url: url,
            data: JSON.stringify(data),
            success: function (data) {
                resolve(data);
            },
            error: function (xhr, type) {
                console.log("request error");
                reject(xhr);
            }
        })
    });
}

export default {rpcRequest, restRequest}