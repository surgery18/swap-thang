import {createApp} from "vue"
import {createStore} from "vuex"
import App from "./App.vue"

import "bootstrap/dist/js/bootstrap.bundle.min"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"

const store = createStore({
    state () {
        return {
            walletAddress: "",
        }
    },
    mutations: {
        setAddress(state, address) {
            state.walletAddress = address
        }
    }
})

const app = createApp(App)
app.use(store)
app.mount("#app")