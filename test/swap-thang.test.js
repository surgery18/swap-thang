const Token = artifacts.require('Token')
const ST = artifacts.require('SwapThang')

require('chai')
  .use(require('chai-as-promised'))
  .should()

const toWei = (n) => {
    return web3.utils.toWei(n, "ether")
}

const fromWei = (n) => {
    return web3.utils.fromWei(n, "ether")
}

const BN = web3.utils.BN

contract("SwapThang", async ([deployer, accountb]) => {
    let token, swap
    
    before(async () => {
        token = await Token.new()
        swap = await ST.new(token.address)

        //transfer the tokens to the swap contract
        const supply = await token.totalSupply()
        await token.transfer(swap.address, supply)
    })

    describe("Deployment", () => {
        it("Should have a name", async () => {
            const name = await swap.name()
            assert.equal(name, "SwapThang - Send, Withdraw, And Purchase")
        })

        it("Should have the total supplies", async () => {
            const balance = await token.balanceOf(swap.address)
            const supply = await token.totalSupply()
            assert.equal(balance.toString(), supply.toString())
        })
    })


    describe("Buy function", () => {
        it("Should let a user purchase a token", async () => {
            //they should have 0 tokens now
            let balance = await token.balanceOf(accountb)
            assert.equal(balance.toString(), "0")

            //try to buy a token with tokens we dont have...it should fail
            await swap.buy({from: accountb, value: toWei('1000000000000')}).should.be.rejected

            //now buy a token by sending 1 eth. This should work
            const result = await swap.buy({from: accountb, value: toWei('1')})

            //check event
            const event = result.logs[0].args
            const bn = new BN(1 * 10**6)
            assert.equal(event.act, accountb)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), toWei(bn).toString())
            assert.equal(event.rate.toString(), bn.toString())

            //get balance of account b and make sure it is 1M tokens
            balance = await token.balanceOf(accountb)
            assert.equal(balance.toString(), toWei(bn).toString())

            //now make sure there is 1 ether in the contract
            balance = await web3.eth.getBalance(swap.address)
            assert.equal(balance.toString(), toWei("1").toString())
        })
    })

    describe("Sell function", () => {
        it("Should let a user sell tokens", async () => {
            //the user should have 1M tokens
            const bn = new BN(1 * 10**6)
            let balance = await token.balanceOf(accountb)
            assert.equal(balance.toString(), toWei(bn).toString())

            //the token should have 1 ether
            balance = await web3.eth.getBalance(swap.address)
            assert.equal(balance.toString(), toWei("1").toString())

            //the user approves the contract to take the tokens from them
            await token.approve(swap.address, toWei(bn), {from: accountb})            

            //now sell the tokens
            //this should not pass
            const bad = new BN(2 * 10**6)
            await swap.sell(toWei(bad), {from: accountb}).should.be.rejected

            const beforeEth = await web3.eth.getBalance(accountb)

            //now this should work
            const result = await swap.sell(toWei(bn), {from: accountb})
            // console.log(result)
            //check event
            const event = result.logs[0].args
            assert.equal(event.act, accountb)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), toWei(bn).toString())
            assert.equal(event.rate.toString(), bn.toString())

            //now check the balance
            balance = await token.balanceOf(accountb)
            assert.equal(balance.toString(), "0")

            //the contract should be 0 eth
            balance = await web3.eth.getBalance(swap.address)
            assert.equal(balance.toString(), "0")

            //now get the new eth amount on account b
            const afterEth = fromWei(await web3.eth.getBalance(accountb))
            const greater = afterEth > beforeEth
            assert.equal(greater, true)
        })
    })

})