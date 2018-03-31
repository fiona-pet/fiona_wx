/**
 * Created by zhongfan on 2017/5/25.
 */
import React from 'react';
import { Toast } from 'react-weui/build/packages';

class Loading extends React.Component {
    render() {
        return (
            <Toast icon="loading" show>加载中...</Toast>
        );
    }
}

export default Loading;