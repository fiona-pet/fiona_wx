/**
 * Created by zhongfan on 2017/6/12.
 */
import React from 'react'
import './DynamicButtonCell.scss'
import PropTypes from 'prop-types'
import {
    Select,
    Input,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
    Article,
    Button,
    Preview,
    PreviewHeader,
    PreviewFooter,
    PreviewBody,
    PreviewItem,
    PreviewButton,
    Toptips
} from 'react-weui/build/packages';
import {
    getActions, getNodeByOrder, getNodeByServiceCatalog
} from '../../services/utilization'

class DynamicButtonCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            actions: [{}],
            isTipShown: false,
            tipTimer: null
        }
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.serviceId && nextProps.serviceId != '') {
            getNodeByServiceCatalog(nextProps.serviceId).then(res => {
                let obj = JSON.parse(res);
                console.log("getNodeByServiceCatalog", obj)
                if (typeof obj.error === 'object') {
                    this.showTip();
                    return
                }
                this.setState({actions: obj.result})

                // let interaction = JSON.parse(obj.result.interaction);
            });

        }
        console.log("button:", nextProps);
    }


    componentDidMount() {
        if (this.props.id) {
            getNodeByOrder(this.props.id).then(res => {
                let obj = JSON.parse(res);
                console.log("getNodeByOrder", obj)
                if (obj.result) {
                    this.setState({actions: obj.result})
                }
            });
        }

    }

    click(item) {
        console.log('click:', item.id);

        this.props.buttonClick(item);
    }

    showTip() {
        this.setState({isTipShown: true});
        this.state.tipTimer = setTimeout(()=> {
            this.setState({isTipShown: false});
        }, 2000);
    }

    render() {
        let props = this.props;

        return <div className="DynamicButtonCell">
            <Toptips type="warn" show={this.state.isTipShown}>此服务目录未绑定流程！</Toptips>
            <Preview>
                <PreviewFooter>
                    {this.props.displaycommen ? <PreviewButton onClick={(e) => {
                            props.buttonClick(null, null, "评论工单");
                        }
                        }>{"评论"}</PreviewButton> : ''
                    }
                    {this.state.actions.map((item, index) => {
                        return <PreviewButton key={index} onClick={(e) => {
                            if (item.interaction) {
                                props.buttonClick(e.target, item.id, JSON.parse(item.interaction));
                            } else {
                                props.buttonClick(e.target, item.id, null);
                            }
                        }
                        }>{item.display_name}</PreviewButton>;
                    })}
                </PreviewFooter>
            </Preview>
        </div>
    }
}

DynamicButtonCell.propTypes = {
    type: PropTypes.string,
    title: PropTypes.string,
    displaycommen: PropTypes.bool,
    serviceId: PropTypes.string,
    defaultValue: PropTypes.string,
    valueChange: PropTypes.func,
    onClick: PropTypes.func,
    buttonClick: PropTypes.func,
    dataSource: PropTypes.array,
};

export default DynamicButtonCell