import {Signer, Wallet, ethers} from 'ethers';
import TelegramBot from 'node-telegram-bot-api';
import "dotenv/config"
import contract from './Raffle';
import db from "./dbconnect"
import Users from './userschema';
import { formatEther, isAddress, parseEther } from 'ethers/lib/utils';
import vrfabi from './vrfcoordinatorabi';
import factorycontract from './rafflefactory';

const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/uuElKLHuOWKKmrQSC4gTISr5LHbpWrwl")
const token:any = process.env.BOTKEY
// console.log(lottery)
let chatId:number = 0
let wallet:Wallet;
function createRandomWallets(count: number): ethers.Wallet[] {
    const wallets:any = [];
    for (let i = 0; i < count; i++) {
        const wallet = ethers.Wallet.createRandom();
        wallets.push(wallet);
    }
    return wallets;
}

const bot = new TelegramBot(token,{polling:true})
bot.onText(/\/start/,async (msg:any)=>{
    console.log(msg)
    await db()
    chatId= msg.chat.id
    const userexist:any  =  await (Users.find({userid:msg.from.username}))
    // console.log(userexist)
    if (userexist.length >0){
        wallet = new ethers.Wallet((userexist[0].PrivateKey),provider)
    }else{
        wallet=(createRandomWallets(1))[0]
        const user = new Users({
            userid: msg.from.username,
            chatID: msg.chat.id,
            address:(wallet.address),
            PrivateKey: (wallet.privateKey)
        })
        await user.save()
    }
    let message = "Welcome to ETH raffle bot\n";
    // const signer:any = wallet.getSigner(wallet.address);
    
    const key = wallet.privateKey
    // const Factory = new ethers.Contract(factorycontract.address,factorycontract.abi,wallet);
    // const raffleEntranceFee=ethers.utils.parseEther("0.01") // 0.01 ETH
    // const newlottery = await Factory.NewRaffle("0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",4918,"0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c","30",raffleEntranceFee,"500000").then(async()=>{
    //     const contraddr = await Factory.getRafflelatest();
    //     console.log(contraddr)
    //     return contraddr
    // })
    const lottery = new ethers.Contract(contract.address,contract.abi,wallet);
    const vrfcoordinator = new ethers.Contract("0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",vrfabi,wallet)
//     // console.log(wallet[0].privateKey)
    const waladr = await wallet.address
message+=`Your wallet: ${await wallet.address}\n`
const state = await lottery.getRaffleState()
const balance  = formatEther(String(await provider.getBalance(waladr)))
// const entry  = parseEther((await lottery.getEntranceFee()).toString())
const entry  = 0.01
const interval  = await lottery.getInterval()
const totalplayers  = (await lottery.getNumberOfPlayers())
message+=`Your Balance: ${balance}\n`
message+=`Lottery is: ${state}\n`
message+=`Entry Fee: ${entry} ETH \n`
message+=`Interval: ${interval} \n`
message+=`Participants: ${totalplayers}\n`
const s= bot.sendMessage(chatId,message,{reply_markup:{
    inline_keyboard:[[{text:"Enter lottery",callback_data:"Enter"}],
    [{text:"View Private Key",callback_data:"Key"}],
    [{text:"Withdraw funds",callback_data:"withdraw"}],
]
}})
bot.onText(/\/pick/,async (msg)=>{
    const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
    console.log()
    const { upkeepNeeded } = await lottery.callStatic.checkUpkeep(checkData)
    if (upkeepNeeded) {
        const tx = await lottery.performUpkeep(checkData,{gasLimit: 5000000})
        const txReceipt = await tx.wait(1)
        const requestId = txReceipt.events![1].args!.requestId
        console.log(`Performed upkeep with RequestId: ${requestId}`)
        // const winner = await vrfcoordinator.fulfillRandomWords(requestId,contract.address,{gasLimit: 5000000})
        // console.log(winner)
        await lottery.on('WinnerPicked',async (msg)=>{
    bot.sendMessage(chatId,msg)
    })
    }
    else{
        console.log("No upkeep needed!")

    }
    // await lottery.on('RequestedRaffleWinner',async (msg)=>{
    //     console.log(msg)
    // })
    
    // const winner = await vrfcoordinator.fulfillRandomWords(contract.address)
})
bot.on("callback_query",async (callback)=>{
    const data = callback.data;
    // console.log(data)
    // let message = callback.message;
    let text = callback.message;
    let t:string =""
    if (data =="Enter"){

        if(Number(balance)>entry){
            let mid:number
            bot.sendMessage(chatId,"Please wait ...\n Your Txn is being processed\n").then((msg)=>{mid = msg.message_id})
            const entryy = await lottery.enterRaffle({ value: ethers.utils.parseEther('0.01') })
            
            await lottery.on('RaffleEnter', async () => {
                // Do something when the event is emitted
                // console.log(`RaffleEnter event emitted with sender: ${sender}`);
              try{
                //   await bot.deleteMessage(chatId,mid)
                  bot.sendMessage(chatId,`Your Entry is confirmed \n Txn hash: [${entryy.hash}](https://sepolia.etherscan.io/tx/${entryy.hash})`,{parse_mode:'Markdown',disable_web_page_preview:false})
            } finally{
                bot.sendMessage(chatId,`Your Entry is confirmed \n Txn hash: [${entryy.hash}](https://sepolia.etherscan.io/tx/${entryy.hash})`,{parse_mode:'Markdown',disable_web_page_preview:false})
            }
              });
            // console.log(entryy)
        }else{
            
            console.log("hi")
        }
    }
    switch(data){
        case "Key":
            bot.sendMessage(chatId,`Your Private key is : ${key}`)
            break;
            case "withdraw":
            console.log("hi")
            
            let mid:any
            let recieveraddr:any
            // const currntbalance = await provider.getBalance(wallet.address)
            const balance = await wallet.getBalance();
            bot.sendMessage(chatId,`Enter reciever address`,{reply_markup:{force_reply:true}}).then((msg)=>{mid=msg.message_id
                bot.onReplyToMessage(chatId,mid,async(msg)=>{
                    // console.log(msg.text)
                    if(msg.text !== undefined && isAddress(msg.text)){
                        recieveraddr = msg.text
                        const gasPrice = await provider.getGasPrice();

                        // Estimate the gas cost of the transaction
                        const gasLimit = await provider.estimateGas({
                          to: recieveraddr,
                          value: 0,
                        });
                        const gasCost = gasPrice.mul(gasLimit);
                        
                        // Get the balance of the wallet
                        
                        // Calculate the maximum amount that can be transferred
                        const maxAmount = balance.sub(gasCost);
                        
                        // Create and send the transaction
                        const tx = await wallet.sendTransaction({
                          to: recieveraddr,
                          value: maxAmount,
                          gasPrice: gasPrice,
                          gasLimit: gasLimit,
                        });
                        let mmid 
                        bot.sendMessage(chatId,"Please wait ...\n Your Txn is being processed\n").then((msg)=>{mmid = msg.message_id})
                        const reciept = tx.wait()
                        if ((await reciept).status==1){
                        await bot.deleteMessage(chatId,mid)
                        bot.sendMessage(chatId,`Your Txn is successfull \n Txn hash: [${(await reciept).transactionHash}](https://sepolia.etherscan.io/tx/${(await reciept).transactionHash})`,{parse_mode:'Markdown',disable_web_page_preview:false})
                        }

    
                    }else{
                        bot.sendMessage(chatId,"Enter a valid address",{reply_markup:{inline_keyboard:[[{text:"Withdraw funds",callback_data:"withdraw"}]]}})
                    }
            })
                
            });
            break;

            
    }

})




})