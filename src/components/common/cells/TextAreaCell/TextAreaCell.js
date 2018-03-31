import React from 'react'
import PropTypes from 'prop-types'
import './TextAreaCell.scss'
import {
    TextArea,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
} from 'react-weui';

class TextAreaCell extends React.Component {
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
        return <Cell className="TextAreaCell">
            <CellHeader>
                <div className="cell_body_head">
                    <span className="isRequire">{props.required ? "*" : " "}</span>
                </div>
                <div className="cell_body_content">
                    {props.title}
                </div>
            </CellHeader>
            <CellBody>
                {props.readonly ? props.defaultValue :
                    <TextArea
                        placeholder={props.placeholder ? props.placeholder : "在此填写"}
                        key={props.title}
                        defaultValue={props.defaultValue}
                        onChange={(e) => {
                            let text = e.target.value;
                            props.valueChange(text, props.id, props.name)
                        }}
                    />
                }
            </CellBody>
            <CellFooter>
            </CellFooter>
        </Cell>
    }
}


TextAreaCell.propTypes = {
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    name: PropTypes.string,
    id: PropTypes.string,
    title: PropTypes.string,
    readonly: PropTypes.bool,
    required: PropTypes.bool,
    hidden: PropTypes.bool,
    valueChange: PropTypes.func,
}


export default TextAreaCell
