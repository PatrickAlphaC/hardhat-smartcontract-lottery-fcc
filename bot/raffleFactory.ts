const factorycontract={
  "address": "0x188bf9Aaa77835104e8Ce9FBd5DDDb016d032b62",
  "abi": [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "vrfCoordinatorV2",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "link",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "interval",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "entranceFee",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "callbackGasLimit",
          "type": "uint32"
        }
      ],
      "name": "NewRaffle",
      "outputs": [
        {
          "internalType": "contract Raffle",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_index",
          "type": "uint256"
        }
      ],
      "name": "getRaffle",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getRafflelatest",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "lotteries",
      "outputs": [
        {
          "internalType": "contract Raffle",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }]
    }
  
  export default factorycontract;