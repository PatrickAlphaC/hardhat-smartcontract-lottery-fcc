// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol";
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";

import "hardhat/console.sol";

error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);
error Raffle__TransferFailed();
error Raffle__SendMoreToEnterRaffle();
error Raffle__RaffleNotOpen();

contract Raffle is ConfirmedOwner,VRFV2WrapperConsumerBase {
    /* Type declarations */
    enum RaffleState {
        OPEN,
        CALCULATING
    }
    /* State variables */
    // Chainlink VRF Variables
    // VRFV2WrapperInterface private immutable i_vrfCoordinator;
    // LinkTokenInterface private  immutable i_link;
    // uint64 private immutable i_subscriptionId;
    // bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // Lottery Variables
    uint256 private immutable i_interval;
    uint256 private s_lastTimeStamp;
    address private s_recentWinner;
    address public i_owner;
    address private immutable deployer;
    // modifier onlyOwner override  {
    //     require(msg.sender == owner);
    //     _;
    // }
    
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;
    RaffleState private s_raffleState;

    /* Events */
    event RequestedRaffleWinner(uint256 indexed requestId);
    event RaffleEnter(address indexed player);
    event WinnerPicked(address indexed player);

    /* Functions */
    constructor(
        address vrfCoordinatorV2,
        address linkAddress,
        // uint64 subscriptionId,
        // bytes32 gasLane, // keyHash
        uint256 interval,
        uint256 entranceFee,
        uint32 callbackGasLimit,
        address _owner,
        address _deployer
    ) VRFV2WrapperConsumerBase(linkAddress,vrfCoordinatorV2) ConfirmedOwner(_deployer) {
        // i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        // i_vrfCoordinator = VRFV2WrapperInterface(vrfCoordinatorV2);
        // i_link = LinkTokenInterface(linkAddress);
        // i_gasLane = gasLane;
        i_interval = interval;
        // i_subscriptionId = subscriptionId;
        i_entranceFee = entranceFee;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_callbackGasLimit = callbackGasLimit;
        i_owner = _owner;
        deployer = _deployer;
    }

    function enterRaffle() public payable {
        // require(msg.value >= i_entranceFee, "Not enough value sent");
        // // require(s_raffleState == RaffleState.OPEN, "Raffle is not open");
        if (msg.value < i_entranceFee) {
            revert Raffle__SendMoreToEnterRaffle();
        }
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__RaffleNotOpen();
        }
        s_players.push(payable(msg.sender));
        // Emit an event when we update a dynamic array or mapping
        // Named events with the function name reversed
        emit RaffleEnter(msg.sender);
    }

    /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * they look for `upkeepNeeded` to return True.
     * the following should be true for this to return true:
     * 1. The time interval has passed between raffle runs.
     * 2. The lottery is open.
     * 3. The contract has ETH.
     * 4. Implicity, your subscription is funded with LINK.
     */
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = RaffleState.OPEN == s_raffleState;
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers);
        return (upkeepNeeded, "0x0"); // can we comment this out?
    }

    /**
     * @dev Once `checkUpkeep` is returning `true`, this function is calledun
     * and it kicks off a Chainlink VRF call to get a random winner.
     */
    function performUpkeep(
        // bytes calldata /* performData */
    ) external onlyOwner {
        // (bool upkeepNeeded, ) = checkUpkeep("");
        // require(upkeepNeeded, "Upkeep not needed");
        // if (!upkeepNeeded) {
        //     revert Raffle__UpkeepNotNeeded(
        //         address(this).balance,
        //         s_players.length,
        //         uint256(s_raffleState)
        //     );
        // }
        s_raffleState = RaffleState.CALCULATING;
        // uint256 linkAmount = 0.25*(10**18);
        // LINK.approve(msg.sender, linkAmount);
        // LINK.transferFrom(msg.sender,address(this), linkAmount);
        // require(LINK.balanceOf(address(this))>linkAmount);
        uint256 requestId = requestRandomness(i_callbackGasLimit,REQUEST_CONFIRMATIONS,NUM_WORDS);
        //     i_callbackGasLimit,
        //     REQUEST_CONFIRMATIONS,
        //     NUM_WORDS
        // );
        // Quiz... is this redundant?
        emit RequestedRaffleWinner(requestId);
    }

    /**
     * @dev This is the function that Chainlink VRF node
     * calls to send the money to the random winner.
     */
    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        // s_players size 10
        // randomNumber 202
        // 202 % 10 ? what's doesn't divide evenly into 202?
        // 20 * 10 = 200
        // 2
        // 202 % 10 = 2
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        address payable m_owner = payable(i_owner);
        address payable i_deployer = payable(deployer);
        s_recentWinner = recentWinner;
        s_players = new address payable[](0);
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        uint256 commision = (address(this).balance)/20;
        // m_owner.transfer(commision);
        // bool success1 = m_owner.send(commision);
        // i_deployer.send(commision);
        (bool comm1, ) = m_owner.call{value: commision}("");
        (bool comm2, ) = i_deployer.call{value: commision}("");
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        // require(success, "Transfer failed");
        if (!success) {
            revert Raffle__TransferFailed();
        }
        emit WinnerPicked(recentWinner);
    }

    /** Getter Functions */

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }
    function withdrawLink() public onlyOwner {
        require(
            LINK.transfer(msg.sender, LINK.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}