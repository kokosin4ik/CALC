import React from "react";
import { Spin } from 'antd';
import { Skeleton } from 'antd';

import { Tree } from 'antd';
import axios from 'axios';
import './files.css';

const DirectoryTree = Tree.DirectoryTree;
const TreeNode = Tree.TreeNode;




class Files extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      data: undefined,
      loading: true
    };
  }
  
  componentDidMount() {
    axios.get(`http://localhost:8080/api/files`)
    .then(res => {
      const data = [{
        name: 'bin-generator',
        type: 'folder',
        children: res.data.message
      }];
      this.setState({ data, loading: false });
    })
  }
  
  onSelect(data) {
    console.log('Trigger Select');
  };
  
  onExpand(data) {
    console.log('Trigger Expand');
  };
  
  render() {
    
    let { loading, data } = this.state;
    
    if (loading) {
      return <div className='files'>
        <Skeleton active/>
        <Skeleton active/>
        <Skeleton active/>
      </div>
    }
    const loop = data => data.map((item) => {
      if (item.children && item.children.length) {
        return <TreeNode key={item.name} title={item.name}>{loop(item.children)}</TreeNode>;
      }
      return <TreeNode key={item.name} title={item.name} isLeaf/>;
    });
    return (
      <div className='files'>
        <DirectoryTree
    
          multiple
          defaultExpandAll
          onSelect={this.onSelect}
          onExpand={this.onExpand}
        >
          {loop(this.state.data)}
        </DirectoryTree>
      </div>
      
    );
  }
}
export default Files