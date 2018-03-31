import React from 'react'
import PropTypes from 'prop-types'
import './DatePickerCell.scss'
import {
    Input,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
} from 'react-weui';
import DataUtil from '../../../../utils/DateUtil'


class DatePickerCell extends React.Component {
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
                {props.readonly ? (new RegExp("^[0-9]*$")).test(props.defaultValue) ? DataUtil.defaultFormatAssertDate(props.defaultValue) : props.defaultValue :
                    <Input type={"date"}
                           style={{textAlign: "right"}}
                           key={props.title}
                           defaultValue={(new RegExp("^[0-9]*$")).test(props.defaultValue) ? DataUtil.defaultFormatAssertDate(props.defaultValue) : props.defaultValue}
                           onChange={ e => {
                               props.valueChange(e.target.value, props.id, props.name)
                           }}/>
                }
            </CellBody>
            <CellFooter>
            </CellFooter>
        </Cell>
    }
}


DatePickerCell.propTypes = {
    defaultValue: PropTypes.string,
    name: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    readonly: PropTypes.bool,
    required: PropTypes.bool,
    hidden: PropTypes.bool,
};


export default DatePickerCell
