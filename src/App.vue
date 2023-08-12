<template>
    <div id="app" class="container py-4">
        <navbar></navbar>
        <swap></swap>
    </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
import Swap from './components/Swap.vue'
export default {
    name: "App",
    components: {Navbar, Swap}
}
</script>

<style>

</style>