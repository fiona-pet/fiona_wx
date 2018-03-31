import React from 'react'
import PropTypes from 'prop-types'
import './PopupCell.scss'
import {
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
} from 'react-weui';

class PopupCell extends React.Component {
    constructor(props) {
        super(props)
    }


    componentDidMount() {


    }

    componentWillReceiveProps(nextProps) {
        if (this.props.defaultValue != nextProps.defaultValue) {


        }
    }

    render() {
        const props = this.props;
        if (props.hidden) {
            return <div></div>
        }
        return <Cell onClick={e => props.readonly ? '' : props.onClick()} access={!props.readonly}>
            <CellHeader>
                <div className="cell_body_head">
                    <span className="isRequire">{props.required ? "*" : " "}</span>
                </div>
                <div className="cell_body_content">
                    {props.title}
                </div>
            </CellHeader>
            <CellBody>
                {props.defaultValue}
            </CellBody>
            <CellFooter>
            </CellFooter>
        </Cell>
    }
}


PopupCell.propTypes = {
    defaultValue: PropTypes.string,
    name: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    readonly: PropTypes.bool,
    required: PropTypes.bool,
    onClick: PropTypes.func,
    hidden: PropTypes.bool,
};


export default PopupCell
