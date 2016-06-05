import Vue from 'vue'
import Mint from 'mint-ui'
import VueResource from 'vue-resource'
import App from './App'
import 'mint-ui/lib/style.css'

Vue.use(Mint)
Vue.use(VueResource)
/* eslint-disable no-new */
new Vue({
  el: 'body',
  components: { App }
})
