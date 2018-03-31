/**
 * Created by zhongfan on 2017/6/22.
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
import Profile from '../../../asset/common/touxiang_60.png'

class CommentCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {display:'none',more:'flex'}
    }
    moreClick(id){
        this.setState({display:'flex', more:'none'})
    }
    renderMore(index, show){
        console.log('renderMore', index, show)
        if (this.props.replyList.length > this.props.number)
            return <Cell key={index} style={{'display':this.state.more}} onClick={this.moreClick.bind(this)}>
                {'还有' + (this.props.replyList.length - 3) + '条回复...'}
            </Cell>
        
    }
    render() {
        return <Cells>
            <Cell>
                <CellHeader style={{width: '44px', height: '40px',}}>
                    <img src={this.props.icon ? this.props.icon : Profile}
                         style={{width: '32px', height: '32px', margin: '8px 0 0 0'}}/>
                </CellHeader>
                <CellBody>
                    {this.props.name}
                </CellBody>
                <CellFooter>
                    {this.props.time}
                </CellFooter>
            </Cell>
            <Cell>
                <CellHeader style={{width: '44px'}}>
                </CellHeader>
                <CellBody>
                    <Cell onClick={e => {
                        this.props.replyClick(this.props.name, this.props.id, this.props.createUserId, 0)
                    }}>
                        {this.props.content}
                    </Cell>
                    <Cells style={{backgroundColor: '#f8f8f8'}}>
                        {this.props.replyList.map((item, index) => {
                            if (index < this.props.number) {
                                return <Cell key={index} onClick={e => {
                                    this.props.replyClick(item.create_user.display_name, item.id, item.create_user.id, item.count)
                                }}>
                                    {index == 0 ? (item.create_user.display_name + " 回复 " + this.props.name + " ： " + item.description) : (item.create_user.display_name + " 回复 " + item.parentName + " ： " + item.description)}
                                </Cell>
                                
                            }else{
                                return <Cell key={index} style={{'display':this.state.display}} onClick={e => {
                                    this.props.replyClick(item.create_user.display_name, item.id, item.create_user.id, item.count)
                                }}>
                                    {index == 0 ? (item.create_user.display_name + " 回复 " + this.props.name + " ： " + item.description) : (item.create_user.display_name + " 回复 " + item.parentName + " ： " + item.description)}
                                </Cell>
                            }
                        })}
                    </Cells>
                    <Cells style={{backgroundColor: '#f8f8f8'}}>
                        {this.renderMore()}
                    </Cells>
                </CellBody>
            </Cell>
        </Cells>
    }
}

CommentCell.propTypes = {
    icon: PropTypes.string,
    name: PropTypes.string,
    time: PropTypes.string,
    id: PropTypes.string,
    number: PropTypes.string,
    createUserId: PropTypes.string,
    content: PropTypes.string,
    replyList: PropTypes.array,
    replyClick: PropTypes.func,
    moreClick: PropTypes.func,
};

export default CommentCell;