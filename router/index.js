import Router from 'koa-router'

const index = new Router()

index
  .get('/', async (ctx, next) => {
    // 渲染模板
    await ctx.send(ctx, 'index.html', { root: 'static/index/dist'})
  })
  .get('/world', async (ctx, next) => {
    // 发送静态文件
    await ctx.render('index', { title: 'Koa-Easy' })
  })
  
export default index
