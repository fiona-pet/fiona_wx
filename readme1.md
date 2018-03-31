# wx_relax1.1

## 下载依赖包
```
npm install
```

## 开发模式
第一次运行项目，执行以下命令（编译第三发依赖）：
```
npm run buildVendor
```
以后如果package依赖没变，直接
```
npm start
```

## 生产模式
```
npm run build
```
## tip
- 页面传参数：
```
history.push({
  pathname: '/home',
  search: '?the=query',//需要保存的参数，在浏览器地址中显示，用query-string解析
  state: { some: 'state' }//不能保存的参数，不在浏览器地址中显示
})
```
- 代理地址修改：
webpack.config.babel.js->proxy

## 注意事项
- 对webpack配置有疑问请访问：https://webpack.github.io/docs/usage.html
- 对router有疑问请访问：https://reacttraining.com/react-router/web/api/BrowserRouter
- react-weui源码及demo：https://github.com/weui/react-weui
- weui样式：https://weui.github.io/react-weui/#/?_k=hf1qc3


## 框架优化
1、引入插件：DllReferencePlugin和DllPlugin，打包第三方库，建立依赖索引，对框架解耦。
2、引入bundle-loader使项目模块化，懒加载、按需加载js文件
3、使用CommonsChunkPlugin抽取公关代码