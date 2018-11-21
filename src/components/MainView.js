import React from "react";
import { Layout, Breadcrumb } from "antd";
import { Row, Col } from "antd";
import Files from "./fileStructure/files";
import Controll from "./controll/controll";
import { Table } from "antd";
import "./MainView.css";
import { Divider } from "antd";
import openSocket from "socket.io-client";
import ActionWindow from "./actionWindow/actionWindow";
import axios from "axios/index";
import { message, Icon, Alert, Input } from 'antd';
const { TextArea } = Input;
import factory from '../../ethereum/factory';
import web3 from '../../ethereum/web3';

const success = () => {
  message.success('Binaries was successfully generated and deployed in IPFS');
};

const openNotification = () => {
  notification.open({
    message: 'Notification Title',
    placement: 'bottomRight',
    description: 'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
    icon: <Icon type="smile" style={{ color: '#108ee9' }} />,
  });
};

const socket = openSocket("http://localhost:3000");
const { Content } = Layout;

export default class MainView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      runningScript: false,
      hashes: undefined,
      wasDeployed: false,
      selectedRaws: undefined
    };
    this.runScript = this.runScript.bind(this);
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
  }

  runScript() {
    console.log("RUNN");
    this.setState({
      runningScript: true
    });
    axios.get(`http://localhost:8080/api/script`).then(res => {
      // debugger
      const data = res.data;
      success();
      this.setState({
        runningScript: false,
        hashes: data.hashes,
        files: data.files,
        selectedHashes: [],
        description: ''
      });
    });
  }
  
  onDescriptionChange(event, a) {
    this.setState({
      description: event.target.value
    })
  }

  async componentDidMount() {
    const accounts = await web3.eth.getAccounts();
    debugger
    let tasks = await factory.methods
    .tasks(0)
    .call();
    debugger
    
    
    // socket.on('timer', timestamp => console.log(timestamp));
    // socket.emit('subscribeToTimer', 1000);
  }

  render() {
    let loading = this.state.runningScript;
    let { hashes, files } = this.state;
    let me = this;
    const columns = [
      {
        title: "Name",
        dataIndex: "fileName",
        render: text => <a href="javascript:;">{text}</a>
      },
      {
        title: "Hash",
        dataIndex: "hash",
      }
    ];
    const data = [];

    if (hashes) {
      hashes.forEach((hash, i) => {
        data.push({
          key: i,
          hash,
          fileName: files[i].name
        })
      })
      // debugger
    }
    // rowSelection object indicates the need for row selection
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
        me.setState({
          selectedHashes: selectedRows
        })
      },
      getCheckboxProps: record => ({
        disabled: record.name === "Disabled User", // Column configuration not to be checked
        name: record.name
      })
    };
    
    

    return (
      <div className="main-div">
        <Controll
          onRunScriptClick={this.runScript}
          deployHashes={this.state.selectedHashes && this.state.selectedHashes.length > 0 && this.state.description.length > 0}
        />
        <Divider className="no-margin" />
        <Row className="window">
          <Col span={6} className="side-menu">
            <Files className="right-border" />
          </Col>
          <Col span={18} className="actions">
            {loading && <ActionWindow />}
            {hashes && (
              <div className="was-deployed">
                <Table className='binaries'
                  rowSelection={rowSelection}
                  columns={columns}
                  dataSource={data}
                  pagination={false}
                  bordered
                  title={() => 'Generated binaries and their hashes in IPFS'}
                  footer={() => 'Select binaries and click Deploy button to push hashes in Ethereum smart-contract'}
                />
                {this.state.selectedHashes.length === 0 && <Alert message="Select binaries and click 'Create smart contract' button" type="info" showIcon />}
                {this.state.selectedHashes.length > 0 &&
                <TextArea
                  placeholder="Add some description to your tasks"
                  autosize={{ minRows: 2, maxRows: 6 }}
                  onChange={this.onDescriptionChange}/>}
                </div>
              
            )}
          </Col>
        </Row>
        <Divider className="no-margin" />
      </div>
    );
  }
}
