pragma solidity ^0.4.25;
contract TaskCreator{
    
    address[] public tasks;
    Cryptos currency;
    
    constructor (address _currency_address) public{
        currency = Cryptos(_currency_address);
    }
    
    function createTask(string description) public{
        address newTask = new Task(msg.sender, description, currency);
        tasks.push(newTask);
    }
}

contract Task{
    address public owner;
    string[] public ipfsEncryptHashes;
    string[] public ipfsDecryptHashes;
    string description;
    uint balance;
    uint money_per_task;
    
    Cryptos currency;
    enum State{Creating, Running, Ended, Canceled}
    State public TaskState;
    
    
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    constructor(address _owner, string _description, Cryptos _currency) public{
       owner = _owner;
       description = _description;
       TaskState = State.Creating;
       currency = _currency;
    }
    

    function putTask(string encryptHash, string decryptHash) public onlyOwner returns(bool){
        require(TaskState == State.Creating);
        ipfsEncryptHashes.push(encryptHash);
        ipfsDecryptHashes.push(decryptHash);
        return true;
    }
    
    function putMoney(uint money) public onlyOwner returns(bool){
        require(msg.sender == owner);
        require(TaskState == State.Creating);
        require(currency.allowance(msg.sender, address(this)) >= money);
        balance = money;
        money_per_task = balance / ipfsDecryptHashes.length;
        currency.transferFrom(msg.sender, address(this), money);
        TaskState = State.Running;
        return true;
    }
    
    function updMoney(uint money)public onlyOwner returns(bool){
        require(currency.allowance(msg.sender, address(this)) >= money);
        balance += money;
        money_per_task = balance / ipfsDecryptHashes.length;
        return true;
    }
    
}



// ----------------------------------------------------------------------------
// ERC Token Standard #20 Interface
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20-token-standard.md
// ----------------------------------------------------------------------------
contract ERC20Interface {
    function totalSupply() public constant returns (uint);
    function balanceOf(address tokenOwner) public constant returns (uint balance);
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);

    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}

contract Cryptos is ERC20Interface{
    string public name = "Cryptos";
    string public symbol = "CRPT";
    uint public decimals = 0;
    
    uint public supply;
    address public founder;
    
    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowed;
    
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);

    constructor() public{
        supply = 1000000;
        founder = msg.sender;
        balances[founder] = supply;
    } 
    
    function totalSupply() public view returns (uint){
        return supply;
    }
     
    function balanceOf(address tokenOwner) public view returns (uint balance){
        return balances[tokenOwner];
    }
    
    function transfer(address to, uint tokens) public returns (bool success){
        require(balances[msg.sender] >= tokens && tokens > 0);
        balances[to] += tokens;
        balances[msg.sender] -= tokens;
        emit Transfer(msg.sender, to, tokens);
        return true;
    }
    
    function allowance(address tokenOwner, address spender) view public returns(uint balance){
        return allowed[tokenOwner][spender];
    }
    
    function approve(address spender, uint tokens) public returns(bool){
        require(balances[msg.sender] >= tokens);
        require(tokens > 0);
        
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }
    
    function transferFrom(address from, address to, uint tokens) public returns (bool success){
        require(allowed[from][to] >= tokens);
        require(balances[from] >= tokens);
        
        balances[from] -= tokens;
        balances[to] += tokens;
        
        allowed[from][to] -= tokens;
        return true; 
    }


}

contract ICO is Cryptos{
    address public admin;
    address public deposit;
    
    uint tokenPrice = 0.001 ether;
    uint public hardCap = 300 ether;
    
    uint public raisedAmount;
    uint public saleStart = now;
    uint public saleEnd = now + 604800;
    uint public coinTradeStart = saleEnd + 604800;
    
    uint public maxInvestment = 5 ether;
    uint minInestment = 0.01 ether;
    
    enum State{beforeStart, running, afterEnd, halted}
    State public icoState;
    
    event Invest(address investor, uint value, uint tokens);
    modifier onlyAdmin(){
        require(msg.sender == admin);
        _;
    }
    
    constructor(address _deposit) public{
        deposit = _deposit;
        admin = msg.sender;
        icoState = State.beforeStart;
    }   
    
    function halt() public onlyAdmin{
        icoState = State.halted;
    }
    
    function unhalt() public onlyAdmin{
        icoState = State.running;
    }
    
    function getCurrentState() public view returns(State){
        if(icoState == State.halted){
            return State.halted;
        }else if(block.timestamp < saleStart){
            return State.beforeStart;
        }else if(block.timestamp >= saleStart && block.timestamp <= saleEnd){
            return State.running;
        }else{
            return State.afterEnd;
        }
    }

    function changeDepositAddress(address newDeposit) public onlyAdmin{
        deposit = newDeposit;
    }
    
    function invest() payable public returns(bool){
        icoState = getCurrentState();
        require(icoState == State.running);
        require(msg.value >= minInestment && msg.value <= maxInvestment);
        
        uint tokens = msg.value / tokenPrice;
        require(raisedAmount + msg.value <= hardCap);
        raisedAmount += msg.value;
        balances[msg.sender] += tokens;
        balances[founder] -= tokens;
        deposit.transfer(msg.value);
        emit Invest(msg.sender, msg.value, tokens);
        return true;
    }
    
    function() payable public{
        invest() ;
    }
    
    function transfer(address to, uint value) public returns(bool){
        require(block.timestamp  > coinTradeStart);
        super.transfer(to, value);
    }
    
    function transferFrom(address _from, address _to, uint _value) public returns(bool){
        require(block.timestamp > coinTradeStart);
        super.transferFrom(_from, _to, _value);
    }
    
    function burn() public returns(bool){
        icoState = getCurrentState();
        require(icoState == State.afterEnd);
        balances[founder] = 0;
    }
    
}
