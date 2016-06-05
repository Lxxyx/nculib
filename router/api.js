import Router from 'koa-router'
import lib from 'ncu-libary'

import users from './api/user'

const api = new Router({
  prefix: '/api'
})

const libIp = `http://210.35.251.243/opac/item.php?marc_no=`

api
  .get('/', (ctx, next) => {
    ctx.body = 'This is Api page'
  })
  .post('/lib', async (ctx, next) => {
    let books = ctx.request.body
    let lists = []
    books.forEach(book => lists.push(`${libIp}${book}`))
    ctx.body = await lib.booksInfo(lists)
  })

api.use(users.routes())

export default api