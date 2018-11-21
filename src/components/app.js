
import React from "react";
import { Layout, Menu, Breadcrumb, Icon } from "antd";
import "./app.css";
import { Switch, Route } from 'react-router-dom';
import HeaderMenu from './HeaderMenu';
import MainView from './MainView';
import MapView from './MapView';



// const { SubMenu } = Menu;
const { Footer } = Layout;
// const { Link } = ReactRouterDOM;

export default class App extends React.Component {
  render() {
    return (
      <div style={{height: '100%'}}>
        <Layout style={{height: '100%'}}>
          <HeaderMenu />
          <Switch>
            <Route exact path='/' component={MainView}/>
            <Route path='/map' component={MapView}/>
          </Switch>
        </Layout>
      </div>
    );
  }
}
