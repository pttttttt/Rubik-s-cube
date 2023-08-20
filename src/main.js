import Vue from 'vue'
import { ColorPicker } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App'
Vue.config.productionTip = false
Vue.use(ColorPicker)
new Vue({
    el: '#app',
    render: h => h(App),
    beforeCreate() {
        Vue.prototype.$bus = this
    }
})