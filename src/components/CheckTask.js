import React from "react";
import "./CheckTask.css";
import { Alert, Icon } from "antd";
import openSocket from "socket.io-client";
import { Steps } from "antd";
import getTask from "../../ethereum/Task";
import web3 from "../../ethereum/web3";
import { Row, Col, Input, Button } from "antd";

const Step = Steps.Step;

const STATUSES = ["DOWNLOAD", "EXECUTE", "COMPLETE"];

const socket = openSocket("http://localhost:3000");

export default class CheckTask extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      taskAddress: undefined,
      dataToCheck: undefined,
      canStartCheck: false,
      loading: false,

      status: undefined,
      current: undefined,
      userTask: undefined,
      result: undefined,
      submitting: false,
      finished: false
    };
    this.onInputChange = this.onInputChange.bind(this);
    this.getVerificationData = this.getVerificationData.bind(this);
    this.startChecking = this.startChecking.bind(this);
    this.submitResult = this.submitResult.bind(this);
  }

  onInputChange(e) {
    this.setState({
      taskAddress: e.target.value
    });
  }
  
  async startChecking() {
    this.setState({
      loading: true,
      current: 0
    });
    const accounts = await web3.eth.getAccounts();
    // let taskContract = await getTask(this.state.taskAddress);
    // let avai = await taskContract.methods.getAvailableTasks().call();
    // let userTask = await taskContract.methods.getUserTask().call({
    //   from: accounts[0]
    // });
  
    socket.on("checkStatus", data => {
      console.log(data);
      this.setState({
        current: STATUSES.indexOf(data.status),
        result: data.result
      });
      if (data.status === "COMPLETE") {
        socket.emit("end");
        console.log("END");
        this.setState({
          loading: false
        });
      }
    });
    socket.emit("checkTasks", this.state.dataToCheck);
  }

  async getVerificationData() {
    const accounts = await web3.eth.getAccounts();
    let taskContract = await getTask(this.state.taskAddress);
    let verifData = await taskContract.methods.getVerificationBin().call({
      from: accounts[0]
    });
    let hashes = [];
    let results = [];
    let dataToCheck = [];
    verifData.forEach((item, index) => {
      index % 2 === 0 ? hashes.push(item) : results.push(item);
    });
    hashes.forEach((hash, index) => {
      dataToCheck.push({
        hash,
        result: results[index]
      });
    });
    console.log(dataToCheck);
    this.setState({
      dataToCheck,
      canStartCheck: true
    });
    console.log(dataToCheck)
  }
  
  async submitResult() {
    const accounts = await web3.eth.getAccounts();
    let { result } = this.state;
    this.setState({
      submitting: true
    });
    var hashes = result.map(item => item.hash);
    var results = result.map(item => item.result);
    
    let taskContract = await getTask(this.state.taskAddress);
    // debugger;
    // let { result } = this.state;
    debugger
    await taskContract.methods.tellVerification(hashes, results).send({
      from: accounts[0]
    });
    let step = this.state.current + 1;
    this.setState({
      finished: true,
      current: step,
      submitting: false
    });
  }

  render() {
    let { canStartCheck, current, loading, result, finished, submitting } = this.state;
    return (
      <div className="check-window">
        <div className="task-input">
          <Row>
            <Col span={18}>
              <Input
                placeholder="Type task adress of task's smart contract here"
                onChange={this.onInputChange}
              />
            </Col>
            <Col span={6} className='button-right'>
              <Button type="primary" onClick={this.getVerificationData}>
                Get verification info
              </Button>
            </Col>
          </Row>
        </div>
        <div className="center-button">
          {canStartCheck && (
            <Button
              className="start"
              type="primary"
              icon="play-circle"
              size="large"
              loading={this.state.loading}
              onClick={this.startChecking}
            >
              {!loading && "Start checking other participants"}
              {loading && "Executing check"}
            </Button>
          )}
        </div>
        {/*<div className="center-button">*/}
        {current >= 0 && (
          <Steps current={current}>
            <Step
              title="Downloading binaries for check"
              description="Binaries will saved into your file system"
            />
            <Step
              title="Executing your binaries"
              description="Binary is executing on your machine. Don't turn off your computer."
            />
            <Step
              title="Submitting results of your check"
              description="Submit your result into smart-contract"
            />
          </Steps>
        )}
        <div className="center-button">
          {!finished &&
          result && (
            <Button
              className="submit"
              type="primary"
              icon="check"
              size="large"
              loading={this.state.submitting}
              onClick={this.submitResult}
            >
              {!submitting && "Submit results"}
              {submitting && "Submiting"}
            </Button>
          )}
        </div>
        {finished && (
          <Alert
            message="You are incredible!"
            description={`Thank you. Wait your CALC.`}
            type="success"
            showIcon
          />
        )}
      </div>
    );
  }
}
