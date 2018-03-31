/**
 * Created by zhongfan on 2017/8/31.
 */
function randomString(L){
    let s= '';
    let randomChar=function(){
        let n= Math.floor(Math.random()*62);
        if(n<10) return n; //1-10
        if(n<36) return String.fromCharCode(n+55); //A-Z
        return String.fromCharCode(n+61); //a-z
    };
    while(s.length< L) s+= randomChar();
    return s;
}

export default randomString