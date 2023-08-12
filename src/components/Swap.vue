<template>
    <div class="py-2 px-5 mb-4 bg-light rounded-3">
        <div class="container-fluid py-5" v-if="!loading && good">
            <asset-entry
                @data="enterData"
                :val="assetA"
                :asset="sell ? assets[1] : assets[0]"
                :disabled="buttonloading"
            ></asset-entry>
            <div class="text-center mt-2">
                <button type="button" class="btn btn-lg btn-primary" @click="reverse" :disabled="buttonloading"><i class="bi bi-arrow-down-up" ></i></button>
            </div>
            <asset-entry
                :asset="sell ? assets[0] : assets[1]"
                :val="assetB"
                :disabled="true"
            ></asset-entry>
            <div class="text-center mt-4">
                <button type="button" class="w-100 btn btn-lg btn-success" @click="swap" v-if="canSwap" :disabled="buttonloading">SWAP</button>
                <button type="button" class="w-100 btn btn-lg btn-success" @click="approve" v-else  :disabled="buttonloading">APPROVE</button>
            </div>
        </div>
        <div v-if="loading">
            <h1>LOADING</h1>
        </div>
        <div v-if="!loading && !good">
            <h1>Could not connect to network and/or load contracts</h1>
        </div>
    </div>
</template>

<script>
import AssetEntry from './AssetEntry.vue'
import Web3 from "web3"
import Token from "../../build/contracts/Token.json"
import SwapThang from "../../build/contracts/SwapThang.json"
import {mapMutations} from "vuex"

const RATE = 1 * 10**6

export default {
    name: "Swap",
    components: { AssetEntry },
    data() {
        return {
            assetA: "",
            assetB: "",
            // assets: ["ETH", "PANGO"],
            // balances: [0, 0],
            assets: [
                {
                    name: "BNB",
                    balance: 0,
                },
                {
                    name: "PANGO",
                    balance: 0,
                }
            ],
            sell: false,
            approved: false,
            tokenContract: null,
            swapThangContract: null,
            loading: true,
            good: false,
            walletAddress: "",
            buttonloading: false,
        }
    },
    async created() {
        //init web3
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }

        //get accounts
        const accounts = await web3.eth.getAccounts()
        this.walletAddress = accounts[0]

        this.setAddress(this.walletAddress)

        //get network id
        const nid = await web3.eth.net.getId()
        console.log("Network ID is", nid)

        //make sure the token is on that network
        const td = Token.networks[nid]
        if (td) {
            //load the contract
            this.tokenContract = new web3.eth.Contract(Token.abi, td.address)
        } else {
            // alert("Token contract not found on network id")
            this.loading = false;
            return
        }

        const std = SwapThang.networks[nid]
        if (std) {
            this.swapThangContract = new web3.eth.Contract(SwapThang.abi, std.address)
        } else {
            // alert("SwapThang contract not found on network id")
            this.loading = false;
            return
        }

        this.loading = false;
        this.good = true;
        

        this.getBalances()
    },
    computed: {
        // getIndexA() {
        //     return this.sell ? 1 : 0
        // },
        // getIndexB() {
        //     return this.sell ? 0 : 1
        // },
        canSwap() {
            return (this.sell && this.approved) || !this.sell
        }
    },
    methods: {
        ...mapMutations(['setAddress']),
        enterData(v) {
            if (this.sell) {
                this.assetB = +v / RATE
            } else {
                this.assetB = +v * RATE
            }
            this.assetA = +v;
        },
        // getAsset(index) {
        //     return {
        //         name: this.assets[index],
        //         balance: this.balances[index]
        //     }
        // },
        reverse() {
            this.sell = !this.sell
            this.assetA = this.assetB
            if (this.sell) {
                this.assetB = +this.assetA / RATE
            } else {
                this.assetB = +this.assetA * RATE
            }
        },
        async swap() {
            this.buttonloading = true
            console.log(this.assetA)
            const amount = window.web3.utils.toWei(""+this.assetA, "Ether")
            if(!this.sell) {
                console.log("Sending", amount)
                try {
                    const receipt = await this.swapThangContract.methods.buy().send({from: this.walletAddress, value: amount})
                    console.log(receipt)
                    this.assetA = ""
                    this.assetB = ""
                    this.getBalances()
                } catch (e) {
                    console.log(e)
                }
                this.buttonloading = false
            } else {
                try {
                    const receipt = await this.swapThangContract.methods.sell(amount).send({from: this.walletAddress})
                    console.log(receipt)
                    this.assetA = ""
                    this.assetB = ""
                    this.approved = false;
                    this.getBalances()
                } catch (e) {
                    console.log(e)
                }
                this.buttonloading = false
            }
        },
        async approve() {
            this.buttonloading = true
            const etherAmount = window.web3.utils.toWei(""+this.assetA, "Ether")
            const addr = this.swapThangContract._address
            try {
                const receipt = await this.tokenContract.methods.approve(addr, etherAmount).send({from: this.walletAddress})
                console.log(receipt)
                this.approved = true
            } catch (e) {
                console.log(e)
            }
            this.buttonloading = false
        },
        async getBalances() {
            if (!this.tokenContract) return
            if (!this.swapThangContract) return
            let ethAmount = await window.web3.eth.getBalance(this.walletAddress)
            let tokenAmount = await this.tokenContract.methods.balanceOf(this.walletAddress).call()

            ethAmount = window.web3.utils.fromWei(ethAmount, 'Ether')
            tokenAmount = window.web3.utils.fromWei(tokenAmount, 'Ether')

            this.$nextTick(() => {
                console.log(ethAmount, tokenAmount)
                if (this.sell) {
                    // this.balances[0] = tokenAmount.toString()
                    this.assets[1].balance = tokenAmount.toString()
                    // this.balances[1] = ethAmount.toString()
                    this.assets[0].balance = ethAmount.toString()
                    // console.log(this.balances)
                } else {
                    // this.balances[1] = tokenAmount.toString()
                    this.assets[1].balance = tokenAmount.toString()
                    // this.balances[0] = ethAmount.toString()
                    this.assets[0].balance = ethAmount.toString()
                }
            })
        }
    }
}
</script>

<style>

</style>