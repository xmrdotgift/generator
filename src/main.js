import { createApp } from "vue"
import App from "./App.vue"

import Card from "./components/Card.vue"
import Form from "./components/Form.vue"

const app = createApp(App)
app.component("card", Card)
app.component("settings-form", Form)
app.mount("#app")