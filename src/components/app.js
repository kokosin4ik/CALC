
import React from "react";
import { Layout } from "antd";
import "./app.css";
import { Switch, Route } from 'react-router-dom';
import HeaderMenu from './HeaderMenu';
import MainView from './MainView';
import TasksView from './TasksView';
import MapView from './MapView';
import TaskExecution from './TaskExecute'
import CheckTask from "./CheckTask";



// const { SubMenu } = Menu;
const { Footer } = Layout;
// const { Link } = ReactRouterDOM;

export default class App extends React.Component {
  render() {
    return (
      <div style={{height: 'auto'}}>
        <Layout style={{height: 'auto'}}>
          <HeaderMenu />
          <Switch>
            <Route exact path='/' component={MainView}/>
            <Route path='/map' component={MapView}/>
            <Route path='/tasks' component={TasksView}/>
            <Route path='/taskExecution/:id' component={TaskExecution}/>
            <Route path='/checkTask' component={CheckTask}/>
          </Switch>
        </Layout>
      </div>
    );
  }
}
