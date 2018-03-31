/**
 * Created by sufei on 2017/7/4.
 */
import React from 'react'
import './ReplyComment.scss'
import PropTypes from 'prop-types'
import {
    TextArea,
    Cells,
    Cell,
    CellHeader,
    CellBody,
    CellFooter, Popup, PopupHeader, Article, Button
} from 'react-weui/build/packages';
import PageAction from './PageAction/PageAction';
import PageActions from './PageAction/PageActions';
import RandomString from '../../utils/RandomString'
/**
 * 回复评论
 */
class ReplyComment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uuid:RandomString(32),
            text: '',
        }
    }

    render() {
        let props = this.props;

        return <Popup
            style={{height: '100%'}}
            className="ReplyComment"
            show={this.props.show}
            key={this.state.uuid}
            onRequestClose={props.handleCancelClick}
        >
            <div>
                <div className="ReplyComment_Body">
                    <TextArea
                        placeholder={props.defaultValue}
                        type="text"
                        defaultValue={''}
                        onChange={(e) => {
                            this.setState({text: e.target.value})
                        }}>
                </TextArea>
                </div>
                <PageActions>
                    <PageAction onClick={e => {
                        this.setState({uuid:RandomString(32), text:''});
                        props.handleCancelClick()
                    }}>取消</PageAction>
                    <PageAction
                        onClick={e => {
                            props.handleOKClick(this.state.text);
                            this.setState({uuid:RandomString(32), text:''})
                        }}
                        type="primary">
                        确定
                    </PageAction>
                </PageActions>
            </div>
        </Popup>
    }
}

ReplyComment.propTypes = {
    show: PropTypes.bool,
    defaultValue: PropTypes.string,
    handleOKClick: PropTypes.func,
    handleCancelClick: PropTypes.func,
};

export default ReplyComment