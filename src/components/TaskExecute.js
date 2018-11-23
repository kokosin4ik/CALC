import React from "react";
import "./TaskExecute.css";
import { Alert, Button, Icon } from "antd";
import openSocket from "socket.io-client";
import { Steps } from "antd";
import getTask from "../../ethereum/Task";
import web3 from "../../ethereum/web3";

const Step = Steps.Step;

const STATUSES = ["DOWNLOAD", "EXECUTE", "COMPLETE"];

const socket = openSocket("http://localhost:3000");

export default class TaskExecute extends React.Component {
  constructor(props) {
    super(props);
    // debugger
    this.state = {
      taskAddress: undefined,
      loading: false,
      status: undefined,
      current: undefined,
      userTask: undefined,
      result: undefined,
      submitting: false,
      finished: false
    };
    this.startTask = this.startTask.bind(this);
    this.submitResult = this.submitResult.bind(this);
  }
  componentWillMount() {
    this.setState({
      taskAddress: this.props.match.params.id
    })
  }

  async submitResult() {
    const accounts = await web3.eth.getAccounts();
    this.setState({
      submitting: true
    });
    let taskContract = await getTask(this.state.taskAddress);
    // debugger;
    let { result } = this.state;
    await taskContract.methods.putRes(result).send({
      from: accounts[0]
    });
    let step = this.state.current + 1
    this.setState({
      finished: true,
      current: step,
      submitting: false
    });
  }

  async startTask() {
    this.setState({
      loading: true,
      current: 0
    });
    const accounts = await web3.eth.getAccounts();
    let taskContract = await getTask(this.state.taskAddress);
    let avai = await taskContract.methods.getAvailableTasks().call();
    let userTask = await taskContract.methods.getUserTask().call({
      from: accounts[0]
    });

    socket.on("execStatus", data => {
      console.log(data);
      this.setState({
        current: STATUSES.indexOf(data.status),
        result: data.result
      });
      if (data.status === "COMPLETE") {
        socket.emit("end");
        console.log("END")
        this.setState({
          loading: false
        });
      }
    });
    socket.emit("executeTask", userTask);
  }

  render() {
    let {
      taskAddress,
      loading,
      current,
      result,
      submitting,
      finished
    } = this.state;
    return (
      <div className="task-execution">
        <Alert
          message="Hoooraay"
          description={`You have been successfully registered for the task ${taskAddress}`}
          type="success"
          showIcon
        />
        <div className="center-button">
          <Button
            className="start"
            type="primary"
            icon="play-circle"
            size="large"
            loading={this.state.loading}
            onClick={this.startTask}
          >
            {!loading && "Start task execution"}
            {loading && "Executing Task"}
          </Button>
        </div>
        {/*<div className="center-button">*/}
          {current >= 0 && (
            <Steps  current={this.state.current}>
              <Step
                title="Downloading your task"
                description="Binaries will saved into your file system"
              />
              <Step
                title="Executing your task"
                description="Binary is executing on your machine. Don't turn off your computer."
              />
              <Step
                title="Submitting results"
                description="Submit your result into smart-contract"
              />
              {/*<Step*/}
                {/*className="hidden"*/}
                {/*title="Submitting results"*/}
                {/*description="Submit your result into smart-contract"*/}
              {/*/>*/}
            </Steps>
          )}
        {/*</div>*/}
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
                {!submitting && "Submit your result"}
                {submitting && "Submiting"}
              </Button>
            )}
        </div>
        {finished && (
          <Alert
            message="You are incredible!"
            description={`Thank you. Now wait while other people will complete their tasks. And then you should check them and they should check you!`}
            type="success"
            showIcon
          />
        )}
      </div>
    );
  }
}
