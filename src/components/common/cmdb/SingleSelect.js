/**
 * Created by Jin on 2017/6/15.
 */
import React from 'react';
import PropTypes from 'prop-types'
import {
    CellBody,
    CellFooter,
    Cells,
    Form,
    FormCell,
    Radio,
    Popup,
    SearchBar,
} from 'react-weui/build/packages';
import './SingleSelect.scss'
import RandomString from '../../../utils/RandomString'
import InfiniteLoader from '../infiniteloader'
import PageAction from '../PageAction/PageAction';
import PageActions from '../PageAction/PageActions';

class SingleSelect extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            uuid:RandomString(32),
            selectedItem:{}
        }
    }

    radioClick(item) {
        console.log(item)
        this.setState({selectedItem:item})
    }
    radioChecked(item) {
        let checked = false;
        if (item.id == this.state.selectedItem.id) {
            checked = true
        }
        if (!this.state.selectedItem.display_name) {
            if (item.id) {
                checked = item.id == this.props.defaultValue
            }
            if (item.name) {
                checked = item.name == this.props.defaultValue
            }
        }

        return checked
    }

    render() {
        let props = this.props;
        return <Popup
            className="SingleSelect"
            key={this.state.uuid}
            show={this.props.show}
        >
            <div style={{height: '100vh'}}>
                <SearchBar
                    onChange={value => {
                        props.searchChange(value)
                    }}
                    onSubmit={value => {
                        console.log(value)
                    }}
                    placeholder="搜索"
                    lang={{
                        cancel: '取消'
                    }}
                />
                <InfiniteLoader
                    onLoadMore={ (resolve, finish) => {
                        props.onLoadMore(resolve, finish)
                    }}
                >
                    <Form radio>
                        {props.dataSource.map((item,index) => (
                                <FormCell radio key={index} onClick=''>
                                    <CellBody style={{whiteSpace: 'pre-wrap'}}>{item.display_name}</CellBody>
                                    <CellFooter>
                                        <Radio name={index + this.uuid}
                                               checked={this.radioChecked(item)}
                                               onChange={e => this.radioClick(item)}
                                        />
                                    </CellFooter>
                                </FormCell>
                            ))}
                    </Form>
                </InfiniteLoader>
                <PageActions>
                    <PageAction onClick={e => {
                        props.handleCancelClick()
                        this.setState({uuid:RandomString(32), selectedItem:{}})
                    }}>取消</PageAction>
                    <PageAction onClick={e => {
                        props.handleOKClick(this.state.selectedItem);
                        this.setState({uuid:RandomString(32), selectedItem:{}})
                    }} type="primary">确定</PageAction>
                </PageActions>
            </div>
        </Popup>
    }
}

SingleSelect.propTypes = {
    show: PropTypes.bool,
    title: PropTypes.string,
    defaultValue: PropTypes.string,
    searchChange: PropTypes.func,
    radioClick: PropTypes.func,
    handleSearchChange: PropTypes.func,
    handleOKClick: PropTypes.func,
    handleCancelClick: PropTypes.func,
    dataSource: PropTypes.array,
    onLoadMore: PropTypes.func,
};

export default SingleSelect