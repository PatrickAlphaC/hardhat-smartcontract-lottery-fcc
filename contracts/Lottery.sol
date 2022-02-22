// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "hardhat/console.sol";

contract Raffle is Ownable, VRFConsumerBaseV2, KeeperCompatibleInterface {
  // Chainlink VRF Variables
  VRFCoordinatorV2Interface private immutable vrfCoordinator;
  uint64 private immutable subscriptionId;
  address private immutable vrfCoordinator;
  bytes32 private immutable gasLane;
  uint32 private immutable callbackGasLimit;
  uint16 private constant REQUEST_CONFIRMATIONS = 3;
  uint32 private constant NUM_WORDS = 1;
  // Lottery Variables
  uint256 public immutable interval;
  uint256 public s_lastTimeStamp;
  address public s_recentWinner;
  address payable[] public s_players;
  RaffleState public s_raffleState;
  enum RaffleState {
    OPEN,
    CALCULATING
  }

  event requestedRaffleWinner(bytes32 indexed requestId);
  event enteredRaffle(address indexed player);
  event winnerPicked(address indexed player);

  constructor(
    address _vrfCoordinator,
    uint64 _subscriptionId,
    bytes32 _gasLane, // keyHash
    uint256 _interval,
    uint256 entranceFee
  ) VRFConsumerBaseV2(_vrfCoordinator) {
    vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
    gasLane = _gasLane;
    interval = _interval;
    subscriptionId = _subscriptionId;
    s_entranceFee = entranceFee;
    s_raffleState = raffleState.OPEN;
    s_lastTimeStamp = block.timestamp;
  }

  function enterRaffle() public payable {
    require(msg.value >= s_entranceFee, "Not enough value sent to enter raffle");
    require(s_raffleState == raffleState.OPEN, "Raffle is not open");
    s_players.push(payable(msg.sender));
    emit enteredRaffle(msg.sender);
  }

  // receive() external payable {}

  /**
   * @dev This is the function that the Chainlink Keeper nodes call
   * they look for `upkeepNeeded` to return True
   * the following should be true for this to return true:
   * 1. The time interval has passed between raffle runs
   * 2. The lottery is open
   * 3. The contract has ETH
   */
  function checkUpkeep(
    bytes memory /* checkData */
  )
    public
    view
    override
    returns (
      bool upkeepNeeded,
      bytes memory /* performData */
    )
  {
    bool isOpen = RaffleState.OPEN == s_raffleState;
    bool timePassed = ((block.timestamp - s_lastTimeStamp) > s_interval);
    upkeepNeeded = (timePassed && isOpen && (address(this).balance >= 0));
  }

  /**
   * @dev Once `checkUpkeep` is returning `true`, this function is called
   * and it kicks off a Chainlink VRF call to get a random winner
   */
  function performUpkeep(
    bytes calldata /* performData */
  ) external override {
    require(address(this).balance >= 0, "Not enough ETH");
    (bool upkeepNeeded, ) = checkUpkeep("");
    require(upkeepNeeded, "Upkeep not needed");
    s_lastTimeStamp = block.timestamp;
    s_raffleState = raffleState.CALCULATING;
    bytes32 requestId = vrfCoordinator.requestRandomWords(
      gasLane,
      subscriptionId,
      REQUEST_CONFIRMATIONS,
      callbackGasLimit,
      NUM_WORDS
    );
    emit requestedRaffleWinner(requestId);
  }

  /**
   * @dev This is the function that Chainlink VRF node calls to send the money to the random winner
   */
  function fulfillRandomWords(
    uint256, /* requestId */
    uint256[] memory randomWords
  ) {
    uint256 index = randomWords[0] % s_players.length;
    address payable recentWinner = s_players[index];
    s_recentWinner = recentWinner;
    s_players = new address payable[](0);
    (bool success, ) = recentWinner.call{value: address(this).balance}("");
    require(success, "Transfer failed");
    s_raffleState = raffleState.OPEN;
    emit winnerPicked(recentWinner);
  }
}
