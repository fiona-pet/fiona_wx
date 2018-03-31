import React from 'react'
import PropTypes from 'prop-types'
import './TimePickerCell.scss'
import {
    Input,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
} from 'react-weui';
import DataUtil from '../../../../utils/DateUtil'

class TimePickerCell extends React.Component {
    constructor(props) {
        super(props)
    }


    componentDidMount() {


    }

    render() {
        const props = this.props;
        if (props.hidden){
            return <div></div>
        }
        return <Cell access>
            <CellHeader>
                <div className="cell_body_head">
                    <span className="isRequire">{props.required ? "*" : " "}</span>
                </div>
                <div className="cell_body_content">
                    {props.title}
                </div>
            </CellHeader>
            <CellBody>
                <Input type="datetime-local"
                       style={{textAlign: "right"}}
                       disabled={props.readonly}
                       key={props.key}
                       defaultValue={(new RegExp("^[0-9]*$")).test(props.defaultValue) ? DataUtil.defaultFormatTime(props.defaultValue) : props.defaultValue}
                       onChange={ e => {
                           props.valueChange((new RegExp("^[0-9]*$")).test(e.target.value) ? e.target.value : DataUtil.timeToStamp(e.target.value), props.id, props.name)
                       }}/>
            </CellBody>
            <CellFooter>
            </CellFooter>
        </Cell>
    }
}


TimePickerCell.propTypes = {
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    name: PropTypes.string,
    key: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    readonly: PropTypes.bool,
    required: PropTypes.bool,
    hidden: PropTypes.bool,
    valueChange: PropTypes.func,
}


export default TimePickerCell
