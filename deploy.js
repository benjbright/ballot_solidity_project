const HDWalletProvider = require("@truffle/hdwallet-provider")
const Web3 = require("web3")
const { interface, bytecode } = require("./compile")

const provider = new HDWalletProvider(
  // MetaMask dummy account phrase
  "make giant debate crystal drip nephew veteran swarm symbol wire prepare fever",
  "https://rinkeby.infura.io/v3/0c18f56a3dec48d1886f827249f4c90e"
)
const web3 = new Web3(provider)

const deploy = async () => {
  const accounts = await web3.eth.getAccounts()

  console.log("Attempting to deploy from account", accounts[0])

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ gas: "1000000", from: accounts[0] })

  console.log(interface)
  console.log("Contract deployed to", result.options.address)
  provider.engine.stop()
}
deploy()
