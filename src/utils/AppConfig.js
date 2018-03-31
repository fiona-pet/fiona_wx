import React from 'react'

import Message from '../routes/message/Message'
import Utilization from '../routes/utilization/Utilization'
import Profile from '../routes/profile/Profile'

const API_V1 = 'adapter'

export default {
    name: 'wx_relax_v1.1',
    version: "1.1.0",
    description: "wx_relax_v1.1",
    footerText: 'RELAX V1.1.0 版权所有 © 2017 由 移动端 支持',
    api: {

    },
    route: {
        message: {path: "/engineer/message", component: Message, name:'消息'},
        utilization: {path: "/engineer/utilization", component: Utilization, name:'应用'},
        profile: {path: "/engineer/profile", component: Profile, name:'我'},
    }
}
