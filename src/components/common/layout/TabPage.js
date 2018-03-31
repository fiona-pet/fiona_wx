/**
 * Created by zhongfan on 2017/12/7.
 */
import React from 'react';
import PropTypes from 'prop-types';
import './TabPage.scss'

export default class TabPage extends React.Component {
    static propTypes = {
        hiddenTabBar:PropTypes.bool
    };
    static defaultProps = {
        hiddenTabBar: true,
    };

    render() {
        const { className, children, hiddenTabBar } = this.props;
        const style = {
            bottom: hiddenTabBar ? '0':'50px',
        };
        return (
            <div className={`TabPage ${className}`} style={style}>
                {children}
            </div>
        );
    }
};