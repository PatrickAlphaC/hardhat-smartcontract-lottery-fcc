import expect from "chai";
import { ethers } from "hardhat";
describe("RaffleFactory", function () {
  let RaffleFactory, Raffle, factory, raffle, owner, addr1, addr2;
  let vrfCoordinator, linkToken, keyHash, fee,MockV3Aggregator,VRFV2Wrapper;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here
    RaffleFactory = await ethers.getContractFactory("RaffleFactory");
    Raffle = await ethers.getContractFactory("Raffle");
    [owner, addr1, addr2] = await ethers.getSigners();
    vrfCoordinator = await ethers.getContractFactory("VRFCoordinatorV2Mock")
    linkToken = await ethers.getContractFactory("LinkToken")
    MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator")
    VRFV2Wrapper = await ethers.getContractFactory("VRFV2Wrapper")
    // Set the VRF parameters
    vrfCoordinator =  await vrfCoordinator.deploy()
    MockV3Aggregator = await MockV3Aggregator.deploy()// Set the VRF Coordinator address
    linkToken = await linkToken.deploy() // Set the LINK token address
    // keyHash = // Set the keyHash
    VRFV2Wrapper = await VRFV2Wrapper.deploy()
    vrfCoordinator.setConfig()
    // fee =  // Set the fee
  })})
    // // Deploy the RaffleFactory
    // factory = await RaffleFactory.deploy(vrfCoordinator, linkToken, keyHash);
    // await factory.deployed();

    // // Deploy the Raffle using the deployRaffle function
    // await factory.deployRaffle();
    // const raffleAddress = await factory.raffle();
    // raffle = Raffle.attach(raffleAddress);

    // // Fund the raffle contract with LINK
    // await linkToken.transfer(raffle.address, fee);
//   });

//   it("Should call a function in the raffle contract", async function () {
//     // Call a function in the raffle contract
//     // await raffle.connect(addr1).doSomething();
    
//     // Test the result
//     expect(await raffle.somethingDone()).to.equal(true);
//   });

//   it("Should request randomness from Chainlink VRF", async function () {
//     // Request randomness from Chainlink VRF
//     const requestId = await raffle.getRandomNumber();
    
//     // Test the result
//     expect(requestId).to.not.be.undefined;
//   });
