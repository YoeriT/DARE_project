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
        require(block.timestamp < deadline, "campaign ended"); // before the fundraising deadline
        if (backers[msg.sender] == 0) {
            totalBackers += 1;
        }
        backers[msg.sender] += msg.value;
        emit Fund(msg.sender, msg.value);
    }

    function claimFunds() public {
        require(address(this).balance >= goal, "funding goal not met"); // funding goal met
        require(block.timestamp >= deadline, "deadline not passed"); // after the withdrawal period
        require(msg.sender == owner, "not the owner"); // only for the owner

        uint256 amount = address(this).balance;

        payable(msg.sender).transfer(amount);
        emit FundsClaimed(msg.sender, amount);
    }

    function getRefund() public {
        require(address(this).balance < goal, "goal was met"); // campaign failed: goal not met
        require(block.timestamp >= deadline, "deadline not passed"); // in the withdrawal period
        require(backers[msg.sender] > 0, "no funds to refund"); // only for backers

        uint256 donation = backers[msg.sender];
        backers[msg.sender] = 0;

        payable(msg.sender).transfer(donation);
        emit RefundIssued(msg.sender, donation);
    }
}
