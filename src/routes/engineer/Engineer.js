/**
 * Created by zhongfan on 2017/5/18.
 */
import React from 'react'
import {
    Route,
    Switch,
    Link,
    Redirect
} from 'react-router-dom'
import './Engineer.scss'
import {
    Badge,
    Tab,
    TabBody,
    TabBar,
    TabBarItem,
    TabBarIcon,
    TabBarLabel,
    Article
} from 'react-weui'
import Model from '../../models/Engineer'
import Bundle from '../../utils/bundle'
import Loading from '../../components/common/Loading'

import AppConfig from '../../utils/AppConfig'
const {route} = AppConfig;
const {message, utilization, profile} = route;
const tab1 = message, tab2 = utilization, tab3 = profile;

const tab1Normal = require('../../../asset/engineer/msg_0.svg');
const tab1Highlight = require('../../../asset/engineer/msg_1.svg');
const tab2Normal = require('../../../asset/engineer/application_0.svg');
const tab2Highlight = require('../../../asset/engineer/application_1.svg');
const tab3Normal = require('../../../asset/engineer/profile_0.svg');
const tab3Highlight = require('../../../asset/engineer/profile_1.svg');

const loadComponent = (component, name) => (props) => {
    return <Bundle load={component} name={name}>
        {
            (Component) => {
                if (Component) {
                    if (name) document.title = name;
                    return <Component {...props}/>
                }else {
                    return <Loading/>
                }
            }
        }
    </Bundle>
};

class Engineer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            messageNumber: 0,
            index: 1
        }
    }

    componentDidMount() {
        this.getMessageNumber()
    }
    getMessageNumber() {
        Model.getMessageNumber((messageNumber) => {
            console.log(messageNumber)
            this.setState({messageNumber: messageNumber});
        })
    }

    goMessage() {
        if (this.props.location.pathname !== '/engineer/message') {
            this.props.history.replace('/engineer/message');
            this.getMessageNumber()
        }
    }

    goUtilization() {
        if (this.props.location.pathname !== '/engineer/utilization') {
            this.props.history.replace('/engineer/utilization');
        }
    }

    goProfile() {
        if (this.props.location.pathname !== '/engineer/profile') {
            this.props.history.replace('/engineer/profile');
        }
    }

    render() {
        const pathname = this.props.location.pathname;
        return (
            <div className="Engineer">
                <Route exact path="/engineer" render={() => (
                    <Redirect to={tab2.path}/>
                )}/>
                <Switch>
                    <Route exact path={tab1.path} component={loadComponent(tab1.component, tab1.name, this.props.showMessage)}/>
                    <Route exact path={tab2.path} component={loadComponent(tab2.component, tab2.name, this.props.showMessage)}/>
                    <Route exact path={tab3.path} component={loadComponent(tab3.component, tab3.name, this.props.showMessage)}/>
                </Switch>
                <TabBar>
                    <TabBarItem active={pathname == tab1.path} onClick={this.goMessage.bind(this)}>
                        <TabBarIcon>
                            <img src={pathname == tab1.path ? tab1Highlight : tab1Normal}/>
                            {this.state.messageNumber == 0 ? null :
                                <Badge>{this.state.messageNumber > 99 ? '99+' : this.state.messageNumber}</Badge>}
                        </TabBarIcon>
                        <TabBarLabel><a>{tab1.name}</a></TabBarLabel>
                    </TabBarItem>
                    <TabBarItem active={pathname == tab2.path} onClick={this.goUtilization.bind(this)}>
                        <TabBarIcon>
                            <img src={pathname == tab2.path ? tab2Highlight : tab2Normal}/>}/>
                        </TabBarIcon>
                        <TabBarLabel><a>{tab2.name}</a></TabBarLabel>
                    </TabBarItem>
                    <TabBarItem active={pathname == tab3.path} onClick={this.goProfile.bind(this)}>
                        <TabBarIcon>
                            <img src={pathname == tab3.path ? tab3Highlight : tab3Normal}/>}/>
                        </TabBarIcon>
                        <TabBarLabel><a>{tab3.name}</a></TabBarLabel>
                    </TabBarItem>
                </TabBar>
            </div>
        );
    }
}
export default Engineer
