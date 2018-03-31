/**
 * sql 工具
 */
import CryPtoJS from 'crypto-js'

export default {

    /**
     * sql 字符串加密
     * @param key
     * @param sqlStr
     * @returns {string}
     */
    encode(key, sqlStr) {
        let keyHex = CryPtoJS.enc.Utf8.parse(key);
        let encrypted = CryPtoJS.DES.encrypt(sqlStr, keyHex, {
            mode: CryPtoJS.mode.ECB,
            padding: CryPtoJS.pad.Pkcs7
        });
        return encrypted.toString();
    },

    /**
     * sql 字符串解密
     * @param key
     * @param sqlStr
     * @returns {string}
     */
    decode(key, sqlStr) {
        let keyHex = CryPtoJS.enc.Utf8.parse(key);
        let decrypted = CryPtoJS.DES.decrypt({
            ciphertext: CryPtoJS.enc.Base64.parse(sqlStr)
        }, keyHex, {
            mode: CryPtoJS.mode.ECB,
            padding: CryPtoJS.pad.Pkcs7
        });
        return decrypted.toString(CryPtoJS.enc.Utf8);
    }

}
