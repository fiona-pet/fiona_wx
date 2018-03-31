/**
 * Created by zhongfan on 2017/8/22.
 */
function Base64ToFormData(base64Data) {
    let blob = dataURItoBlob(base64Data); // 上一步中的函数
    let formData = new FormData();
    formData.append("uploadFile", blob, 'image.jpeg');
    return formData
}
function dataURItoBlob(base64Data) {
    let byteString;
    if (base64Data.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(base64Data.split(',')[1]);
    else
        byteString = unescape(base64Data.split(',')[1]);
    let mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
    let ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type:mimeString});
}

export default Base64ToFormData