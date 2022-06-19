import { createApp } from "vue"
import App from "./App.vue"
import "bootstrap/dist/css/bootstrap.min.css"

import Form from "./components/Form.vue"

const app = createApp(App)
app.component("settings-form", Form)
app.mount("#app")