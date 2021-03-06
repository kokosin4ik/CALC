import React from "react";
import { Row, Col } from "antd";
import Files from "./fileStructure/files";
import Controll from "./controll/controll";
import { Table } from "antd";
import "./MainView.css";
import { Divider } from "antd";
import ActionWindow from "./actionWindow/actionWindow";
import axios from "axios/index";
import { message, Icon, Alert, Input, Button } from "antd";
const { TextArea } = Input;
import taskCreator from "../../ethereum/taskCreator";
import CALC from "../../ethereum/CALC";
import getTask from "../../ethereum/Task";
import web3 from "../../ethereum/web3";

import { Modal } from "antd";

const success = Modal.success;
let ValueToDonate = 4;

function showConfirm(onOkFunc) {
  success({
    title: "Smart contract was succesfully created",
    content: (
      <div>
        Now you should donate to it.
        <div style={{ marginTop: 16 }}>
          <Input
            addonAfter={"CALC"}
            defaultValue={ValueToDonate}
            onChange={e => {
              ValueToDonate = event.target.value;
              console.log(ValueToDonate);
            }}
          />
        </div>
      </div>
    ),
    onOk() {
      return onOkFunc();
    },
    onCancel() {}
  });
}

const successMSG = msg => {
  message.success(msg);
};

const openNotification = () => {
  notification.open({
    message: "Notification Title",
    placement: "bottomRight",
    description:
      "This is the content of the notification. This is the content of the notification. This is the content of the notification.",
    icon: <Icon type="success" style={{ color: "#108ee9" }} />
  });
};

export default class MainView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      runningScript: false,
      hashes: undefined,
      wasDeployed: false,
      selectedRaws: undefined,
      selectedTasks: [],
      selectedCheckers: []
    };
    this.runScript = this.runScript.bind(this);
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
    this.onDeploy = this.onDeploy.bind(this);
  }

  async onDeploy() {
    const accounts = await web3.eth.getAccounts();
    await taskCreator.methods
      .createTask(
        this.state.description,
        this.state.selectedTasks,
        this.state.selectedCheckers
      )
      .send({
        from: accounts[0]
      });
    successMSG(
      "Smart contract was succesfully created. Please, donate some CALC to perform calculations."
    );
    let taskAddress = await taskCreator.methods.lastCreatedTask().call({
      from: accounts[0]
    });
    showConfirm(async () => {
      await CALC.methods.approve(taskAddress, ValueToDonate).send({
        from: accounts[0]
      });

      let taskContract = await getTask(taskAddress);
      // debugger
      await taskContract.methods.putMoney(ValueToDonate).send({
        from: accounts[0]
      });
      successMSG(
        "You have successfully donated your CALC. Let's calculate it!"
      );
    });
  }

  runScript() {
    this.setState({
      runningScript: true
    });
    axios.get(`http://localhost:8000/api/script`).then(res => {
      // debugger
      let data = res.data;
      let checkersHashes = data.hashes.map(arr => arr[0]);
      let tasksHashes = data.hashes.map(arr => arr[1]);
      data.files = data.files.filter(obj => obj.type !== "file");
      let encFilesName = data.files.map(folder => {
        return folder.children.map(file => file.name);
      })[1];
      let decFilesName = data.files.map(folder => {
        return folder.children.map(file => file.name);
      })[0];
      successMSG("Binaries was successfully generated and deployed in IPFS");
      this.setState({
        runningScript: false,
        hashes: tasksHashes,
        checkersHashes: checkersHashes,
        encFiles: encFilesName,
        decFiles: decFilesName,
        description: ""
      });
    });
  }

  onDescriptionChange(event, a) {
    this.setState({
      description: event.target.value
    });
  }

  render() {
    let loading = this.state.runningScript;
    let { hashes, checkersHashes, encFiles, decFiles } = this.state;
    let me = this;
    const columns = [
      {
        title: "Name",
        dataIndex: "fileName",
        render: (text, row) => (
          <a href={`http://127.0.0.1:8080/ipfs/${row.hash}`}>{text}</a>
        )
      },
      {
        title: "IPFS Hash",
        dataIndex: "hash"
      }
    ];
    const dataEnc = [];
    const dataDec = [];

    if (hashes) {
      hashes.forEach((hash, i) => {
        dataEnc.push({
          key: i,
          hash,
          fileName: encFiles[i]
        });
      });
    }
    if (checkersHashes) {
      checkersHashes.forEach((hash, i) => {
        dataDec.push({
          key: i,
          hash,
          fileName: decFiles[i]
        });
      });
    }
    // rowSelection object indicates the need for row selection
    const rowSelection1 = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
        me.setState({
          selectedTasks: selectedRows.map(data => data.hash)
        });
      },
      getCheckboxProps: record => ({
        disabled: record.name === "Disabled User", // Column configuration not to be checked
        name: record.name
      })
    };

    const rowSelection2 = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRows);
        me.setState({
          selectedCheckers: selectedRows.map(data => data.hash)
        });
      },
      getCheckboxProps: record => ({
        disabled: record.name === "Disabled User", // Column configuration not to be checked
        name: record.name
      })
    };

    return (
      <div className="main-div">
        <Divider className="no-margin" />
        <Row className="window">
          <Col span={6} className="side-menu">
            <Files className="right-border" />
          </Col>
          <Col span={18} className={!loading &&
          !hashes ? 'run-window': "actions"}>
            {!loading &&
              !hashes && (
              <Button type="primary" shape="circle" icon="play-circle" size='large' onClick={this.runScript}/>
              )}
            {loading && <ActionWindow />}
            {hashes && (
              <div className="was-deployed">
                <Table
                  className="binaries"
                  rowSelection={rowSelection1}
                  columns={columns}
                  dataSource={dataEnc}
                  pagination={false}
                  bordered
                  title={() =>
                    "Generated tasks-binaries and their hashes in IPFS"
                  }
                />
                <Table
                  className="binaries"
                  rowSelection={rowSelection2}
                  columns={columns}
                  dataSource={dataDec}
                  pagination={false}
                  bordered
                  title={() =>
                    "Generated checkers-binaries and their hashes in IPFS"
                  }
                />
                {this.state.selectedTasks.length === 0 && (
                  <Alert
                    message="Select binaries and click 'Create smart contract' button"
                    type="info"
                    showIcon
                  />
                )}
                {this.state.selectedTasks.length > 0 && (
                  <TextArea
                    placeholder="Add some description to your tasks"
                    autosize={{ minRows: 2, maxRows: 6 }}
                    onChange={this.onDescriptionChange}
                  />
                )}
                {this.state.description.length > 0 && (
                  <Button
                    className="create"
                    type="primary"
                    // disabled={this.state.description.length > 0}
                    onClick={this.onDeploy}
                  >
                    Create smart contract
                  </Button>
                )}
              </div>
            )}
          </Col>
        </Row>
        <Divider className="no-margin" />
      </div>
    );
  }
}
