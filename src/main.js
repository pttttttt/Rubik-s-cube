import Vue from 'vue'
import { ColorPicker, Message, Switch, Slider, Input, Collapse, CollapseItem, Dialog, Button } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App'

Vue.config.productionTip = false
Vue.use(ColorPicker)
Vue.use(Switch)
Vue.use(Slider)
Vue.use(Input)
Vue.use(Collapse)
Vue.use(CollapseItem)
Vue.use(Dialog)
Vue.use(Button)

Vue.component(Message.name, Message)
Vue.prototype.$message = Message;

new Vue({
  el: '#app',
  render: h => h(App),
  beforeCreate() {
    Vue.prototype.$bus = this
  }
})