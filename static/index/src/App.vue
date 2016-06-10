<template>
  <div id="app">
    <mt-header 
      title="图书馆订阅系统" 
      style="font-size: 20px"
    >
    </mt-header>

    <div class="login" v-if="!isLogin">
      <mt-field 
        label="学号" 
        placeholder="请输入学号" 
        type="text" 
        :value.sync="stuId" 
      ></mt-field>
      <mt-field 
        label="密码" 
        placeholder="请输入密码/默认为123456" 
        type="password" 
        :value.sync="password" 
      ></mt-field>
      <mt-button 
        class="login-button" 
        size="large" 
        type="primary" 
        @click="login(this.value)" 
      >
        登陆
      </mt-button>
    </div>

    <mt-tab-container :active.sync="selected">
      <mt-tab-container-item id="借阅">
        <mt-cell 
          v-for="ele in lend" 
          :title="ele.title | lendTitle"
          :label="ele.lend | lendTime"
        >
          <span v-if="ele.remain > 7" style="color: #4caf50">
            {{ele.remain | remain}}
          </span>
          <span v-if="ele.remain > 0 && ele.remain <= 7" style="color: #FF5722">
            {{ele.remain | remain}}
          </span>
          <span v-if="ele.remain < 0" style="color: red">
            超期：{{ele.remain | remain}}
          </span>                  
        </mt-cell>
      </mt-tab-container-item>
      <mt-tab-container-item id="订阅">
        <div class="book-cell">
          <mt-cell 
            v-for="ele in books" 
            :title="ele.title | title"
            :label='ele.location | location'
          >
            <span style="color: green" v-if="ele.canBorrowNum">
              可借: {{ele.canBorrowNum}}
            </span>
            <span v-else="!ele.canBorrowNum">
              可借: {{ele.canBorrowNum}}
            </span>
            <span
              class="mint-field-state is-error"
              v-if="showDel"
              @click="delBook($index)"
            >
              <i class="mintui mintui-field-error"></i>
            </span>
          </mt-cell>
        </div>

        <div class="book-add" v-if="showAdd">
          <mt-field
            label="书籍号"
            placeholder="eg: 0000805778"
            :state="addBookState"
            :value.sync="addBook"
          >
          </mt-field>
        </div>

        <div class="set-mail" v-if="showMail">
          <mt-field
            label="邮箱"
            placeholder="用于提醒你有书可借"
            type="text"
            :state="emailState"
            :value.sync="user.email"
          >
          </mt-field>
        </div>

        <div class="operate" v-if="showOperate">
          <mt-button 
            type="primary" 
            size="normal"
            v-if="!showSave"
            @click="addSub"
          >增加订阅</mt-button>
          <mt-button
            type="danger"
            size="normal"
            v-if="!showSave"
            @click="delSub"
          >删除订阅</mt-button>
          <mt-button
            style="width:91%;"
            type="primary"
            plain
            v-if="!showSave"
            @click="addMail"
          >
            设置邮箱
          </mt-button>
          <mt-button
            style="background-color: #4CAF50; width:92%;"
            type="primary"
            v-if="showSave"
            @click="save"
          >
            保存
          </mt-button>
        </div>
      </mt-tab-container-item>
      <mt-tab-container-item id="搜索">
        <mt-search 
          :value.sync="search.title"
          :result.sync="search.result"
          cancel-text="取消"
          placeholder="搜索"
          @keyup.enter="searchBook"
        >
        <div
          v-infinite-scroll="loadMore()"
          infinite-scroll-distance="10"
        >
          <mt-cell
            v-for="ele in search.result"
            :title="ele.title"
            :label="ele.author"
          >
          </mt-cell>
          <div class="search-spinner">
            <mt-spinner type="snake" v-if="search.loading"></mt-spinner>
          </div>
        </div>
        </mt-search>
      </mt-tab-container-item>
    </mt-tab-container>

    <mt-tabbar :selected.sync="selected" fixed v-if="isLogin">
      <mt-tab-item id="借阅">
        <i class="iconfont icon-book"></i>
        借阅
      </mt-tab-item>
      <mt-tab-item id="订阅">
        <i class="iconfont icon-news"></i>
        订阅
      </mt-tab-item>
      <mt-tab-item id="搜索">
        <i class="iconfont icon-search"></i>
        搜索
      </mt-tab-item>
    </mt-tabbar>
    <div class="fix-fixed"></div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import { Toast, Indicator } from 'mint-ui'

  const lendTitleRe = /\/.+/i
  Vue.filter('title', val => val.replace(';', ''))
  Vue.filter('location', val => `馆藏地址：${val}main.js`)
  Vue.filter('lendDate', val => `借：${val}`)
  Vue.filter('lendTitle', val => val.replace(lendTitleRe, '》'))
  Vue.filter('remain', val => `${val}天`)
  Vue.filter('lendTime', val => `借阅日期：${val}`)

  export default {
    data () {
      return {
        stuId: '',
        password: '',
        isLogin: false,
        operate: '',
        showOperate: false,
        showAdd: false,
        showDel: false,
        showSave: false,
        showMail: false,
        user: {},
        books: [],
        booksLength: 0,
        addBook: '',
        selected: '借阅',
        lend: [],
        search: {
          title: '',
          page: 1,
          result: [],
          loading: false
        }
      }
    },
    computed: {
      addBookState () {
        if (!this.addBook.length) {
          return ''
        }
        if (this.addBook.length === 10) {
          return 'success'
        }
        return 'error'
      },
      emailState () {
        let re = /@./i
        if (this.user.email === '') return ''
        if (re.test(this.user.email)) {
          return 'success'
        }
        return 'error'
      }
    },
    methods: {
      login (stuId) {
        this.$http.get(`/api/users/${this.stuId}`)
        .then(res => res.data)
        .then(data => {
          this.user = data
          this.isLogin = true
          this.lendInfo()
          this.booksInfo(data.books)
          Indicator.open('正在加载借阅信息，请稍等')
        })
        .catch(() => {
          Toast({
            message: '您的输入不合法，请重新输入！'
          })
        })
      },
      lendInfo () {
        this.$http.post('/api/users/login', JSON.stringify({
          username: this.stuId,
          password: this.password || '123456'
        }))
        .then(res => res.data)
        .then(data => {
          this.lend = data
          this.fixHeight()
          Indicator.close()
        })
        .catch(err => {
          Toast({
            message: '出错，请检查用户名和密码'
          })
          this.isLogin = false
          console.log(err)
          Indicator.close()
        })
      },
      fixHeight () {
        let tabbar = document.getElementsByClassName('mint-tabbar')[0]
        let fixFixed = document.getElementsByClassName('fix-fixed')[0]
        fixFixed.style.height = tabbar.scrollHeight + 'px'
      },
      booksInfo (books) {
        this.user.books = books
        this.$http.post('/api/lib', JSON.stringify(books))
        .then(res => res.data)
        .then(data => {
          this.books = data
          this.showOperate = true
        })
      },
      searchBook () {
        if (!this.search) {
          return false
        }
        this.search.page = 1
        Indicator.open('正在搜索')
        this.$http.post('/api/search', JSON.stringify({title: this.search.title, page: this.search.page}))
        .then(res => res.data)
        .then(data => {
          this.search.result = data
          Indicator.close()
        })
        .catch(e => {
          console.log(e)
          Indicator.close()
        })
      },
      loadMore () {
        this.search.page += 1
        this.search.loading = true
        this.$http.post('/api/search', JSON.stringify({title: this.search.title, page: this.search.page}))
        .then(res => res.data)
        .then(data => {
          this.search.result = this.search.result.concat(data)
          this.search.loading = false
        })
        .catch(e => {
          console.log(e)
          Indicator.close()
        })
      },
      reLend (uri) {
        console.log(uri)
      },
      addSub () {
        this.showAdd = true
        this.showSave = true
        this.operate = 'add'
      },
      delSub () {
        this.showDel = true
        this.showSave = true
        this.operate = 'del'
        this.booksLength = this.books.length
      },
      delBook (index) {
        this.books.splice(index, 1)
        this.user.books.splice(index, 1)
      },
      addMail () {
        this.showSave = true
        this.showMail = true
        this.operate = 'mail'
      },
      save (operate) {
        function saveBooks (ctx) {
          ctx.$http.post(`/api/users/${ctx.stuId}/books`, JSON.stringify(ctx.user.books))
          .then(res => res.data)
          .then(() => {
            Toast({
              message: '保存成功'
            })
            ctx.showDel = false
            ctx.showSave = false
            ctx.operate = ''
            Indicator.close()
          })
        }
        function saveEmail (ctx) {
          ctx.$http.post(`/api/users/${ctx.stuId}/email`, JSON.stringify({email: ctx.user.email}))
          .then(res => res.data)
          .then(() => {
            Toast({
              message: '保存邮箱成功'
            })
            ctx.showMail = false
            ctx.showSave = false
            ctx.operate = ''
            Indicator.close()
          })
        }
        if (this.operate === 'add') {
          if (!this.addBook) {
            this.showAdd = false
            this.showSave = false
            return false
          }
          if (this.addBook.length !== 10) {
            Toast({
              message: '书籍号有误，请检查重试'
            })
            return false
          }
          Indicator.open('正在保存')
          this.$http.post('/api/lib', JSON.stringify([this.addBook]))
          .then(res => res.data)
          .then(data => {
            if (data.includes('Error')) {
              Toast({
                message: '书籍号有误，请检查重试'
              })
              Indicator.close()
            } else {
              this.user.books.push(this.addBook)
              saveBooks(this)
              this.showAdd = false
              this.books.push(data[0])
              this.addBook = ''
            }
          })
        } else if (this.operate === 'mail') {
          Indicator.open('正在保存')
          saveEmail(this)
        } else {
          if (this.booksLength === this.books.length) return
          saveBooks(this)
        }
      }
    }
  }
</script>

<style>
  body {
    /* overflow-x: hidden; */
  }
  .login {
    margin-top: 35vh;
  }
  .login-button {
    margin-top: 5px;
  }
  .reLend {
    background: #4caf50;
    color: #fff;
    padding: 4px;
    border-radius: 3px;
  }
  .book-add {
    margin: 5px 0;
  }
  .operate {
    text-align: center;
    margin-top: 5px;
  }
  .operate a {
    width: 45%;
  }
  .fix-fixed {
    width: 100%;
  }
  .search-spinner {
    width: 100%;
    display: flex;
    justify-content: center;
    margin: 10px 0;
  }
</style>
