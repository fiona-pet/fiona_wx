/**
 * Created by zhongfan on 2017/7/5.
 */
import React from 'react';
import PropTypes from 'prop-types'
import {
    Cells,
    CellsTitle,
    Cell,
    CellHeader,
    CellBody,
    CellFooter
} from 'react-weui/build/packages';
import timeLine_enable from '../../../asset/common/timeLine_enable.png'
import timeLine_normal from '../../../asset/common/timeLine_normal.png'

class ActivityRecordCell extends React.Component {

    render() {
        return <Cells>
            <Cell style={{padding:'0px',height:'82px'}}>
                <CellHeader style={{width: '60px'}}>
                    <img src={this.props.enable ? timeLine_enable:timeLine_normal}
                         style={{width: '60px',verticalAlign:'middle',paddingTop:'27px'}}/>
                </CellHeader>
                <CellBody style={{paddingLeft:'0px'}}>
                    {this.props.index == 0 ? <CellBody style={{margin: '8px 0', color:'rgba(0,0,0,0.84)',paddingLeft:'0px'}}>
                        {this.props.content}
                        </CellBody>
                    :
                        <CellBody style={{margin: '8px 0', color:'rgba(0,0,0,0.28)',paddingLeft:'0px'}}>
                            {this.props.content}
                        </CellBody>}

                    <CellBody style={{color:'rgba(0,0,0,0.28)' ,paddingLeft:'0px'}}>
                        {this.props.time}
                    </CellBody>
                </CellBody>
            </Cell>
        </Cells>
    }
}

ActivityRecordCell.propTypes = {
    enable:PropTypes.bool,
    content: PropTypes.string,
    time: PropTypes.string,
    index: PropTypes.string,
};

export default ActivityRecordCell;