import React from "react";
import "./TasksView.css";
import taskCreator from "../../ethereum/taskCreator";
import CALC from "../../ethereum/CALC";
import getTask from "../../ethereum/Task";
import web3 from "../../ethereum/web3";
import { Spin } from "antd";
// import { Button } from "antd";
import { List, Avatar, Button, Input, message, Modal} from "antd";
// import { Modal } from "antd/lib/index";
// import { message } from "antd/lib/index";
const success = Modal.success;

/*
task: {
address: '0x24124qwfasf3f',
CALCperTask: 4,
availableTasks: 2
allTasks: 3,

}
 */
let ValueToDonate= 4;

const successMSG = (msg) => {
  message.success(msg);
};

function showConfirm(onOkFunc) {
  success({
    title: 'You must allow the contract to fine you. And then you can register for task.',
    content: <div>
      Now you should donate to it.
      <div style={{ marginTop: 16 }}>
        <Input disabled={true} addonAfter={"CALC"} defaultValue={ValueToDonate}/>
      </div>
    
    </div>,
    onOk() {
      return onOkFunc()
    },
    onCancel() {},
  });
}

export default class TasksView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: []
    };
  }

  async componentWillMount() {
    const accounts = await web3.eth.getAccounts();
    let tasksAdresses = await taskCreator.methods.getTasks().call();
    // tasksAdresses = tasksAdresses.slice(0, 4);
    let tasks = await this.getData(tasksAdresses);
    this.setState({ tasks });
    // debugger;
  }

  async getData(tasksAdresses) {
    let moneyPerTasks = [];
    let descriptions = [];
    let available = [];
    let total = [];
    var i = 0;
    for (; i < tasksAdresses.length; i++) {
      let taskContract = await getTask(tasksAdresses[i]);
      let money = await taskContract.methods.getTaskBalance().call();
      moneyPerTasks.push(money);
      let description = await taskContract.methods.getDescription().call();
      descriptions.push(description);
      available.push(await taskContract.methods.getAvailableTasks().call());
      total.push(await taskContract.methods.getTotalTasks().call());
    }
    let tasks = [];
    tasksAdresses.forEach((address, i) => {
      tasks.push({
        address,
        description: descriptions[i],
        moneyPerTask: moneyPerTasks[i],
        availableTasks: available[i],
        totalTasks: total[i]
      });
    });
    return tasks;
  }

  async register(task) {
    console.log(task);
    const accounts = await web3.eth.getAccounts();
    let taskAddress = task.address;
    let taskContract = await getTask(taskAddress);
    ValueToDonate = task.moneyPerTask;
    showConfirm(async () => {
      debugger
      let a = ValueToDonate;
      await CALC.methods.approve(taskAddress, ValueToDonate).send({
        from: accounts[0]
      });
      // let taskContract = await getTask(taskAddress);
      await taskContract.methods.register().send({
        from: accounts[0]
      });
      successMSG('You have been successfully registered for this task.')
    });
  }

  render() {
    let { tasks } = this.state;

    return (
      <div>
        {tasks.length === 0 && (
          <div className="loading-tasks">
            <Spin className="spinner" size="large" />
          </div>
        )}
        {tasks.length > 0 && (
          <List
            className="demo-loadmore-list"
            // loading={initLoading}
            itemLayout="horizontal"
            // loadMore={loadMore}
            dataSource={tasks}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    onClick={() => {
                      this.register(item);
                    }}
                  >
                    Register
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                  }
                  title={
                    <a
                      href={`https://rinkeby.etherscan.io/address/${
                        item.address
                      }`}
                      target="_blank"
                    >
                      {item.address}
                    </a>
                  }
                  description={item.description}
                />
                <div>
                  Available tasks: {item.availableTasks} out of{" "}
                  {item.totalTasks}. Money per task: {item.moneyPerTask}
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    );
  }
}
