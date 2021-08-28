pragma solidity ^0.5.0;

import "./Token.sol";

contract SwapThang {
    string public name = "SwapThang - Send, Withdraw, And Purchase";
    Token public token;
    uint public rate = 1 * 10**6; //1 Eth to 1M PANGO Tokens

    constructor(Token _token) public {
        token = _token;
    }

    //events
    event TokensBought(
        address indexed act,
        address indexed token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address indexed act,
        address indexed token,
        uint amount,
        uint rate
    );

    //functions
    function buy() public payable {
        //calulate the amount to purchase
        uint amount = msg.value * rate;
        //make sure this contract has enough tokens to send them
        require(token.balanceOf(address(this)) >= amount);
        //transfer the tokens 
        token.transfer(msg.sender, amount);
        //send an event
        emit TokensBought(msg.sender, address(token), amount, rate);
    }

    function sell(uint _amount) public {
        //can they send us that amount
        require(token.balanceOf(msg.sender) >= _amount);
        //calulate the amount of eth to send
        uint ethAmount = _amount / rate;
        //make sure this contract has enough eth to send
        require(address(this).balance >= ethAmount);
        //move tokens from account to this contract
        token.transferFrom(msg.sender, address(this), _amount);
        // address addr = msg.sender;
        // address payable wallet = address(uint160(addr));
        //send the sender eth
        msg.sender.transfer(ethAmount);
        //send an event
        emit TokensSold(msg.sender, address(token), _amount, rate);
    }
}