import React from 'react';
import {
    Popup, Picker, CityPicker, Form, FormCell, CellBody, CellHeader, Label, Input,
    Flex,
    FlexItem,
    Button
} from 'react-weui/build/packages';
import MultiButton from '../../components/common/MultiButton'
import Page from '../../components/common/page'
import WorkSheetModel from '../../models/WorkSheet'
import DynamicCells from '../../components/common/DynamicCells'
import {
    getNodeId,
    workorderActionExecute,
    getOrderId,
    getWorkOrderType,
    getNodeByServiceCatalog,
    upload,
    deleteFile
} from '../../services/utilization'

const FAULT_CI_TYPE = '0eea99f2-d189-4875-8e23-2f326c1f8ca0';//表示故障单的id
const data = [{
    "name":"明天",
    "sub":[{
        "name":"上午"
    },{
        "name":"下午"
    },{
        "name":"晚上"
    }]
},{
    "name":"后天",
    "sub":[{
        "name":"上午"
    },{
        "name":"下午"
    },{
        "name":"晚上"
    }]
}]
const titles = [{
    "name":"明天",
    "sub":["全部(3600)", "主机(648)", "网络设备(684)", "存储设备(180)"]
},{
    "name":"后天",
    "sub":["全部(3600)", "可用(3000)", "不可用(200)","未知(400)"]
}];
class PickerDemo extends React.Component {
    constructor(props) {
        super(props);

        this.allData = [];
        this.orderId = '';
        this.nodeId = '';
        this.processId = '';
        this.workOrderType = '';
        this.catalogId = '';
        this.catalogName = '';
        this.selectedItem = {editor: ''};
        this.pageIndex = 1;
        this.ciTypes = [];
        this.rules = [];

        this.state = {
            demoFiles: [],
            type: '',
            lookup_popUp: false,
            multi_lookup_popUp: false,
            lookUpDataSource: [],
            id: '',
            desc: '',
            directory: {display_name: '请选择'},
            isToastShown: false,
            isTipShown: true,
            isUploaderShown: false,//如果是请求单，不显示上传附件
            tipText: '',
            index: {
                i:0,
                j:0
            },
            components: [],
            dynamicButtons: [],
            showAlert: false,
            alert: {
                content: '',
                buttons: [
                    {
                        label: '确定',
                    }
                ]
            },
        }
    }
    componentDidMount() {
    }

    buttonClick(i, j) {
        console.log(i,j)
        this.setState({index: {i:i, j:j}})
    }

    render() {
        const buttonStyle = {
            float: 'left',
            marginLeft: '2.5%',
            width: '30%',
            marginTop: '2.5%',
            backgroundColor: '#F4F4F4',
            color: '#454545'
        };
        return (
            <div>
                {titles.map((item, i) => {
                    return <div style={{display:'inline-block', width:'100%', marginTop:'20px'}}>
                        <div style={{fontSize:'14px', color:'#888888'}}>{item.name}</div>
                        {item.sub.map((title,j) => {
                            let color = '#454545';
                            if (i === this.state.index.i && j === this.state.index.j) {
                                color = '#4691D6'
                            }
                            let buttonStyle = {
                                float: 'left',
                                marginLeft: '1%',
                                padding:'0',
                                fontSize:'15px',
                                width: '32%',
                                marginTop: '2.5%',
                                backgroundColor: '#F4F4F4',
                                border:'none',
                                color: color
                            };
                            return <Button
                                style={buttonStyle}
                                onClick={e => {
                                    this.buttonClick(i, j)
                                }}
                            >
                                {title}
                            </Button>
                        })}
                    </div>
                })}
                <input type="datetime-local" onpropertychange={e => {
                    console.log(e.target.value)
                }} oninput={e => {
                    console.log(e.target.value)
                }} onChange={e => {
                    console.log(e.target.value)
                }}/>
            </div>
        );
    }
}

export default PickerDemo;