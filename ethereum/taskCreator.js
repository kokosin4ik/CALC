import web3 from './web3';
import TaskFactory from './build/TaskCreator.json';

const instance = new web3.eth.Contract(
  JSON.parse(TaskFactory.interface),
  '0x7a3b405ff3b49f5e5c1aaab30a9801ea7486fd95'
);

export default instance;
