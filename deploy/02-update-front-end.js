const { frontEndContractsFile } = require("../helper-hardhat-config")
const fs = require("fs")
const { network } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        const fundMe = await ethers.getContract("Raffle")
        const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
        if (network.config.chainId.toString() in contractAddresses) {
            if (!contractAddresses[network.config.chainId.toString()].includes(fundMe.address)) {
                contractAddresses[network.config.chainId.toString()].push(fundMe.address)
            }
        } else {
            contractAddresses[network.config.chainId.toString()] = [fundMe.address]
        }
        fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
        console.log("Front end written!")
    }
}
module.exports.tags = ["all", "frontend"]
