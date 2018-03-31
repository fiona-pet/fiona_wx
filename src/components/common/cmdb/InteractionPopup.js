/**
 * Created by zhongfan on 2017/8/18.
 */
import React from 'react'
import PropTypes from 'prop-types'
import './InteractionPopup.scss'
import {
    Icon,
    ButtonArea,
    Button,
    Label,
    Popup,
    PopupHeader,
    FormCell,
    Form,
    Input,
    Checkbox,
    Radio,
    TextArea,
    Select,
    CellsTitle,
    Cells,
    Cell,
    CellHeader,
    CellFooter,
    CellBody, Preview, PreviewHeader, PreviewFooter, PreviewBody, PreviewItem, PreviewButton
} from 'react-weui';
import DynamicCells from '../DynamicCells'
import RandomString from '../../../utils/RandomString'
import PageAction from '../PageAction/PageAction'
import PageActions from '../PageAction/PageActions'

import WorkSheetModel from '../../../models/WorkSheet'
import MultiSelect from './MultiSelect'
import SingleSelect from './SingleSelect'

const directory = "directory";
const user = "user";

class InteractionPopup extends React.Component {

    constructor(props) {
        super(props);

        this.allData = [];
        this.pageIndex = 1;
        this.selectedItem = {editor:''};

        this.state = {
            lookup_popUp: false,
            multi_lookup_popUp: false,
            lookUpDataSource: [],
            selectedItem:{editor:''},
            components: [],
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.show != nextProps.show) {
            this.setState({components:nextProps.dataSource})
        }
    }

    cellClick(popUpProps) {
        this.setState({...popUpProps});
        this.selectedItem = this.state.selectedItem;
        this.allData = [];
    }
    onLoadMore(resolve, finish) {
        WorkSheetModel.loadLookUpData(this.allData, this.selectedItem, '', this.pageIndex, (allData, resIndex) => {
            this.allData = allData;
            this.pageIndex = resIndex;
            this.setState({lookUpDataSource: allData});
            resolve()
        }, finish)
    }

    // 动态列表选择页面的取消
    handleCancelClick() {
        this.setState({
            lookup_popUp: false,
            multi_lookup_popUp: false,
            replyComment: false,
        })
    }

    // 动态列表选择页面的确定
    handleOKClick(item) {
        console.log(this.props.rules, this.props.ciTypes)
        this.setState({lookup_popUp: false, multi_lookup_popUp: false});
        WorkSheetModel.setComponentsValue(this.state.components, item, this.state.selectedItem.id);
        WorkSheetModel.changeComponentsRule(this.state.components, this.props.rules, this.props.ciTypes, this.state.selectedItem.name, '', (components) => {
            this.setState({components:components})
        });
    }

    defaultId() {
        return this.selectedItem.defaultId
    }

    searchChange(value) {
        console.log(value)

        // this.setState({lookUpDataSource: this.allData});

        if (!this.state.lookup_popUp && !this.state.multi_lookup_popUp) return;
        this.pageIndex = 1;
        WorkSheetModel.loadLookUpData([], this.selectedItem, value, this.pageIndex, (allData, resIndex) => {
            if(!value){
                this.allData = this.allData.length == 0 ? allData : this.allData;
            }
            // this.pageIndex = resIndex;
            console.log(value)

            if (this.selectedItem.editor == 'userselector' || this.selectedItem.editor == 'roleselector') {
                this.setState({multi_lookup_popUp: true, lookUpDataSource: allData});
            } else {
                this.setState({lookup_popUp: true, lookUpDataSource: allData});
            }
            if(!value){
                this.setState({lookUpDataSource: this.allData});
            }
        })
    }

    isArray(o){
        console.log(Object.prototype.toString.call(o)=='[object Array]')
        return Object.prototype.toString.call(o)=='[object Array]';
    }

    valueChange(value, id, name) {
        WorkSheetModel.setComponentsValue({"value":value}, id);
        WorkSheetModel.changeComponentsRule(this.state.components, this.props.rules, this.props.ciTypes, name, (components) => {
            console.log(components);
            this.setState({components:components})
        });
    }

    render() {
        const dynamicCellsProps = {
            key:this.props.show,
            components:this.state.components,
            ciTypes:this.props.ciTypes,
            rules:this.props.rules,
            cellClick:this.cellClick.bind(this)
        };
        return <Popup
            style={{height: '100%'}}
            className="InteractionPopup"
            show={this.props.show}
            onRequestClose={e => {this.props.handleCancelClick()}}
        >
            <div>
                <CellsTitle>
                    {this.props.pageName}
                </CellsTitle>
                <DynamicCells {...dynamicCellsProps}/>
                <PageActions style={{position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2}}>
                    <PageAction onClick={e => {
                        this.props.handleCancelClick();
                    }}>取消</PageAction>
                    <PageAction onClick={e => {
                        this.props.handleOKClick(this.state.components);
                    }} type="primary">确定</PageAction>
                </PageActions>
                <SingleSelect show={this.state.lookup_popUp} dataSource={this.state.lookUpDataSource}
                              handleOKClick={this.handleOKClick.bind(this)}
                              handleCancelClick={this.handleCancelClick.bind(this)}
                              searchChange={this.searchChange.bind(this)}
                              defaultValue={this.defaultId()}
                              onLoadMore={this.onLoadMore.bind(this)}
                />
                <MultiSelect show={this.state.multi_lookup_popUp} dataSource={this.state.lookUpDataSource}
                              handleOKClick={this.handleOKClick.bind(this)}
                              handleCancelClick={this.handleCancelClick.bind(this)}
                              searchChange={this.searchChange.bind(this)}
                              defaultValue={this.defaultId()}
                              onLoadMore={this.onLoadMore.bind(this)}
                />
            </div>
        </Popup>
    }
}

InteractionPopup.propTypes = {
    pageName: PropTypes.string,
    dataSource: PropTypes.array,
    rules:PropTypes.array,
    ciTypes:PropTypes.array,
    handleOKClick: PropTypes.func,
    handleCancelClick: PropTypes.func
};

export default InteractionPopup
