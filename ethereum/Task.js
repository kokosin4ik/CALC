import web3 from './web3';
import Task from './build/Task.json';

export default address => {
  return new web3.eth.Contract(JSON.parse(Task.interface), address);
};
