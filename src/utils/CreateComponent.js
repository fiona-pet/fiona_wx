/**
 * Created by zhongfan on 2017/7/10.
 */
import React, { Component } from 'react'

class CreateComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // short for "module" but that's a keyword in js, so "mod"
            mod: null
        }
    }

    componentWillMount() {
        this.load(this.props)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.load !== this.props.load) {
            this.load(nextProps)
        }
    }

    load(props) {
        this.setState({
            mod: null
        })
        props.load((mod) => {
            this.setState({
                // handle both es imports and cjs
                mod: mod.default ? mod.default : mod
            })
        })
    }

    render() {
        return <Bundle load={this.props.component}>
            {
                (Component) => Component ?
                    (isLogin(props) ?
                        (<Component {...props} showMessage={message => handleMessage(message)}/>) :
                        (<Redirect to={{
                            pathname: '/login',
                        }}/>)) :
                    <Loading/>
            }
        </Bundle>
    }
}

export default CreateComponent