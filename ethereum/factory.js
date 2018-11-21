import web3 from './web3';
import TaskFactory from './build/TaskCreator.json';

const instance = new web3.eth.Contract(
  JSON.parse(TaskFactory.interface),
  '0x21496a2738ee4fbcfe7a0f7447a189433f621e9d'
);

export default instance;
