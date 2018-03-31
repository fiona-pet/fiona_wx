/**
 * Created by zhongfan on 2017/8/17.
 */
import React from 'react'
import PropTypes from 'prop-types'
import './DynamicButton.scss'
import {
    Flex,
    FlexItem,
    Button
} from 'react-weui/build/packages';

class DynamicButton extends React.Component {
    constructor(props) {
        super(props);

    }
    render() {
        let props = this.props;
        let titles = [props.titles];
        if (props.titles.length > 4) {
            let titles1 = props.titles.slice(0, 4);
            let titles2 = props.titles.slice(4);
            titles = [titles1, titles2];
        }
        return <div style={{bottom:"5px", position:"absolute", width:"100%"}}>
            {
                titles.map((item,index) => {
                    return <Flex key={index} style={{marginTop:"5px"}}>
                        {
                            item.map((title,itemIndex) => {
                                return <FlexItem key={index*4 + itemIndex} style={{margin:"0 4px"}}>
                                    <Button style={{backgroundColor:"#338BDB", padding:"0"}} onClick={e => {
                                        props.buttonClick(title, index*4 + itemIndex)
                                    }}>
                                        {title}
                                    </Button>
                                </FlexItem>
                            })
                        }
                    </Flex>
                })
            }
        </div>
    }
}

DynamicButton.propTypes = {
    titles: PropTypes.array,
    buttonClick: PropTypes.func
};

export default DynamicButton