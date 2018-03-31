/**
 * Created by zhongfan on 2017/5/19.
 */
import React from 'react'
import PropTypes from 'prop-types'
import './WorkSheetCell.scss'
import {
    Panel,
    PanelHeader,
    PanelBody,
    Cells,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
} from 'react-weui/build/packages';
import Auth from '../../models/Auth'

const trouble = require("../../../asset/utilization/trouble.svg");
const service = require("../../../asset/utilization/service.svg");

function WorkSheetCell(props) {
    return <Panel className="WorkSheetCell" onClick={props.onClick}>
        <PanelHeader>
            <Cell>
                <CellHeader>
                    <img src={props.type == 'trouble' ? trouble : service}/>
                </CellHeader>
                <CellBody>
                    {props.title}
                </CellBody>
                {Auth.getUserType() == 0 ? '' :
                    <CellFooter>
                        <label style={getLevel(props.priority)}>
                            {props.priority}
                        </label>
                    </CellFooter>

                }
                <div>&nbsp;&nbsp;</div>
                <CellFooter>
                    {props.state}
                </CellFooter>
            </Cell>
        </PanelHeader>
        <PanelBody>
            <Cell>
                <CellHeader>
                    {props.type == 'trouble' ? '故障描述' : '请求描述'}
                </CellHeader>
                <CellBody>
                    {props.describe}
                </CellBody>
                <CellFooter>

                </CellFooter>
            </Cell>
            <Cell>
                <CellHeader>
                    {Auth.getUserType() == 0 ? '处理人' : '申请人'}
                </CellHeader>
                <CellBody>
                    {props.engineer}
                </CellBody>
                <CellFooter>
                    {props.time}
                </CellFooter>
            </Cell>
        </PanelBody>
    </Panel>
}

function getLevel(name) {
    let color = "#fff";
    let textColor = "#fff";

    switch (name) {
        case "高":
            color = "#Fcf0f0";
            textColor = "#e78888";
            break;
        case "中":
            color = "#fdf5eb";
            textColor = "#f3b05c";
            break;
        case "低":
            name = "主要";
            color = "#f7f3eb";
            textColor = "#94b747";
            break;
    }
    let style = {
        background: color, padding: 4, margin: 0, color: textColor,fontSize: 12
    };
    return style;
}

WorkSheetCell.propTypes = {
    title: PropTypes.string,
    type: PropTypes.string,
    state: PropTypes.string,
    describe: PropTypes.string,
    engineer: PropTypes.string,
    time: PropTypes.string,
    onClick: PropTypes.func,
    priority: PropTypes.string,
}

export default WorkSheetCell