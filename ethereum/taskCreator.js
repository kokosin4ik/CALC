import web3 from './web3';
import TaskFactory from './build/TaskCreator.json';

const instance = new web3.eth.Contract(
  JSON.parse(TaskFactory.interface),
  '0x4493f102142894c330957777d6515e3c18ae524a'
);

export default instance;
