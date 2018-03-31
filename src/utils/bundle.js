/**
 * Created by zhongfan on 2017/5/24.
 */
import React, { Component } from 'react'
import Common from '../models/Common'
import Loading from '../components/common/Loading'

class Bundle extends Component {
    state = {
        // short for "module" but that's a keyword in js, so "mod"
        mod: null
    }

    componentWillMount() {
        this.load(this.props)
    }

    componentDidMount() {
        Common.enableNetWorking()
        console.log("componentDidMount", this.props.name)
    }
    componentWillUnmount() {
        Common.cancelNetWorking()
        console.log("componentWillUnmount", this.props.name)
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.name !== this.props.name) {
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
        return this.state.mod ? this.props.children(this.state.mod) : <Loading/>
    }
}

export default Bundle