import React from 'react'
import PropTypes from 'prop-types'
import './RegisterCell.scss'
import {
    Input,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
} from 'react-weui';

class RegisterCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }


    componentDidMount() {


    }


    render() {
        const props = this.props;
        if (props.hidden){
            return <div></div>
        }
        return <div>
            <Cell className="TextCell">
                <CellHeader>
                    <div className="cell_body_head">
                        <span className="isRequire">{props.required ? "*":" "}</span>
                    </div>
                    <div  className="cell_body_content">
                        {props.title}
                    </div>
                </CellHeader>
                <CellBody>
                    {props.readonly ? props.defaultValue :
                        <Input placeholder={props.placeholder ? props.placeholder : "在此填写"}
                               type="text"
                               key={props.title}
                               defaultValue={props.defaultValue}
                               onChange={(e) => {
                                   props.valueChange(e.target.value, props.id, props.name + 'first')
                               }
                               }>
                        </Input>
                    }
                </CellBody>
                <CellFooter>
                </CellFooter>
            </Cell>
            <Cell className="TextCell">
                <CellHeader>
                    <div className="cell_body_head">
                        <span className="isRequire">{props.required ? "*":" "}</span>
                    </div>
                    <div  className="cell_body_content">
                        确认验证密码
                    </div>
                </CellHeader>
                <CellBody>
                    {props.readonly ? props.defaultValue :
                        <Input placeholder={props.placeholder ? props.placeholder : "在此填写"}
                               type="text"
                               key={props.title}
                               defaultValue={props.defaultValue}
                               onChange={(e) => {
                                   props.valueChange(e.target.value, props.id, props.name + 'second')
                               }
                               }>
                        </Input>
                    }
                </CellBody>
                <CellFooter>
                </CellFooter>
            </Cell>
        </div>
    }
}


RegisterCell.propTypes = {
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


export default RegisterCell
