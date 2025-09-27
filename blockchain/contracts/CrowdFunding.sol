// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Crowdfunding {
    address public owner; // the beneficiary address
    uint256 public deadline; // campaign deadline in number of days
    uint256 public goal; // funding goal in ether
    mapping(address => uint256) public backers; // the share of each backer
    uint256 public totalBackers; // total number of backers

    event Fund(address indexed donator, uint256 amount);
    event FundsClaimed(address indexed owner, uint256 amount);
    event RefundIssued(address indexed backer, uint256 amount);
    event CampaignCreated(
        address indexed owner,
        uint256 deadline,
        uint256 goal
    );

    constructor(uint256 numberOfDays, uint256 _goal) {
        owner = msg.sender;
        deadline = block.timestamp + (numberOfDays * 1 days);
        goal = _goal;
        emit CampaignCreated(owner, deadline, goal);
    }

    function donate() public payable {
        require(block.timestamp < deadline); // before the fundraising deadline
        backers[msg.sender] += msg.value;
        totalBackers += 1;
        emit Fund(msg.sender, msg.value);
    }

    function claimFunds() public {
        require(address(this).balance >= goal); // funding goal met
        require(block.timestamp >= deadline); // after the withdrawal period
        require(msg.sender == owner);
        payable(msg.sender).transfer(address(this).balance);
        emit FundsClaimed(msg.sender, address(this).balance);
    }

    function getRefund() public {
        require(address(this).balance < goal); // campaign failed: goal not met
        require(block.timestamp >= deadline); // in the withdrawal period
        uint256 donation = backers[msg.sender];
        backers[msg.sender] = 0;
        payable(msg.sender).transfer(donation);
        emit RefundIssued(msg.sender, donation);
    }
}
