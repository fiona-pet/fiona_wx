/**
 * 资产出库
 * Created by Jin on 2017/6/15.
 */
import React from 'react';
import {
    Button,
    ButtonArea,
    Cell,
    CellBody,
    CellFooter,
    CellHeader,
    Cells,
    Input,
    Label,
    Toast,
    Toptips,
} from 'react-weui/build/packages';

import Page from '../../components/common/page';
import Title from 'react-title-component'
import SingleSelect from '../../components/common/cmdb/SingleSelect'

import UtilizationModel from '../../models/Utilization'
import WorkSheetModel from '../../models/WorkSheet'

import {
    onSearchUser,
    onSearchLocation
} from '../../services/utilization'

import './AssetDeliver.scss';

const location = "location";
const user = "user";

export default class AssetDeliver extends React.Component {

    constructor(props) {
        super(props);
        document.title = "资产出库";
        this.state = {
            type:'',
            lookup_popUp:false,
            lookUpDataSource: [],
            id: '',
            desc: '',
            location: {display_name:''},
            user: {display_name:''},
            isToastShown: false,
            isTipShown: true,
            tipText: '',
            index: '',
        }
    }

    componentDidMount() {
        this.state.id = this.props.match.params.id;
    }

    /**
     * 提交
     */
    onSubmit() {
        if (this.state.user.display_name === '') {
            this.setState({
                isTipShown: true,
                tipText: '请选择使用人'
            });
            setTimeout(() => {
                this.setState({isTipShown: false});
            }, 3000);
            return;
        }

        UtilizationModel.deliver(this.state.id, this.state.desc, this.state.location, this.state.user,() => {
            this.props.history.goBack()
        },(message) => {
            this.setState({
                isTipShown: true,
                tipText: message
            });
            setTimeout(() => {
                this.setState({isTipShown: false});
            }, 3000);
        });
    }

    /**
     * 选择物理位置
     */
    toChooseLocation() {
        WorkSheetModel.getLocationList((result) => {
            this.setState({lookUpDataSource: result, lookup_popUp:true, type:location});
        })
    }

    /**
     * 选择使用人
     */
    toChooseUser() {
        WorkSheetModel.getUserList((result) => {
            this.setState({lookUpDataSource: result, lookup_popUp:true, type:user});
        })
    }

    handleOKClick(item) {
        this.setState({lookup_popUp: false});
        if (!item.id) {
            return
        }
        if (this.state.type == user) {
            this.setState({user: item});
        }
        if (this.state.type == location) {
            this.setState({location: item});
        }
    }
    handleCancelClick() {
        this.setState({lookup_popUp: false});
    }

    defaultId() {
        if (this.state.type == user) {
            return this.state.user.id
        }
        if (this.state.type == location) {
            return this.state.location.id
        }
    }

    searchChange(value) {
        if (this.state.type === user) {
            onSearchUser(value).then(res => {
                this.setState({lookUpDataSource: JSON.parse(res).result})
            })
        }
        if (this.state.type === location) {
            onSearchLocation(value).then(res => {
                this.setState({lookUpDataSource: JSON.parse(res).result})
            })
        }
    }

    onLoadMore(finish) {
        finish()
        //需求分页时添加
    }

    render() {
        let user = this.state.user.display_name;
        let location = this.state.location.display_name;
        return <Page className="AssetDeliver">
            <Title render="填写出库信息"/>
            <Cells className="weui-cells">
                <Cell>
                    <CellHeader>
                        <Label>资产用途</Label>
                    </CellHeader>
                    <CellBody>
                        <Input placeholder="选填"/>
                    </CellBody>
                </Cell>
                <Cell access onClick={this.toChooseLocation.bind(this)}>
                    <CellHeader>
                        <Label>物理位置</Label>
                    </CellHeader>
                    <CellBody>
                        <div className="list_placeholder">{location.length ? location : '选填'}</div>
                    </CellBody>
                    <CellFooter/>
                </Cell>
            </Cells>
            <Cells className="weui-cells">
                <Cell access onClick={this.toChooseUser.bind(this)}>
                    <CellHeader>
                        <Label>
                            <div className="cell_body_head">
                                <span className="isRequire">*</span>
                            </div>
                            <div  className="cell_body_content">
                                 使用人
                            </div>
                        </Label>
                    </CellHeader>
                    <CellBody>
                        <div className="list_placeholder">{user.length ? user : '请选择'}</div>
                    </CellBody>
                    <CellFooter/>
                </Cell>
            </Cells>
            <ButtonArea>
                <Button className="weui_btn_primary" onClick={this.onSubmit.bind(this)}>提交</Button>
            </ButtonArea>
            <Toast icon="success-no-circle" show={this.state.isToastShown}>操作成功！</Toast>
            <Toptips type="warn" show={this.state.isTipShown}>{this.state.tipText}</Toptips>
            <SingleSelect show={this.state.lookup_popUp} dataSource={this.state.lookUpDataSource}
                          handleOKClick={this.handleOKClick.bind(this)} handleCancelClick={this.handleCancelClick.bind(this)}
                          searchChange={this.searchChange.bind(this)} defaultValue={this.defaultId()}
                          onLoadMore={this.onLoadMore.bind(this)}
            />
        </Page>
    }
}
