/**
 * Created by zhongfan on 2017/5/19.
 */
import React from 'react'
import PropTypes from 'prop-types'
import './MessageCell.scss'
import {
    Cell, CellBody, CellFooter
} from 'react-weui/build/packages'

function MessageCell(props) {
    return <div className="MessageCell" onClick={props.onClick}>
        <div className="time">{props.time}</div>
        <div className={props.read ? "content":"content" + ' unread'}>{props.content}</div>
        {props.access ? <Cell access className="accessCell">
                <CellBody>
                    查看详情
                </CellBody>
                <CellFooter>
                </CellFooter>
            </Cell>:''}
    </div>
}

MessageCell.propTypes = {
    time: PropTypes.string,
    content: PropTypes.string,
    read: PropTypes.bool,
    access: PropTypes.bool,
    onClick: PropTypes.func,
}

export default MessageCell