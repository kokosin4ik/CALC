pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

contract TaskCreator{
    address[] public tasks;
    Calc currency;
    
    function getTasks()public view returns(address[]){
        return tasks;
    }
    
    mapping(address => address) userTasks; 
    
    constructor (address _currency_address) public{
        
        currency = Calc(_currency_address);
    }
    
    function lastCreatedTask() public view returns(address){
        return userTasks[msg.sender];
    }
    
    function createTask(string description, string[] encryptHashes, string[] decryptHashes) public returns(address){
        address newTask = new Task(msg.sender, description, currency, encryptHashes, decryptHashes);
        tasks.push(newTask);
        userTasks[msg.sender] = newTask;
        return newTask;
    }
}

contract Task{
    address public owner;
    string description;
    uint balance;
    uint money_per_task;


    struct Results{
        string[] succesHashes;
        string[] values;
        uint totalSuccess;
    }
   
    struct Tasks{
        string[] ipfsEncryptHashes;
        string[] ipfsDecryptHashes;
        uint curPos;
        uint totalTasks;
        uint doneTasks;
        address[] executors;
        uint verifyers;
    }
    Tasks public tasks;
    Results public resultToSend;

    event AllDoneEvent(address);
    event FinishVerifaction(address);
    //Mapings where  calculations calculators and reults are put
    mapping(address => string) calculations;
    mapping(address => uint) calculators_position;
    mapping(address => string) results;
    mapping(string => uint) countSuccess;
    mapping(address => bool) isChecker;
    //our coin for more flexiability
    Calc currency;
    //statte of a cocontract
    enum State{Creating, Running, AllDone, Checking, Ended}
    State public TaskState;

    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    function getLAstResult()public view  onlyOwner returns(Results) {
        require(TaskState == State.Ended);
        return resultToSend;

    }
    function getTaskBalance() public view returns(uint){
        return money_per_task;
    }

    function getBalance() public view returns(uint){
        return balance;
    }

    function getAvailableTasks() public view returns(uint){
        return tasks.totalTasks - tasks.curPos;
    }

    function getTotalTasks()public view returns(uint){
        return tasks.totalTasks;
    }

    function getDescription() public view returns(string){
        return description;
    }

    function getOwner() public view returns(address){
        return owner;
    }

    function IsChecker()public view returns(bool){
        return isChecker[msg.sender];
    }

    modifier if_not_get_task(){
        bytes memory validString = bytes(calculations[msg.sender]);
        require(validString.length == 0);
        _;
    }

    modifier if_put_res(){
        bytes memory validString = bytes(calculations[msg.sender]);
        require(validString.length != 0);
        bytes memory valid = bytes(results[msg.sender]);
        require(valid.length == 0);
        _;
    }

    constructor(address _owner, string _description, Calc _currency, string[] _encryptHashes, string[] _decryptHashes) public{
        owner = _owner;
        description = _description;
        TaskState = State.Creating;
        currency = _currency;
        tasks.ipfsEncryptHashes = _encryptHashes;
        tasks.ipfsDecryptHashes = _decryptHashes;
        tasks.totalTasks = _encryptHashes.length;
        tasks.curPos = 0;
        tasks.doneTasks = 0;
    }

    function putMoney(uint money) public onlyOwner returns(bool){
        require(TaskState == State.Creating);
        require(currency.allowance(msg.sender, address(this)) >= money);
        balance = money;
        money_per_task = balance / tasks.totalTasks;
        currency.transferFrom(msg.sender, address(this), money);
        TaskState = State.Running;
        return true;
    }

    function updMoney(uint money)public onlyOwner returns(bool){
        require(TaskState == State.Running);
        require(currency.allowance(msg.sender, address(this)) >= money);
        balance += money;
        money_per_task = balance / tasks.totalTasks;
        return true;
    }


    function getUserTask() public view returns(string){
        return calculations[msg.sender];
    }

    function register() public if_not_get_task returns(bool){
        require(TaskState == State.Running);
        require(currency.allowance(msg.sender, address(this)) >= money_per_task);
        require(tasks.curPos < tasks.totalTasks);
        string memory hash;
        if(tasks.curPos < tasks.totalTasks){
            hash = tasks.ipfsEncryptHashes[tasks.curPos];
            calculations[msg.sender] = hash;
            calculators_position[msg.sender] = tasks.curPos;
            tasks.executors.push(msg.sender);
            tasks.curPos += 1;
            isChecker[msg.sender] = true;
            tasks.verifyers += 1;
            return true;
        }else{
            return false;
        }
    }

    function putRes(string res) public if_put_res returns(bool){
        results[msg.sender] = res;
        tasks.doneTasks += 1;
        if (tasks.doneTasks == tasks.totalTasks){
            TaskState = State.Checking;
            emit AllDoneEvent(address(this));
        }
        return true;
    }

    function returnMoney()onlyOwner public returns(bool){
        if (balance > 0){
            currency.transfer(owner, balance);
        }
        uint i = 0;
        uint transfer = 0;
        for(i = 0; i < tasks.totalTasks; i++){
            transfer = currency.allowance(tasks.executors[i],address(this));
            if(transfer > 0){
                currency.resetApprove(tasks.executors[i], transfer);
            }
        }
        return true;
    }


    function finishTasks() private{
        require(TaskState == State.Checking);
        uint min_correct_checks = (tasks.totalTasks - 1) / 2;
        uint sucess_tasks = tasks.totalTasks;
        uint i = 0;
        for(i = 0; i < tasks.totalTasks; i++){
            if(countSuccess[tasks.ipfsEncryptHashes[i]]<= min_correct_checks){
                currency.transferFrom(tasks.executors[i], address(this), money_per_task);
                currency.transfer(owner, money_per_task);
                sucess_tasks -= 1;
            }else{
                // currency.resetApprove(tasks.executors[i], money_per_task);
            }
        } 
        
     
        money_per_task = balance / sucess_tasks;
       
        for(i = 0; i < tasks.totalTasks; i++){
            if(countSuccess[tasks.ipfsEncryptHashes[i]] >  min_correct_checks){
                currency.transfer(tasks.executors[i], money_per_task);
                resultToSend.succesHashes.push(tasks.ipfsEncryptHashes[i]);
                resultToSend.values.push(results[tasks.executors[i]]);
                resultToSend.totalSuccess += 1;
                balance -= money_per_task;
                
            }
        }
        emit FinishVerifaction(owner);
        TaskState = State.Ended;
    }
    
    function tellVerification(string[] hashes ,uint[] result) public returns(bool){
        require(isChecker[msg.sender] == true);
        for(uint i = 0; i < hashes.length; i++){
            countSuccess[hashes[i]] += result[i];
        }
        isChecker[msg.sender] = false;
        tasks.verifyers -= 1;
        if(tasks.verifyers == 0)
            finishTasks();
        return true;
    }

    function getVerificationBin() public view returns(string[]){
        uint i = 0;
        uint j = 0;
        string[] memory hashes_to_verify = new string[](2*(tasks.totalTasks - 1));
        for(i = 0; i < tasks.totalTasks; i++){
            if(i != calculators_position[msg.sender]){
                hashes_to_verify[j] = tasks.ipfsDecryptHashes[i];
                hashes_to_verify[j + 1] = results[tasks.executors[i]];
                j += 2;
            }
        }
        return hashes_to_verify;
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

contract Calc is ERC20Interface{
    string public name = "Calc";
    string public symbol = "CALC";
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
    
    function resetApprove(address spender, uint tokens)public returns(bool){
        require(allowed[spender][msg.sender] >= tokens);
        allowed[spender][msg.sender] -= tokens;
        return true;
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

contract ICO is Calc{
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
