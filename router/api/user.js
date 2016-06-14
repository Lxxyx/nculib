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
    const user = await ctx.db.findOne({ name: ctx.params.user })
    if (user) {
      ctx.body = user
    } else {
      userModel.name = ctx.params.user
      ctx.body = await ctx.db.insert(userModel)
    }
  })
  .post('/login', async ctx => {
    const user = ctx.request.body
    const result = await lib.lend(user.username, user.password).catch(e => e)
    if (result.code === 400) {
      throw new ctx.err({ message: result.message, status: result.code })
    } else {
      ctx.body = result
    }
  })
  .get('/:user/lend', async ctx => {
    ctx.body = await lib.lend(ctx.params.user)
  })
  .post('/:user/books', async ctx => {
    const user = { name: ctx.params.user }
    const newBooks = ctx.request.body
    ctx.body = await ctx.db.update(user, {
      $set: { books: newBooks }
    }, { returnUpdatedDocs: true })
  })
  .post('/:user/email', async ctx => {
    const user = { name: ctx.params.user }
    const body = ctx.request.body
    ctx.body = await ctx.db.update(user, {
      $set: { email: body.email }
    }, { upsert: true, returnUpdatedDocs: true })
  })
  .delete('/:user', async ctx => {
    const user = { name: ctx.params.user }
    ctx.body = await ctx.db.update(user, {
      $set: { books: [] }
    }, { returnUpdatedDocs: true })
  })

export default users
