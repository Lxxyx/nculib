import Router from 'koa-router'
import lib from 'ncu-libary'

const users = new Router({
  prefix: '/users'
})

const userModel = {
  name: '',
  books: [],
  email: ''
}

users
  .get('/:user', async ctx => {
    let user = await ctx.db.findOne({ name: ctx.params.user })
    if (user) {
      ctx.body = user
    } else {
      userModel.name = ctx.params.user
      ctx.body = await ctx.db.insert(userModel)
    }
  })
  .get('/:user/lend', async ctx => {
    ctx.body = await lib.lend(ctx.params.user)
  })
  .post('/:user/books', async ctx => {
    let user = { name: ctx.params.user }
    let newBooks = ctx.request.body
    ctx.body = await ctx.db.update(user, {
      $set: { books: newBooks }
    }, { returnUpdatedDocs: true })
  })
  .post('/:user/email', async ctx => {
    let user = { name: ctx.params.user }
    let body = ctx.request.body
    ctx.body = await ctx.db.update(user, {
      $set: { email: body.email }
    }, { upsert: true, returnUpdatedDocs: true })
  })
  .delete('/:user', async ctx => {
    let user = { name: ctx.params.user }
    ctx.body = await ctx.db.update(user, {
      $set: { books: [] }
    }, { returnUpdatedDocs: true })
  })

export default users