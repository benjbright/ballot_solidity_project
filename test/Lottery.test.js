// TESTING SET UP - module 88 'Test Helper Review' on the Ethereum course
const assert = require("assert")
// require in the assert helper library

const ganache = require("ganache-cli")
// Set up a local test network using ganache

const Web3 = require("web3")
// Require in the Web3 constructor function

const web3 = new Web3(ganache.provider())
// Set up new instance of Web3
// The provider is a 'replaceable' block that we insert into the Web3 library that allows use to connect to any given network

const { interface, bytecode } = require("../compile")
// require in the ABI and raw compiled contract data - object with the interface and bytecode properties

// DECLARE LOCAL VARIABLES
let lottery
let accounts

beforeEach(async () => {
  accounts = await web3.eth.getAccounts()

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: "1000000" })
})

describe("Lottery Contract", () => {
  it("deploys a contract", () => {
    assert.ok(lottery.options.address)
  })

  it("allows one account to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    })

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    })

    assert.equal(accounts[0], players[0])
    assert.equal(1, players.length)
    // value that it should be, then value that it actually is
  })

  it("allows multiple accounts to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    })
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether"),
    })
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02", "ether"),
    })

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    })

    assert.equal(accounts[0], players[0])
    assert.equal(accounts[1], players[1])
    assert.equal(accounts[2], players[2])
    assert.equal(3, players.length)
    // value that it should be, then value that it actually is
  })

  it("requires a minimum amount of ether to enter", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 200,
      })
      assert(false)
    } catch (err) {
      // catch errors thrown by asynchronous function calls
      assert(err) // assert checks for truthiness
    }
  })

  it("only manager can call pickWinner", async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      })
      assert(false)
    } catch (error) {
      assert(error)
    }
  })

  it("sends money to the winner and resets the players array", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("2", "ether"),
    })

    const initialBalance = await web3.eth.getBalance(accounts[0])
    await lottery.methods.pickWinner().send({ from: accounts[0] })
    const finalBalance = await web3.eth.getBalance(accounts[0])
    const difference = finalBalance - initialBalance

    assert(difference > web3.utils.toWei("1.8", "ether"))
  })
})
