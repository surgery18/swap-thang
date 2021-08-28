const Token = artifacts.require("Token")
const ST = artifacts.require("SwapThang")

module.exports = async function (deployer) {
  await deployer.deploy(Token)
  const token = await Token.deployed()

  await deployer.deploy(ST, token.address)
  const swap = await ST.deployed()

  //transfer tokens to ST contract
  const supply = await token.totalSupply()
  await token.transfer(swap.address, supply)
};
