import web3 from './web3';
import Calc from './build/Calc.json';

const instance = new web3.eth.Contract(
  JSON.parse(Calc.interface),
  '0x859c9f79ca1519907f886eb1e27f254ac26db206'
);

export default instance;
