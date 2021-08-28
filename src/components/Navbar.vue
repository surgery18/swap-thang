<template>
    <header class="pb-3 mb-4 border-bottom d-flex flex-row justify-content-between text-dark">
        <div class="text-decoration-none">
            <span class="fs-4">Swap Thang</span>
        </div>
        <div class="mt-2 fw-bold">
            <div v-if="walletAddress" v-text="walletAddress"></div>
        </div>
    </header>
</template>

<script>
import {mapState} from "vuex"
export default {
    name: "Navbar",
    computed: {
        ...mapState(['walletAddress'])
    },
}
</script>

<style>

</style>