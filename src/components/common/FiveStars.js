/**
 * Created by zhongfan on 2017/7/18.
 */
import React from 'react'
import PropTypes from 'prop-types'
import {
    Flex,
    FlexItem,
} from 'react-weui/build/packages';
import './FiveStars.scss'

import star_disable from '../../../asset/utilization/star_disable.png'
import star_highlight from '../../../asset/utilization/star_highlight.png'

class FiveStars extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imageIndex:props.selectedIndex ? props.selectedIndex:0
        }
    }
    imageClick(index, e) {
        if(this.props.clickable){
            this.setState({imageIndex:index})
            if (this.props.valueChange) {
                this.props.valueChange(index)
            }
        }
    }

    render() {
        return <Flex className="weui-flex FiveStars">
            <FlexItem>
                <img src={this.state.imageIndex < 1 ? star_disable:star_highlight}
                     onClick={this.imageClick.bind(this, 1)}/>
            </FlexItem>
            <FlexItem>
                <img src={this.state.imageIndex < 2 ? star_disable:star_highlight}
                     onClick={this.imageClick.bind(this, 2)}/>
            </FlexItem>
            <FlexItem>
                <img src={this.state.imageIndex < 3 ? star_disable:star_highlight}
                     onClick={this.imageClick.bind(this, 3)}/>
            </FlexItem>
            <FlexItem>
                <img src={this.state.imageIndex < 4 ? star_disable:star_highlight}
                     onClick={this.imageClick.bind(this, 4)}/>
            </FlexItem>
            <FlexItem>
                <img src={this.state.imageIndex < 5 ? star_disable:star_highlight}
                     onClick={this.imageClick.bind(this, 5)}/>
            </FlexItem>
        </Flex>
    }
}

FiveStars.propTypes = {
    clickable: PropTypes.bool,
    selectedIndex: PropTypes.number,
    valueChange: PropTypes.func
};

export default FiveStars