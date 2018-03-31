/**
 * 底部按钮组
 * Created by Jin on 2017/6/16.
 */
import React from 'react'
import PropTypes from 'prop-types'
import './BottomButtonGroup.scss'

function BottomButtonGroup(props) {
    switch (props.state) {
        case '1p'://一个主要按钮
            return <div className="action_btn_area">
                <div className="action_btn_positive_fill" onClick={props.positiveClick}>
                    <img className="icon" src={props.positiveIcon}/>
                    {props.positiveText}
                </div>
            </div>;
        case '1n'://一个次要按钮
            return <div className="action_btn_area">
                <div className="action_btn_negative_fill" onClick={props.negativeClick}>
                    <img className="icon" src={props.negativeIcon}/>
                    {props.negativeText}
                </div>
            </div>;
        case '2'://两个按钮
            return <div className="action_btn_area">
                <div className="action_btn_negative" onClick={props.negativeClick}>
                    <img className="icon" src={props.negativeIcon}/>
                    {props.negativeText}
                </div>
                <div className="action_btn_positive" onClick={props.positiveClick}>
                    <img className="icon" src={props.positiveIcon}/>
                    {props.positiveText}
                </div>
            </div>;
    }
}

BottomButtonGroup.propTypes = {
    state: PropTypes.string,
    positiveText: PropTypes.string,
    negativeText: PropTypes.string,
    positiveIcon: PropTypes.string,
    negativeIcon: PropTypes.string,
    positiveClick: PropTypes.func,
    negativeClick: PropTypes.func,
};

export default BottomButtonGroup;
