import Vue from 'vue'
import { ColorPicker, Message } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App'

Vue.config.productionTip = false
Vue.use(ColorPicker)

Vue.component(Message.name, Message)
Vue.prototype.$message = Message;

new Vue({
    el: '#app',
    render: h => h(App),
    beforeCreate() {
        Vue.prototype.$bus = this
    }
})