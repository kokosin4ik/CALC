import React from "react";
import { Row, Col } from 'antd';
import { Button } from  'antd';
import './controll.css';



class Controll extends React.Component {
  
  constructor(props) {
    super(props);
  }
  
  render() {
    return <div>
      <Row gutter={16} type="flex" justify="end" className="row">
        <Col span={4} className='buttons-on-right'>
          <Button type="primary" onClick={this.props.onRunScriptClick}>
            Run script
          </Button>
        </Col>
        <Col span={4} className='buttons-on-right'>
          <Button type="primary" disabled={!this.props.deployHashes}>
            Create smart contract
          </Button>
        </Col>
      </Row>
    </div>
  }
}
export default Controll