import React from 'react'
import PropTypes from 'prop-types'
import './SwitchCell.scss'
import {
    Switch,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
} from 'react-weui';

class SwitchCell extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            checked: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.defaultValue !== nextProps.defaultValue) {
            // this.setState({uuid:RandomString(32)})
            this.setState({checked: nextProps.defaultValue})
        }
    }

    componentDidMount() {
        let bool = this.props.defaultValue;
        if (bool !== undefined) {
            this.setState({checked: bool})
        }
    }


    render() {
        const props = this.props;
        if (props.hidden){
            return <div></div>
        }
        return <Cell>
            <CellHeader>
                {props.title}
            </CellHeader>
            <CellBody>
            </CellBody>
            <CellFooter>
                <Switch checked={this.state.checked} onChange={e => {
                    this.setState({checked: !this.state.checked}, () => {
                        props.valueChange(this.state.checked, props.id, props.name)
                    });
                }}/>
            </CellFooter>
        </Cell>
    }
}


SwitchCell.propTypes = {
    defaultValue: PropTypes.bool,
    name: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    readonly: PropTypes.bool,
    required: PropTypes.bool,
    hidden: PropTypes.bool,
    valueChange: PropTypes.func,
}


export default SwitchCell
