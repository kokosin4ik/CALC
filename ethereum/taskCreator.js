import web3 from './web3';
import TaskFactory from './build/TaskCreator.json';

const instance = new web3.eth.Contract(
  JSON.parse(TaskFactory.interface),
  '0xcd776d4cd5c6e8d9c9dabffe6e45570b8b860d8d'
);

export default instance;
