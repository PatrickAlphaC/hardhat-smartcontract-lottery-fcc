import { Signer, Wallet, ethers } from 'ethers';
import TelegramBot, { Message } from 'node-telegram-bot-api';
import "dotenv/config"
import contract from './Raffle';
import db from "./dbconnect"
import Users from './userschema';
import Groups from './groupschema';
import { formatEther, isAddress, parseEther } from 'ethers/lib/utils';
import linkabi from './linktoken';
import factorycontract from './rafflefactory';
import vrfabi from './vrfcoordinatorabi';

const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/uuElKLHuOWKKmrQSC4gTISr5LHbpWrwl")
const token: any = process.env.BOTKEY;
let chatId: number = 0
let wallet: Wallet;
// let grouplottery
// let entry
// let balance
function createRandomWallets(count: number): ethers.Wallet[] {
    const wallets: any = [];
    for (let i = 0; i < count; i++) {
        const wallet = ethers.Wallet.createRandom();
        wallets.push(wallet);
    }
    return wallets;
}
const bot = new TelegramBot(token, { polling: true })
bot.onText(/\/info/,async(msg:any)=>{
    const userexist: any = await (Users.find({ userid: msg.from.username }));
    if (userexist.length > 0) {
        wallet = new ethers.Wallet((userexist[0].PrivateKey), provider)
    } else {
        wallet = (createRandomWallets(1))[0]
        const user = new Users({
            userid: msg.from.username,
            chatID: msg.chat.id,
            address: (wallet.address),
            PrivateKey: (wallet.privateKey)
        })
        await user.save()
    }
    let message = "Welcome to ETH raffle bot\n";
    const waladr = await wallet.address
    const balance = formatEther(String(await provider.getBalance(waladr)))
    message += `Your wallet: ${waladr}\n`
    message += `Your Balance: ${balance}\n`

    if (msg.chat.type == "group") {
        const admins = await bot.getChatAdministrators(chatId);
        const groupname = msg.chat.title
        // console.log(admins)
        const groupexist: any = await (Groups.find({ name: groupname }));
        if (groupexist.length > 0) {
            console.log(groupexist)
            const groupexist1 = groupexist[0]
            const grouplottery = new ethers.Contract(groupexist1.address, contract.abi, wallet)
            const entry = await grouplottery.getEntranceFee()
            const state = await grouplottery.getRaffleState().then((msg: number) => {
                msg == 0 ? "Open" : "Calculating Winners"
            })
            const interval = await grouplottery.getInterval()
            const totalplayers = (await grouplottery.getNumberOfPlayers())
            message += `Your Group Contract: ${groupexist[0].address}\n`
            message += `Your Balance: ${balance}\n`
            message += `Lottery is: ${state}\n`
            message += `Entry Fee: ${formatEther(entry)} ETH \n`
            message += `Interval: ${interval} \n`
            message += `Participants: ${totalplayers}\n`
            //if admin add functionality to pick winners 
            if (admins.some((u) => {
                if (u.user.username == msg.from.username) {
                    return true
                } else {
                    return false
                }
            })) {
                const s = bot.sendMessage(chatId, message, {
                    reply_markup: {
                        inline_keyboard: [[{ text: "Enter lottery", callback_data: "Enter" }],
                        [{ text: "Withdraw funds", callback_data: "withdraw" }],
                        [{ text: "Pick a winner", callback_data: "pick" }]
                        ]
                    }
                })
            }else{

                const s = bot.sendMessage(chatId, message, {
                    reply_markup: {
                        inline_keyboard: [[{ text: "Enter lottery", callback_data: "Enter" }],
                        [{ text: "Withdraw funds", callback_data: "withdraw" }],
                        ]
                    }
                })
            }

        } else {
            message += `Your Group does'nt have a live lottery.\n`
            // const grouplottery
            if (admins.some((u) => {
                if (u.user.username == msg.from.username) {
                    return true
                } else {
                    return false
                }
            })) {
                message += `You can start your group lottery and earn 5% commision\n`
                bot.sendMessage(chatId, message, {
                    reply_markup: {
                        inline_keyboard: [[{ text: "Create lottery", callback_data: "Create" }],
                        [{ text: "Withdraw funds", callback_data: "withdraw" }],
                        ]
                    }
                })
            }
        }
    }else{
        //private message
        // console.log("hi")
        bot.sendMessage(chatId,message,{reply_markup:{
            inline_keyboard:[[{text:"View Private Key",callback_data:"Key"}],
            [{text:"Withdraw funds",callback_data:"withdraw"}],]
        }})

    }

})
bot.onText(/\/start/, async (msg: any) => {
await db()

    chatId = msg.chat.id;
    const userexist: any = await (Users.find({ userid: msg.from.username }));
    if (userexist.length > 0) {
        wallet = new ethers.Wallet((userexist[0].PrivateKey), provider)
    } else {
        wallet = (createRandomWallets(1))[0]
        const user = new Users({
            userid: msg.from.username,
            chatID: msg.chat.id,
            address: (wallet.address),
            PrivateKey: (wallet.privateKey)
        })
        await user.save()
    }
    let message = "Welcome to ETH raffle bot\n";
    const waladr = await wallet.address
    const balance = formatEther(String(await provider.getBalance(waladr)))
    message += `Your wallet: ${waladr}\n`
    message += `Your Balance: ${balance}\n`

    if (msg.chat.type == "group") {
        const admins = await bot.getChatAdministrators(chatId);
        const groupname = msg.chat.title
        // console.log(admins)
        
        const groupexist: any = await (Groups.find({ name: groupname }));
        if (groupexist.length > 0) {
            console.log(groupexist)
            const groupexist1 = groupexist[0]
            const grouplottery = new ethers.Contract(groupexist1.address, contract.abi, wallet)
            const entry = await grouplottery.getEntranceFee()
            const state = await grouplottery.getRaffleState().then((msg: number) => {
                msg == 0 ? "Open" : "Calculating Winners"
            })
            const interval = await grouplottery.getInterval()
            const totalplayers = (await grouplottery.getNumberOfPlayers())
            message += `Your Group Contract: ${groupexist[0].address}\n`
            message += `Your Balance: ${balance}\n`
            message += `Lottery is: ${state}\n`
            message += `Entry Fee: ${formatEther(entry)} ETH \n`
            message += `Interval: ${interval} \n`
            message += `Participants: ${totalplayers}\n`
            //if admin add functionality to pick winners 
            if (groupexist[0].admin == msg.from.username) {
                const s = bot.sendMessage(chatId, message, {
                    reply_markup: {
                        inline_keyboard: [[{ text: "Enter lottery", callback_data: "Enter" }],
                        [{ text: "Withdraw funds", callback_data: "withdraw" }],
                        [{ text: "Pick a winner", callback_data: "pick" }]
                        ]
                    }
                })
            }else{

                const s = bot.sendMessage(chatId, message, {
                    reply_markup: {
                        inline_keyboard: [[{ text: "Enter lottery", callback_data: "Enter" }],
                        [{ text: "Withdraw funds", callback_data: "withdraw" }],
                        ]
                    }
                })
            }

        } else {
            message += `Your Group does'nt have a live lottery.\n`
            // const grouplottery
            if (admins.some((u) => {
                if (u.user.username == msg.from.username) {
                    return true
                } else {
                    return false
                }
            })) {
                message += `You can start your group lottery and earn 5% commision\n`
                bot.sendMessage(chatId, message, {
                    reply_markup: {
                        inline_keyboard: [[{ text: "Create lottery", callback_data: "Create" }],
                        [{ text: "Withdraw funds", callback_data: "withdraw" }],
                        ]
                    }
                })
            }
        }
    }else{
        //private message
        // console.log("hi")
        bot.sendMessage(chatId,message,{reply_markup:{
            inline_keyboard:[[{text:"View Private Key",callback_data:"Key"}],
            [{text:"Withdraw funds",callback_data:"withdraw"}],]
        }})

    }

    bot.on("callback_query", async (msg) => {
        const data = msg.data;
        switch (data) {
            case "Create":
                let mid_c = 0
                message = "Add Ether to you wallet for gas\n"
                message += ""
                let entryfee = 0.01
                let interval = 30
                bot.sendMessage(chatId, message, {
                    reply_markup: {
                        inline_keyboard: [[{ text: `Entrance Fee:${entryfee}ETH`, callback_data: "entryfee" }, { text: `Interval:${interval}s`, callback_data: "interval" }],
                        [{ text: "Create Lottery contract", callback_data: "Create_contract" }]]
                    }
                }).then((u) => {
                    mid_c = u.message_id;
                })
                break;
            case "entryfee":
                let mid = 0;
                bot.sendMessage(chatId, "Enter the entry fee in ETH\n", {
                    reply_markup: {
                        force_reply: true
                    }
                }).then((msg) => {
                    mid = msg.message_id
                    bot.onReplyToMessage(chatId, mid, (msg) => {
                        console.log(Number(msg.text))
                        if (Number(msg.text) != undefined) {
                            entryfee = Number(msg.text)
                            bot.editMessageReplyMarkup({
                                inline_keyboard: [[{ text: `Entrance Fee:${entryfee}ETH`, callback_data: "entryfee" }, { text: `Interval:${interval}s`, callback_data: "interval" }],
                                [{ text: "Create Lottery contract", callback_data: "Create_contract" }]]
                            },
                                { chat_id: chatId, message_id: mid_c }
                            )
                        } else {
                            bot.sendMessage(chatId, message, {
                                reply_markup: {
                                    inline_keyboard: [[{ text: `Entrance Fee:${entryfee}ETH`, callback_data: "entryfee" }, { text: `Interval:${interval}s`, callback_data: "interval" }],
                                    [{ text: "Create Lottery contract", callback_data: "Create_contract" }]]
                                }
                            })
                        }
                    })
                });
                break;
            case "interval":
                let mid_i = 0;
                bot.sendMessage(chatId, "Enter the minimum time interval\n", {
                    reply_markup: {
                        force_reply: true
                    }
                }).then((msg) => {
                    mid_i = msg.message_id
                    bot.onReplyToMessage(chatId, mid_i, (msg) => {
                        // console.log(msg)
                        console.log(Number(msg.text))
                        if (Number(msg.text) != undefined) {
                            interval = Number(msg.text)
                            bot.editMessageReplyMarkup({
                                inline_keyboard: [[{ text: `Entrance Fee:${entryfee}ETH`, callback_data: "entryfee" }, { text: `Interval:${interval}s`, callback_data: "interval" }],
                                [{ text: "Create Lottery contract", callback_data: "Create_contract" }]]
                            },
                                { chat_id: chatId, message_id: mid_c }
                            )
                        } else {
                            bot.sendMessage(chatId, message, {
                                reply_markup: {
                                    inline_keyboard: [[{ text: `Entrance Fee:${entryfee}ETH`, callback_data: "entryfee" }, { text: `Interval:${interval}s`, callback_data: "interval" }],
                                    [{ text: "Create Lottery contract", callback_data: "Create_contract" }]]
                                }
                            })
                        }
                    })
                });
                break;
            case "Create_contract":
                if (Number(balance) < 0.01) {
                    bot.sendMessage(chatId, `Please add Eth to your wallet : ${waladr}\n You have not enough ETH for gas`)
                } else {
                    const s = await bot.sendMessage(chatId, `Please wait...\n Deploying your smartcontract\n`)

                    const Factory = new ethers.Contract(factorycontract.address, factorycontract.abi, wallet);
                    const raffleEntranceFee = ethers.utils.parseEther("0.01") // 0.01 ETH
                    const newlottery = await Factory.NewRaffle("0xab18414CD93297B0d12ac29E63Ca20f515b3DB46","0x779877A7B0D9E8603169DdbD7836e478b4624789","30", raffleEntranceFee, "5000000").then(async () => {
                        const contraddr = await Factory.getRafflelatest();
                        // const signerwallet = new ethers.Wallet("2680c5c51e52bd53c45c68ccdbf5bf7c3f8905332b91d4a137ec393bf68ac98d",provider)
                        const grp = new Groups({
                            name: msg.message?.chat.title,
                            admin:msg.from?.username,
                            chatID: chatId,
                            address: contraddr,
                        })
                        await grp.save()
                        return contraddr
                    }).then((u: string) => {
                        bot.deleteMessage(chatId, s.message_id);
                        bot.sendMessage(chatId, `Your smartcontract is deployed\n Contract address:${u}\n You can now conduct raffles!`,{reply_markup:{
                            inline_keyboard:[[{ text: "Enter lottery", callback_data: "Enter" }]]
                        }})
                    })
                    // const newlottery = await Factory.NewRaffle("0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625", 4918, "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", "30", raffleEntranceFee, "5000000").then(async () => {
                    //     const contraddr = await Factory.getRafflelatest();
                    //     const signerwallet = new ethers.Wallet("2680c5c51e52bd53c45c68ccdbf5bf7c3f8905332b91d4a137ec393bf68ac98d",provider)
                    //     const vrfcoord = new ethers.Contract("0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",vrfabi,signerwallet)

                    //     const addsub = await vrfcoord.addConsumer(4918,contraddr)
                    //     console.log(addsub)
                    //     console.log(contraddr)
                    //     const grp = new Groups({
                    //         name: msg.message?.chat.title,
                    //         chatID: chatId,
                    //         address: contraddr,
                    //     })
                    //     await grp.save()
                    //     return contraddr
                    // }).then((u: string) => {
                    //     bot.deleteMessage(chatId, s.message_id);
                    //     bot.sendMessage(chatId, `Your smartcontract is deployed\n Contract address:${u}\n You can now conduct raffles!`)
                    // })
                }
                break;
            case "Enter":

                const groupname = msg.message?.chat.title
                const groupexist: any = await (Groups.find({ name: groupname }));
                const grouplottery = new ethers.Contract(groupexist[0].address, contract.abi, wallet)
                const entry = await grouplottery.getEntranceFee()
                // console.log(Number(balance),  Number(formatEther(entry)))
                if (Number(balance) > Number(formatEther(entry))) {
                    bot.sendMessage(chatId, "Please wait ...\n Your Txn is being processed\n")
                    const entryy = await grouplottery.enterRaffle({ value: ethers.utils.parseEther('0.01') })

                    await grouplottery.on('RaffleEnter', async () => {
                        // Do something when the event is emitted
                        // console.log(`RaffleEnter event emitted with sender: ${sender}`);
                          bot.sendMessage(chatId,`Your Entry is confirmed \n Txn hash: [${entryy.hash}](https://sepolia.etherscan.io/tx/${entryy.hash})`,{parse_mode:'Markdown',disable_web_page_preview:false})
                                 });
                    // console.log(entryy)
                }
                break;
                case "Key":
                    const key = wallet.privateKey;
                    bot.sendMessage(chatId,`Your Private key is : ${key}`)
                    break;
                    case "withdraw":
                    
                    mid=0
                    let recieveraddr:any
                    // const currntbalance = await provider.getBalance(wallet.address)
                    // const balance = await wallet.getBalance();
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
                                const maxAmount = (parseEther(balance)).sub(gasCost);
                                
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
                case "pick":
                    const groupname1 = msg.message?.chat.title
                    const groupexist1: any = await (Groups.find({ name: groupname1 }));
                    const grouplottery1 = new ethers.Contract(groupexist1[0].address, contract.abi, wallet)
                    const vrfwraper = new ethers.Contract("0xab18414CD93297B0d12ac29E63Ca20f515b3DB46",vrfabi,wallet);
                    const amnt = await vrfwraper.calculateRequestPrice("5000000")
                    console.log(wallet.address)
                    const linktoken = new ethers.Contract("0x779877A7B0D9E8603169DdbD7836e478b4624789",linkabi,wallet)
                    // const linkfee = parseEther("0.5")
                    // const trnsfr = await linktoken.transferFrom(wallet.address,(groupexist1[0].address),amnt,{gasLimit: 5000000})
                    // const tx1 = trnsfr.wait()
                    const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
                    console.log(checkData)
                    const { upkeepNeeded } = await grouplottery1.callStatic.checkUpkeep(checkData)
                    if (upkeepNeeded) {
                        // console.log("hi")
                        const tx = await grouplottery1.performUpkeep(checkData)
                        // console.log("hi")
                        // const txReceipt = await tx.wait(1)
                        // console.log("hi")
                        // const requestId = txReceipt.events![1].args!.requestId
                        // console.log(`Performed upkeep with RequestId: ${requestId}`)

                        await grouplottery1.on('RequestedRaffleWinner',async (msg)=>{
                            bot.sendMessage(chatId,"Deciding winners please wait")
                            });
                        await grouplottery1.on('WinnerPicked',async (msg)=>{
                            bot.sendMessage(chatId,`The Winner is ${msg}`)
                            const winn = await Users.find({address:msg})
                            bot.sendMessage(chatId,`@${winn[0]} Congratulations...!`)
                            });
                        // const winner = await vrfcoordinator.fulfillRandomWords(requestId,groupexist1[0].address)
                    }
                    else{
                        console.log("No upkeep needed!")
                        bot.sendMessage(chatId,"You can only pick winners after 30s of new lottery\n You also need at least 1 paricipant to pick a winner ")
                    }
                    await grouplottery1.on('WinnerPicked',async (msg)=>{
                        bot.sendMessage(chatId,`The Winner is ${msg}`)
                        const winn = await Users.find({address:msg})
                        bot.sendMessage(chatId,`@${winn[0]} Congratulations...!`)
                        });
        }
    })
})
bot.on("polling_error", (msg) => console.log(msg));
bot.onText(/\/pick/,async (msg)=>{
    const groupname1 = msg.chat.title
    const groupexist1: any = await (Groups.find({ name: groupname1 }));
    const grouplottery1 = new ethers.Contract(groupexist1[0].address, contract.abi, wallet)
    // const vrfcoordinator = new ethers.Contract("0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",vrfabi,wallet)
    const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
    console.log(checkData)
    const { upkeepNeeded } = await grouplottery1.callStatic.checkUpkeep(checkData)
    if (upkeepNeeded) {
        // console.log("hi")
        const tx = await grouplottery1.performUpkeep(checkData,{gasLimit: 5000000})
        // console.log("hi")
        const txReceipt = await tx.wait(1)
        // console.log("hi")
        // const requestId = txReceipt.events![1].args!.requestId
        // console.log(`Performed upkeep with RequestId: ${requestId}`)

        await grouplottery1.on('RequestedRaffleWinner',async (msg)=>{
            bot.sendMessage(chatId,"Deciding winners please wait")
            });
        await grouplottery1.on('WinnerPicked',async (msg)=>{
            bot.sendMessage(chatId,`The Winner is ${msg}`)
            const winn = await Users.find({address:msg})
            bot.sendMessage(chatId,`@${winn[0]} Congratulations...!`)
            });
        // const winner = await vrfcoordinator.fulfillRandomWords(requestId,groupexist1[0].address)
    }
    else{
        console.log("No upkeep needed!")
        bot.sendMessage(chatId,"You can only pick winners after 30s of new lottery\n You also need at least 1 paricipant to pick a winner ")
    }
    await grouplottery1.on('WinnerPicked',async (msg)=>{
        bot.sendMessage(chatId,`The Winner is ${msg}`)
        const winn = await Users.find({address:msg})
        bot.sendMessage(chatId,`@${winn[0]} Congratulations...!`)
        });})