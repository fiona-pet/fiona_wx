/**
 * Created by zhongfan on 2017/11/2.
 */
import React from 'react';
import PropTypes from 'prop-types'
import {
    Flex,
    FlexItem,
    Button
} from 'react-weui';

class MultiButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            buttons:[],
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.defaultValue) {
            this.setState({buttons:nextProps.defaultValue})
        }
    }

    render() {
        let props = this.props;
        let titles = [props.titles];
        if (props.titles.length > 4) {
            let titles1 = props.titles.slice(0, 4);
            let titles2 = props.titles.slice(4);
            titles = [titles1, titles2];
        }
        return <div style={{width:"100%"}}>
            {
                titles.map((item,index) => {
                    return <Flex key={index} style={{marginTop:"5px"}}>
                        {
                            item.map((title,index) => {
                                let backgroundColor = "white";
                                this.state.buttons.map(button => {
                                    if (button === title) {
                                        backgroundColor = "rgba(106,201,250, 0.5)"
                                    }
                                });
                                console.log(title)
                                return <FlexItem key={index} style={{margin:"0 4px"}}>
                                    <Button style={{backgroundColor:backgroundColor, padding:"1px", color:"black"}} onClick={e => {
                                        let isSelected = false;
                                        let buttons = [];
                                        this.state.buttons.map((button,index) => {
                                            if (button === title) {
                                                isSelected = true
                                            }else {
                                                buttons.push(button)
                                            }
                                        });
                                        if (!isSelected) {
                                            buttons = this.state.buttons
                                            buttons.push(title)
                                        }
                                        this.props.valueChange(buttons)
                                        this.setState({buttons:buttons})
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

MultiButton.propTypes = {
    titles: PropTypes.array,
    defaultValue: PropTypes.array,
    valueChange: PropTypes.func
};

export default MultiButton