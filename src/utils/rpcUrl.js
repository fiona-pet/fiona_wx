/**
 * Created by zhongfan on 2017/4/24.
 */
let baseURL = '/relax/';
if (process.env.NODE_ENV === 'production') {
  let { pathname } = window.document.location;
  if (pathname.indexOf('/wx') === 0) {
    baseURL = '/';
  } else {
    baseURL = pathname.substring(0, pathname.substr(1).indexOf('/') + 2);
  }
}

export default {
  baseURL,
  rpc: baseURL + 'rpc',
};
