<template>
    <div>
        <div class="text-end">
            <span>Balanace <span v-text="asset.balance"></span></span>
        </div>
        <div class="row mt-2">
            <div class="col form-input">
                <input type="text" class="form-control" v-model="v" :disabled="disabled" />
            </div>
            <div class="col-1">
                <h2 v-text="asset.name"></h2>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "AssetEntry",
    props: {
        asset: {
            type: Object,
            default: {
                name: "ASSET",
                balance: 0,
            }
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        val: String|Number,
    },
    data() {
        return {
            v: this.value,
        }
    },
    watch: {
        v(x) {
            this.$emit("data", x)
        },
        val(x) {
            if (x != this.v) {
                this.v = x;
            }
        }
    }
}
</script>

<style>

</style>