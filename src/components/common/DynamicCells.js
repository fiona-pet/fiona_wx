/**
 * Created by zhongfan on 2017/12/1.
 */
import React from 'react'
import PropTypes from 'prop-types'
import './DynamicCells.scss'
import {
    Cells,
} from 'react-weui';
import WorkSheetModel from '../../models/WorkSheet'
import DatePickerCell from './cells/DatePickerCell/DatePickerCell'
import LabelCell from './cells/LabelCell/LabelCell'
import PopupCell from './cells/PopupCell/PopupCell'
import RichTextCell from './cells/RichTextCell/RichTextCell'
import StarCell from './cells/StarCell/StarCell'
import SwitchCell from './cells/SwitchCell/SwitchCell'
import TextAreaCell from './cells/TextAreaCell/TextAreaCell'
import TextCell from './cells/TextCell/TextCell'
import TimePickerCell from './cells/TimePickerCell/TimePickerCell'
import RegisterCell from "./cells/RegisterCell/RegisterCell";

class DynamicCells extends React.Component {
    constructor(props) {
        super(props);

        this.allData = [];
        this.pageIndex = 1;
        this.state = {
            components:[],
            lookup_popUp: false,
            multi_lookup_popUp: false,
            lookUpDataSource: [],
            interactionDataSource: [],
            interaction_Popup: false,
        }
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.components != nextProps.components) {
            // this.setState({uuid:RandomString(32)})

        }
        this.setState({components:nextProps.components})
    }
    valueChange(value, id, name) {
        WorkSheetModel.setComponentsValue(this.state.components, {"name": name, "value":value}, id);
        WorkSheetModel.changeComponentsRule(this.state.components, this.props.rules, this.props.ciTypes, name, this.props.orderId, (components) => {
            this.setState({components:components})
        });
    }
    cellClick(item) {
        this.allData = [];
        this.pageIndex = 1;
        WorkSheetModel.loadLookUpData([], item, "", this.pageIndex, (allData, resIndex) => {
            this.allData = allData;
            this.pageIndex = resIndex;
            if (item.editor == 'userselector' || item.editor == 'roleselector') {
                this.props.cellClick({multi_lookup_popUp: true, lookUpDataSource: allData, selectedItem:item})
            } else {
                this.props.cellClick({lookup_popUp: true, lookUpDataSource: allData, selectedItem:item})
            }
        })
    }


    switchCell(item, index) {
        const props = {
            key:index,
            title:item.label,
            name:item.name,
            readonly:item.readonly,
            required:item.required,
            hidden:item.hidden,
            id:item.id,
            placeholder:item.help ? item.help : item.placeholder,
            defaultValue:item.defaultValue,
            valueChange:value => {this.valueChange(value, props.id, props.name)},
            onClick:this.cellClick.bind(this, item)
        };
        switch (item.editor) {
            case "text": case "citype": case "integer": case "password": case "double":  case "phonecode":
            return <TextCell {...props}/>;
            break;
            case "boolean":
                return <SwitchCell {...props}/>;
                break;
            case "richtext":
                return <RichTextCell {...props}/>;
                break;
            case "webip":
                return <LabelCell {...props}/>;
                break;
            case "textarea":
                return <TextAreaCell {...props}/>;
                break;
            case "datetimepicker":
                return <TimePickerCell {...props}/>;
                break;
            case "datepicker":
                return <DatePickerCell {...props}/>;
                break;
            case "lookup": case "reference": case "userselector": case "roleselector": case "applyuser": case "radiogroup": case "checkbox":
            return <PopupCell {...props}/>;
            break;
            case "feedback":
                return <StarCell {...props}/>;
                break;
            case "registerpassword":
                return <RegisterCell {...props} valueChange={(value, id, name) => {this.valueChange(value, id, name)}}
                    />;
                break;
            default :
                return '';
                break
        }
    }

    render() {
        return <div className="DynamicCells">
            <Cells>
                {this.state.components.map((arr, session) => {
                    return arr.map((item, row) => {
                        if (item.name == 'source' || (item.editor == 'twocolumn' || item.editor.indexOf("column") > 0)) {
                            item.hidden = true;//过滤表格和来源显示
                        }
                        return this.switchCell(item, session * arr.length + row)
                    })
                })}
            </Cells>
        </div>
    }
}

DynamicCells.propTypes = {
    orderId: PropTypes.string,
    components: PropTypes.array,
    rules: PropTypes.array,
    ciTypes: PropTypes.array,
    valueChange: PropTypes.func,
    cellClick: PropTypes.func,
};

export default DynamicCells
