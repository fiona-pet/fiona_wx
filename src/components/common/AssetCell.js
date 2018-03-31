/**
 * Created by zhongfan on 2017/5/22.
 */
/**
 * Created by zhongfan on 2017/5/19.
 */
import React from 'react'
import PropTypes from 'prop-types'
import './AssetCell.scss'
import {
    MediaBox,
    Panel,
    PanelHeader,
    PanelBody,
    Cells,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
} from 'react-weui/build/packages';

function AssetCell(props) {
    return <Panel className="AssetCell" onClick={props.onClick}>
        <PanelHeader>
            <Cell className="title">
                <CellBody>
                    {props.title}
                </CellBody>
                <CellFooter>
                    {props.state}
                </CellFooter>
            </Cell>
        </PanelHeader>
        <PanelBody>
            <Cell className="no">
                <CellHeader>
                    资产编号
                </CellHeader>
                <CellBody>
                    {props.assetNum}
                </CellBody>
                <CellFooter>

                </CellFooter>
            </Cell>
            <Cell className="type">
                <CellHeader>
                    资产类型
                </CellHeader>
                <CellBody>
                    {props.type}
                </CellBody>
            </Cell>
        </PanelBody>
    </Panel>
}

AssetCell.propTypes = {
    title: PropTypes.string,
    assetNum: PropTypes.string,
    type: PropTypes.string,
    state: PropTypes.string,
    onClick: PropTypes.func,
};

export default AssetCell