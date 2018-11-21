import React from "react";
import { css } from "react-emotion";
// First way to import
import { HashLoader } from "react-spinners";
import './actionWindow.css'
// Another way to import
// import ClipLoader from "react-spinners/ClipLoader";

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

class ActionWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }
  render() {
    return (
      <div className='actions-content'>
        <h1 className='title'>Running run.sh script</h1>
        <div className='under-title'>
          <div className="sweet-loading">
            <HashLoader
              className={override}
              sizeUnit={"px"}
              size={250}
              color={"60ABFF"}
              loading={this.state.loading}
            />
          </div>
        </div>
        
      </div>
      
    );
  }
}

export  default ActionWindow
