import React from 'react'
import {
    Button,
    Panel,
    PanelHeader,
    PanelBody,
    PanelFooter,
    MediaBox,
    Cells,
    CellsTitle,
    CellsTips,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
    Label,
    Toast,
    Dialog,
    Alert
} from 'react-weui/build/packages';
import './AssetManage.scss'
import {restRequest} from '../../utils/rpcRequest'
import {withRouter} from "react-router-dom";
import {getAssetById} from '../../services/utilization'
import {
    SearchBar
} from 'react-weui/build/packages'

import Title from 'react-title-component'

const scanqrcode = require("../../../asset/utilization/scanqrcode@2x.png");

class AssetManage extends React.Component {
    constructor(props) {
        super(props);
        document.title = "资产管理";
        this.state = {
            loading: false,
            errorMsg: ''
        };
    }

    search(text) {
        text = $.trim(text);
        if (!text){
            this.props.showMessage("请输入正确的关键字", "warn");
            return;
        }
        console.log(text);
        this.props.history.push({
            pathname: '/utilization/assetSearch/' + text,
        });
    }

    goDetail(item) {
        this.props.history.push({
            pathname: '/utilization/assetDetail/' + item.id + "/" + item.type.id,
        });
    }

    scanQRCode() {
        this.setState({loading: true});

        let jsApiList = [
            'scanQRCode'
        ];
        let url = location.href.split('#')[0];

        restRequest("POST", "smart/api/wx/sign", {'id': window.config.businessId, "url": url}).then(result => {
            result = JSON.parse(result);
            result = result.data;
            result.timestamp = parseInt(result.timestamp);
            result['debug'] = false;//微信扫一扫测试
            result['jsApiList'] = [
                'scanQRCode',
            ];
            wx.config(result);
            wx.ready(() => {
                this.setState({loading: false});
                wx.scanQRCode({
                    needResult: 1,
                    scanType: ["qrCode", "barCode"],
                    success: res => {
                        let {resultStr} = res;
                        // 条形码格式：xxxx,资产id
                        // 二维码格式：资产id
                        let arr = resultStr.split(',');
                        let id = arr[arr.length - 1];

                        this.setState({loading: false});
                        getAssetById(id).then(
                            res => {
                                let result = JSON.parse(res).result;
                                console.log(result);
                                if (result) {
                                    this.goDetail(result);
                                } else {
                                    this.setState({
                                        loading: false,
                                        errorMsg: '没有找到匹配的资产信息或无权限查询此资产信息'
                                    });
                                    this.props.showMessage("没有找到匹配的资产信息或无权限查询此资产信息", "error");                                }
                            }
                        , err => alert(err));
                    },
                    fail: res => {
                        this.setState({
                            errorMsg: 'Error: ' + JSON.stringify(res)
                        });
                    },
                });
            });

            wx.error(function(res){
                alert(JSON.parse(res));
            });
        }, ({error}) => {
            alert(error.data);
        });
    }


    clearErrorMsg() {
        this.setState({
            errorMsg: null,
        });
    }

    render() {
        return <div className="AssetManage">
            <Title render="资产管理"/>
            <SearchBar
                placeholder="多关键字以空格隔开"
                onSubmit={this.search.bind(this)}/>
            <div>
                <div className="main">
                    <img src={scanqrcode}/>
                    <div className="desc">可扫描资产上的条码查看</div>
                    <Button className="scan-btn" type="default" onClick={this.scanQRCode.bind(this)}>
                        扫码查询
                    </Button>
                </div>

                <Toast icon="loading" show={this.state.loading}>Loading...</Toast>

            </div>
        </div>
    }
}

export default withRouter(AssetManage)
