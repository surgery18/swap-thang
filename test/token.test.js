const Token = artifacts.require('Token')

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

contract("Token", async ([deployer, accountb, accountc]) => {
    let token
    before(async () => {
        token = await Token.new()
    })

    describe("Deployment", () => {
        it('contract has a name', async () => {
            const name = await token.name()
            assert.equal(name, 'Pango Token')
        })

        it('contract has a symbol', async () => {
            const name = await token.symbol()
            assert.equal(name, 'PANGO')
        })

        it('contract has a total supply of 1B tokens', async () => {
            const supply = await token.totalSupply()
            assert.equal(supply.toString(), toWei("1000000000"))
        })

        it("contract supply of tokens should be on the deployer", async () => {
            const balance = await token.balanceOf(deployer)
            const supply = await token.totalSupply()
            assert.equal(balance.toString(), supply.toString())
        })
    })

    describe("External Functions", () => {
        it("Should be able to call the balanceOf function", async () => {
            const supply = await token.totalSupply()
            assert.equal(supply.toString(), toWei("1000000000"))
        })

        it("Should be able to transfer tokens to another account", async () => {
            //shouldn't be able to transfer more than they own
            await token.transfer(accountb, toWei("1000000000000")).should.be.rejected 


            //should transfer from within the amount they own
            const result = await token.transfer(accountb, toWei("100"))
            const event = result.logs[0].args;
            assert.equal(event._from, deployer)
            assert.equal(event._to, accountb)
            assert.equal(event._value.toString(), toWei("100"))

            //account b should have 100 tokens
            const balance = await token.balanceOf(accountb)
            assert.equal(balance.toString(), toWei("100"))
        })

        it("Should be able to call the approve & allowanceOf functions", async () => {
            //this should fail
            await token.approve(accountb, toWei("1000000000000")).should.be.rejected

            //this should be good
            await token.approve(accountb, toWei("1"))

            //now check the account that they can spend the 1 token
            const allowance = await token.allowanceOf(deployer, accountb)
            assert.equal(allowance.toString(), toWei("1"))
        })

        it("Should be able to call the transferFrom function", async () => {

            //transfer some tokens to account c
            await token.transfer(accountc, toWei("1000"))

            //allow account b to spend on behalf of account c
            await token.approve(accountb, toWei("500"), {from: accountc})

            //now let account b try to transfer 1000 tokens to deployer account
            //this should fail since it is only allowed 500 tokens
            await token.transferFrom(accountc, deployer, toWei("1000"), {from: accountb}).should.be.rejected

            //now try to have deployer take it from account c
            //this should failed since they are not allowed
            await token.transferFrom(accountc, deployer, toWei("1")).should.be.rejected

            //get balance of deployer
            const balanceBefore = await token.balanceOf(deployer)

            //this should work
            const result = await token.transferFrom(accountc, deployer, toWei("500"), {from: accountb})
            //check event
            const event = result.logs[0].args;
            assert.equal(event._from, accountc)
            assert.equal(event._to, deployer)
            assert.equal(event._value.toString(), toWei("500"))

            //check balance of deployer that it has gained 500 tokens
            const balanceAfter = await token.balanceOf(deployer)
            let shouldBe = balanceBefore.add(new BN(toWei("500")))
            assert.equal(balanceAfter.toString(), shouldBe.toString())
        })
    })
})