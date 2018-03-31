/**
 * Created by Jin on 2017/5/23.
 */
import cookie from 'react-cookie';

const KEY_USER = 'user';
const KEY_ID = 'id';

export default {

    saveUser(obj) {
        cookie.save(KEY_USER, obj, {path: '/'});
    },

    saveId(id) {
        cookie.save(KEY_ID, id, {path: '/'});
    },

    getUser() {
        let user = cookie.load(KEY_USER);
        return user ? user : '';
    },

    getId() {
        let id = cookie.load(KEY_ID);
        return id ? id : '';
    },

    removeUser() {
        cookie.remove(KEY_USER, {path: '/'});
    },

    removeId() {
        cookie.remove(KEY_ID, {path: '/'});
    },

}
