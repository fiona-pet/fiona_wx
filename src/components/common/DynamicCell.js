/**
 * Created by zhongfan on 2017/6/12.
 */
import React from 'react'
import PropTypes from 'prop-types'
import './DynamicCell.scss'
import {
    Select,
    Input,
    TextArea,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
    CellsTitle,
    Cells,
    Article,
    Switch,
    Button
} from 'react-weui/build/packages';
import FiveStars from './FiveStars'
import MultiButton from './MultiButton'
import DataUtil from '../../utils/DateUtil'

import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
const Delta = Quill.import('delta');

class DynamicCell extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            checkbox_popUp:false,
            lookup_popUp:false,
            checked:false,
            isEmpty:true
        }
    }

    switchCell(props) {
        switch (props.type) {
            case "text": case "citype": case "integer": case "password": case "registerpassword": case "double": case "phonecode":
            return <Cell>
                    <CellHeader>
                        <div className="cell_body_head">
                            <span className="isRequire">{props.required ? "*":" "}</span>    
                        </div>
                        <div  className="cell_body_content">
                            {props.title}
                        </div>
                    </CellHeader>
                    <CellBody className="single_text">
                        {props.readonly ? props.defaultValue :
                            <Input placeholder={props.placeholder ? props.placeholder : "在此填写"}
                                   type="text"
                                   key={props.title}
                                   defaultValue={props.defaultValue}
                                   onChange={(e) => {
                                       props.valueChange(e.target.value, props.id, props.name)
                                   }
                                   }>
                            </Input>
                        }
                    </CellBody>
                    <CellFooter>
                    </CellFooter>
                </Cell>;
                break;
            case "boolean":
                return <Cell>
                    <CellHeader>
                        {props.title}
                    </CellHeader>
                    <CellBody>
                    </CellBody>
                    <CellFooter>
                        <Switch checked={this.state.checked} onChange={e => {
                            this.setState({checked: !this.state.checked});
                            props.valueChange(this.state.checked, props.id, props.name)
                        }}/>
                    </CellFooter>
                </Cell>;
                break;
            case "richtext":
                return <div>
                    <Cell>{props.title}</Cell>
                    <ReactQuill
                        className={props.readonly ? 'noToolBar' : ''}
                        style={{padding: '8px 12px'}}
                        readOnly={props.readonly}
                        defaultValue={new Delta(JSON.parse(props.defaultValue ? props.defaultValue : '{}'))}
                        onChange={(value, delta, source, editor) => {
                            if (value.length > 0) {
                                this.setState({isEmpty: false})
                            } else {
                                this.setState({isEmpty: true})
                            }
                            props.valueChange(JSON.stringify(editor.getContents()), props.id, props.name)
                        }}
                    >
                        <div className="custom-editing-area"
                             onClick={props.readonly ? props.onClick():''}/>
                    </ReactQuill>
                </div>
                break;
            case "webip":
                return <Cell>
                        <CellHeader>
                            <div className="cell_body_head">
                                <span className="isRequire">{props.required ? "*":" "}</span>    
                            </div>
                            <div  className="cell_body_content">
                                {props.title}
                            </div>
                        </CellHeader>
                        <CellBody>
                            {props.defaultValue}
                        </CellBody>
                        <CellFooter>
                        </CellFooter>
                    </Cell>;
                    break;

            case "textarea":
                return <Cell>
                    <CellHeader>
                        <div className="cell_body_head">
                            <span className="isRequire">{props.required ? "*":" "}</span>    
                        </div>
                        <div  className="cell_body_content">
                            {props.title}
                        </div>
                    </CellHeader>
                    <CellBody>
                        {props.readonly ? props.defaultValue:
                            <TextArea
                                placeholder={props.placeholder ? props.placeholder : "在此填写"}
                                key={props.title}
                                defaultValue={props.defaultValue}
                                onChange={(e) => {
                                    let text = e.target.value;
                                    if (text.length > 0) {
                                        this.setState({isEmpty: false})
                                    } else {
                                        this.setState({isEmpty: true})
                                    }
                                    props.valueChange(text, props.id, props.name)
                                }}>
                        </TextArea>}
                    </CellBody>
                    <CellFooter>
                    </CellFooter>
                </Cell>;
                break;
            case "radio": 
                return <Cell access>
                    <CellHeader>
                        <div className="cell_body_head">
                            <span className="isRequire">{props.required ? "*":" "}</span>    
                        </div>
                        <div  className="cell_body_content">
                            {props.title}
                        </div>
                    </CellHeader>
                    <CellBody>
                        <Select placeholder="下拉菜单" onChange={(e)=> {
                            props.valueChange(e.target.value, props.id, props.name)
                        }}>
                            {props.dataSource.map((option,index) =>
                                <option value={option.value} key={index} >{option.name}</option>
                            )}
                        </Select>
                    </CellBody>
                    <CellFooter>
                    </CellFooter>
                </Cell>;
                break;
            case "select":
                return <Cell>
                    <CellHeader>
                        <div className="cell_body_head">
                            <span className="isRequire">{props.required ? "*":" "}</span>    
                        </div>
                        <div  className="cell_body_content">
                            {props.title}
                        </div>
                    </CellHeader>
                    <CellBody>
                        <Select placeholder="下拉菜单" onChange={(e)=> {
                            props.valueChange(e.target.value, props.id, props.name)
                        }}>
                            {props.dataSource.map((option,index) =>
                                <option value={option.value} key={index} >{option.name}</option>
                            )}
                        </Select>
                    </CellBody>
                    <CellFooter>
                    </CellFooter>
                </Cell>;
                break;
            case "checkbox___":
                let titles = []
                if (props.dataSource instanceof Array) {
                    props.dataSource.map(item => {
                        titles.push(item.display_name)
                    });
                }
                console.log(titles, props.dataSource)
                let defaultValue = []
                if (props.defaultValue) {
                    defaultValue = props.defaultValue.split(",")
                }

                return <Cell onClick={e => this.setState({checkbox_popUp:true})}>
                    <CellHeader>
                        <div className="cell_body_head">
                            <span className="isRequire">{props.required ? "*":" "}</span>    
                        </div>
                        <div  className="cell_body_content">
                            {props.title}
                        </div>
                    </CellHeader>
                    <CellBody>
                        <MultiButton titles={titles} defaultValue={defaultValue} valueChange={ titles =>
                            props.valueChange(titles, props.id, props.name)
                        }/>
                    </CellBody>
                    <CellFooter>
                    </CellFooter>
                </Cell>;
                break;
            case "datetimepicker":
                return <Cell access>
                    <CellHeader>
                        <div className="cell_body_head">
                            <span className="isRequire">{props.required ? "*":" "}</span>
                        </div>
                        <div  className="cell_body_content">
                            {props.title}
                        </div>
                    </CellHeader>
                    <CellBody>
                        <Input type={"datetime-local"}
                               style={{textAlign:"right"}}
                               disabled={props.readonly}
                               key={props.title}
                               defaultValue={(new RegExp("^[0-9]*$")).test(props.defaultValue) ? DataUtil.defaultFormatTime(props.defaultValue) : props.defaultValue}
                               onChange={ e => {
                                   props.valueChange(e.target.value, props.id, props.name)
                               }}/>
                    </CellBody>
                    <CellFooter>

                    </CellFooter>
                </Cell>;
                break;
            case "datepicker":
                return <Cell access>
                    <CellHeader>
                        <div className="cell_body_head">
                            <span className="isRequire">{props.required ? "*":" "}</span>    
                        </div>
                        <div  className="cell_body_content">
                            {props.title}
                        </div>
                    </CellHeader>
                    <CellBody>
                        {props.readonly ? ((new RegExp("^[0-9]*$")).test(props.defaultValue) ? DataUtil.defaultFormatAssertDate(props.defaultValue) : props.defaultValue) :
                        <Input type={"date"}
                           style={{textAlign:"right"}}
                           key={props.title}
                           defaultValue={(new RegExp("^[0-9]*$")).test(props.defaultValue) ? DataUtil.defaultFormatAssertDate(props.defaultValue) : props.defaultValue}
                           onChange={ e => {
                               props.valueChange(e.target.value, props.id, props.name)
                           }}/>
                        }
                    </CellBody>
                    <CellFooter>
                        
                    </CellFooter>
                </Cell>;
                break;
            case "lookup": case "reference": case "userselector": case "roleselector": case "applyuser": case "radiogroup": case "checkbox":
                return <Cell onClick={e => props.readonly ? '':props.onClick()}  access={!props.readonly}>
                    <CellHeader>
                        <div className="cell_body_head">
                            <span className="isRequire">{props.required ? "*":" "}</span>    
                        </div>
                        <div  className="cell_body_content">
                            {props.title}
                        </div>
                    </CellHeader>
                    <CellBody>
                        {props.defaultValue}    
                    </CellBody>
                    <CellFooter>
                    </CellFooter>
                </Cell>;
                break;
            case "feedback":
                return <Cell>
                    <CellHeader>
                        <div className="cell_body_head">
                            <span className="isRequire">{props.required ? "*":" "}</span>    
                        </div>
                        <div  className="cell_body_content">
                            {props.title}
                        </div>
                    </CellHeader>
                    <CellBody>
                        <FiveStars
                            clickable={!props.readonly}
                            selectedIndex={parseInt(props.defaultValue)}
                            valueChange={index => {
                                props.valueChange(index, props.id, props.name);
                            }}
                        />
                    </CellBody>
                    <CellFooter>
                    </CellFooter>
                </Cell>;
                break;
            default :
                return <div></div>;
                break
        }
    }
    render() {
        let props = this.props;
        if (props.hidden){
            return <div></div>;
        }else{
            return <div className="DynamicCell">
                {this.switchCell(props)}
            </div>
        }
    }
}

DynamicCell.propTypes = {
    type: PropTypes.string,
    name: PropTypes.string,
    title: PropTypes.string,
    defaultValue: PropTypes.string,
    readonly:PropTypes.bool,
    required:PropTypes.bool,
    hidden:PropTypes.bool,
    valueChange: PropTypes.func,
    onClick: PropTypes.func,
    dataSource: PropTypes.array,
    placeholder: PropTypes.string
};

export default DynamicCell