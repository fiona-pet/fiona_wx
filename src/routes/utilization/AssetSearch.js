import React from 'react';
import {
    SearchBar,
    Cells,
    CellsTitle,
    Cell,
    CellBody,
    CellFooter
} from 'react-weui/build/packages';
import Page from '../../components/common/page';
import {withRouter} from "react-router-dom";
import ScrollView  from '../../components/common/ScrollView'
import AssetCell from '../../components/common/AssetCell'
import './AssetSearch.scss';
import UtilizationModel from '../../models/Utilization'
import Empty from '../../components/common/NoData'

const scanqrcode = require("../../../asset/utilization/list@3x.png");

class AssetSearch extends React.Component {

    constructor(props) {
        super(props);
        document.title = "资产搜索";
        this.state = {
            data: [],
            emptyShow: false,
            agian: true
        };

        this.pageInfo = {
            pageIndex: 1,
            pageSize: 15
        };
        this.query = "";
    }

    componentDidMount() {
        this.query = this.props.match.params.id;
        this.loadData(1, this.query);
    }

    loadData(pageIndex, query) {
        console.log("loadData");
        UtilizationModel.getAssetList(pageIndex, query, (result, resIndex) => {
            let data = result.data;

            if (pageIndex != 1) {
                data = this.state.data.concat(data);
            }
            this.setState({data: data,emptyShow: true});

            if(this.state.data.length == 0){
                if(this.state.agian){
                    this.state.agian = false;
                    this.loadData(1,this.query);
                }
            }else{
                this.state.agian = true
            }

            if (data.length <= 0) {
                return
            }

            this.pageIndex = resIndex;
        })
    }

    search(query) {
        console.log("search");
        this.query = query;
        this.loadData(1, this.query);
    }

    next() {
        console.log("next");
        console.log(this.pageInfo.pageIndex);
        this.loadData(this.pageInfo.pageIndex, this.query);
    }

    refresh() {
        console.log("refresh");
        this.loadData(1, this.query);
    }

    goDetail(item) {
        let state = this.hasPrototype(item, 'asset_status');
        console.log("goDetail");

        this.props.history.push({
            pathname: '/utilization/assetDetail/' + item.id + "/" + item.type.id,
        });
    }

    getList() {
        if (this.state.data.length == 0) {
            return (
                <div className="main">
                    <img src={scanqrcode}/>
                    <div className="desc">无匹配资产或您无权限查看</div>
                </div>);
        } else {
            return (
                <ScrollView onUp={this.next.bind(this)} onDown={this.refresh.bind(this)}>
                    {this.state.data.map((json, index) => {
                        let item = JSON.parse(json)
                        return <AssetCell key={index} title={item.display_name} type={item.type.display_name}
                                          state={this.hasPrototype(item, 'asset_status')} assetNum={item.asset_code}
                                          onClick={this.goDetail.bind(this, item.id)}/>
                    })}
                </ScrollView>);
        }
    }

    hasPrototype(object, name) {
        let b = object.hasOwnProperty(name) && (name in object);
        if (b) {
            return object.asset_status.display_name;
        } else {
            return "未知";
        }
    }

    render() {
        return <Page className="asset-search">
            <SearchBar
                searchName="search"
                placeholder="多关键字以空格隔开"
                onSubmit={this.search.bind(this)}
            />
            <ScrollView onDown={this.refresh.bind(this)} onUp={this.next.bind(this)}>
                <Cells>
                    {this.state.data.length ? this.state.data.map((item, index) => (
                            <AssetCell key={index} title={item.display_name} type={item.type.display_name}
                                       state={this.hasPrototype(item, 'asset_status')} assetNum={item.asset_code}
                                       onClick={this.goDetail.bind(this, item)}/>
                        )) : <Empty
                            show={this.state.emptyShow}
                            src={'assets'}
                            remind={'无匹配资产或您无权限查看'}/>}
                </Cells>

            </ScrollView>
        </Page>
    }
}

export default withRouter(AssetSearch);
