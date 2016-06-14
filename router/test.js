import Router from 'koa-router'

const test = new Router({
  prefix: '/test'
})

test
  .get('/json', ctx => {
    ctx.body = {
      test: 'json'
    }
  })
  .get('/', ctx => {
    ctx.body = 'this is test page!'
  })
  .post('/post', ctx => {
    ctx.body = ctx.request.body
  })

export default test
