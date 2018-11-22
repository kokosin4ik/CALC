import React from "react";
import { Row, Col } from 'antd';
import { Button } from  'antd';
import './controll.css';
import { Input } from 'antd';
const { TextArea } = Input;


class Controll extends React.Component {
  
  constructor(props) {
    super(props);
  }
  
  render() {
    return <div>
      <Row gutter={16} type="flex" justify="end" className="row">
        <Col span={8}>
          {this.props.ariaVisible > 0 &&
          <TextArea
            placeholder="Add some description to your tasks"
            autosize={{ minRows: 1 }}
            onChange={this.props.onDescriptionChange}/>}
        </Col>
        <Col span={4} className='buttons-on-right'>
          <Button type="primary" onClick={this.props.onRunScriptClick}>
            Run script
          </Button>
        </Col>
        <Col span={4} className='buttons-on-right'>
          <Button type="primary" disabled={!this.props.deployHashes} onClick={this.props.onDeploy}>
            Create smart contract
          </Button>
        </Col>
      </Row>
    </div>
  }
}
export default Controll

