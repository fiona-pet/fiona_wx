/**
 * Created by Jin on 2017/6/15.
 */
import React from 'react';
import {
    CellBody,
    CellFooter,
    Form,
    FormCell,
    Radio,
    SearchBar,
} from 'react-weui/build/packages';

import Page from '../../components/common/page';
import BottomButtonGroup from '../../components/common/BottomButtonGroup';

import './RadioList.scss';
import WorkSheetModel from '../../models/WorkSheet'

export default class RadioList extends React.Component {

    constructor(props) {
        super(props);
        console.log(props)
        this.state = {
            from: this.props.location.from,
            id: '',//条目id
            displayName: '',//条目显示名
            index: 0,//索引，用于显示对勾
            content:[],
        }
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        switch (this.state.from) {
            case 'chooseLocation':
                WorkSheetModel.getLocationList((result) => {
                    this.setState({content: result});
                });
                break;
            case 'chooseUser':
                WorkSheetModel.getUserList((result) => {
                    this.setState({content: result});
                });
                break;
            default:
                break;
        }
    }

    confirm() {
        this.props.history.goBack({
            id: this.state.id,
            displayName: this.state.displayName,
            index: this.state.index,
        });
    }

    cancel() {
        this.props.history.goBack();
    }

    choose(item, index) {
        this.state.index = index;
        this.state.id = item.id;
        this.state.displayName = item.display_name;
    }

    renderList(item, index) {
        if (index === this.state.index) {
            return <FormCell radio>
                <CellBody>{item.display_name}</CellBody>
                <CellFooter>
                    <Radio name="radio1" value={index} defaultChecked onClick={this.choose.bind(this, item, index)}/>
                </CellFooter>
            </FormCell>
        } else {
            return <FormCell radio>
                <CellBody>{item.display_name}</CellBody>
                <CellFooter>
                    <Radio name="radio1" value={index} onClick={this.choose.bind(this, item, index)}/>
                </CellFooter>
            </FormCell>
        }
    }

    render() {
        return <Page>
            <SearchBar/>
            <Form radio>
                {this.state.content.map((item, index) => (
                    this.renderList(item, index)
                    ))}
            </Form>
            <BottomButtonGroup
                state='2'
                positiveText='确定'
                positiveIcon=''
                positiveClick={this.confirm.bind(this)}
                negativeText='取消'
                negativeIcon=''
                negativeClick={this.cancel.bind(this)}/>
        </Page>
    }
}
