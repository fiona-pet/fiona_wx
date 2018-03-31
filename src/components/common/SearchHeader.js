/**
 * Created by zhongfan on 2017/5/19.
 */
import React from 'react'
import PropTypes from 'prop-types'
import './SearchHeader.scss'
import {
    SearchBar
} from 'react-weui/build/packages'

const filter = require('../../../asset/common/filter@3x.png');
const filterChecked = require('../../../asset/common/filter-active@3x.png');
const create = require('../../../asset/common/create_blue@3x.png');

class SearchHeader extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div className="SearchHeader">
            <div onClick={e => {
                this.props.filter()
            }}>
                <img className="toolbar-icon" src={this.props.isFilter ? filterChecked:filter}/>
            </div>
            <div style={{ flex: 1 }}>
                <SearchBar onChange={value => {this.props.onChange(value)}} onSubmit={text => {this.props.onSubmit(text)}}/>
            </div>
            <div onClick={this.props.create}>
                <img className="toolbar-icon" src={create}/>
            </div>
        </div>
    }
}

SearchHeader.propTypes = {
    isFilter: PropTypes.bool,
    filter: PropTypes.func,
    create: PropTypes.func,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
}

export default SearchHeader