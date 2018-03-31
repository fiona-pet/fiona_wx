/**
 * Created by zhongfan on 2017/6/12.
 */
import React from 'react'
import PropTypes from 'prop-types'
import {
    CellBody,
    CellHeader,
    CellFooter,
    Cells,
    Form,
    FormCell,
    Radio,
    Popup,
    SearchBar,
    Checkbox
} from 'react-weui/build/packages';
import './MultiSelect.scss'
import RandomString from '../../../utils/RandomString'
import InfiniteLoader from '../infiniteloader'
import PageAction from '../PageAction/PageAction';
import PageActions from '../PageAction/PageActions';

class MultiSelect extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            uuid: RandomString(32),
            selectedItem: {
                ids: [],
                id: '',
                display_names: [],
                display_name: '',
                items: []
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.defaultValue != nextProps.defaultValue && nextProps.defaultValue) {
            let ids = nextProps.defaultValue.split(",");
            let dataSource = nextProps.dataSource;
            let items = [];
            dataSource.map(item => {
                ids.map(id => {
                    if (item.id == id) {
                        items.push(item)
                    }
                })
            })
            this.setState({items: items})
        }
        if (nextProps.defaultValue) {
            // let ids = '';
            //
            // if (this.state.selectedItem.id == undefined) {
            //     ids = nextProps.defaultValue.split(",");
            // } else {
            //     ids = this.state.selectedItem.id.split(',');
            // }
            //
            // let dataSource = nextProps.dataSource;
            //
            // for (var index in dataSource) {
            //     let item = dataSource[index];
            //
            //     if (!this.state.selectedItem.items) {
            //         this.state.selectedItem.items = [];
            //     }
            //     let selectData = this.state.selectedItem.items;
            //     let isRepetition = false;
            //     for (var m in selectData) {
            //         isRepetition = item.id == selectData[m].id;
            //     }
            //     if (isRepetition) {
            //         continue;
            //     }
            //
            //     for (var i in ids) {
            //         let checked = item.id == ids[i];
            //         if (checked) {
            //             this.state.selectedItem.items.push(item);
            //         }
            //     }
            // }
        }
    }

    radioClick(item) {
        if (!this.state.selectedItem.items) {
            this.state.selectedItem.items = [];
        }
        let selectdata = this.state.selectedItem.items;
        let length = this.state.selectedItem.items.length;
        if (length == 0) {
            selectdata.push(item);
        } else {
            for (var i in selectdata) {
                if (item.id == selectdata[i].id) {
                    selectdata.splice(i, 1);
                }
            }
        }
        if (length == selectdata.length) {
            selectdata.push(item);
        }
        let ids = [];
        let display_names = [];
        for (var i in selectdata) {
            ids.push(selectdata[i].id);
            display_names.push(selectdata[i].display_name);
        }
        this.setState({
            selectedItem: {
                items: selectdata,
                ids: ids,
                display_names: display_names,
                id: ids.join(),
                display_name: display_names.join()
            }
        });
    }

    radioChecked(item) {
        let selectdata = this.state.selectedItem.items;
        let checked = false;
        for (var i in selectdata) {
            if (item.id == selectdata[i].id) {
                checked = true
                break;
            }
        }

        if (this.state.selectedItem.id === undefined) {
            if (item.id) {
                if (this.props.defaultValue) {
                    let ids = this.props.defaultValue.split(",");
                    for (var i in ids) {
                        checked = item.id == ids[i];
                        if (checked)
                            break;
                    }
                }
            }
        }
        return checked
    }

    render() {
        let props = this.props;
        return <Popup
            style={{height: '100%'}}
            className="MultiSelect"
            key={this.state.uuid}
            show={this.props.show}
            onRequestClose={e => {
                props.handleCancelClick()
            }}
        >
            <div>
                <SearchBar
                    onChange={value => {
                        props.searchChange(value)
                    }}
                    onSubmit={value => {
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
                    <Form checkbox>
                        {props.dataSource.map((item, index) => (
                            <FormCell checkbox key={index} onClick=''>
                                <CellHeader>
                                    <Checkbox name={index + this.uuid}
                                              checked={this.radioChecked(item)}
                                              onChange={e => this.radioClick(item)}
                                    />
                                </CellHeader>
                                <CellBody style={{whiteSpace: 'pre-wrap'}}>
                                    {item.display_name}
                                </CellBody>
                            </FormCell>
                        ))}

                    </Form>
                </InfiniteLoader>
                <PageActions>
                    <PageAction onClick={e => {
                        props.handleCancelClick();
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

MultiSelect.propTypes = {
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

export default MultiSelect