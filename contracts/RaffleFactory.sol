// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "./Raffle.sol";
contract RaffleFactory{
address immutable owner;
    constructor()    {
        owner = msg.sender;
    }
    Raffle[] public lotteries;
    // event ContractCreated(uint256 index);
    function NewRaffle(address vrfCoordinatorV2,
    address link,
        uint256 interval,
        uint256 entranceFee,
        uint32 callbackGasLimit)public returns(Raffle){
        address deployer = msg.sender;
        Raffle newRaffle = new Raffle(vrfCoordinatorV2, link, interval, entranceFee, callbackGasLimit, owner,deployer);
        lotteries.push(newRaffle);
        
        // emit ContractCreated(index);
        return newRaffle;
    }
    function getRaffle(uint256 _index) public view returns(address){
        return(address(lotteries[_index]));
    }
    function getRafflelatest() public view returns(address){
        return(address(lotteries[lotteries.length -1]));
    }

}