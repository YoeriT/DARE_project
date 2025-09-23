

contract Crowdfunding {	
    address public owner; // the beneficiary address	
    uint256 public deadline; // campaign deadline in number of days
    uint256 public goal; // funding goal in ether
    mapping (address => uint256) public backers; // the share of each backer

    event Fund(address indexed donator, uint256 amount);

    constructor(uint256 numberOfDays, uint256 _goal) {	
        owner = msg.sender;	
        deadline = block.timestamp + (numberOfDays * 1 days);	
        goal = _goal;
    }	

    function donate() public payable {	
        require(block.timestamp < deadline); // before the fundraising deadline
        backers[msg.sender] += msg.value;
        emit Fund(msg.sender, msg.value);
    }

    function claimFunds() public {	
        require(address(this).balance >= goal); // funding goal met
        require(block.timestamp >= deadline); // after the withdrawal period
        require(msg.sender == owner);
        payable(msg.sender).transfer(address(this).balance);	
    }

    function getRefund() public {	
        require(address(this).balance < goal); // campaign failed: goal not met
        require(block.timestamp >= deadline); // in the withdrawal period
        uint256 donation = backers[msg.sender];	
        backers[msg.sender] = 0;	
        payable(msg.sender).transfer(donation);
    }	

}   