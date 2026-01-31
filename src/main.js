// const webcore = window.webcore;
import webcore from "../Webcore/App.js";
// import components from "./components/index.js"
import router from "./router/index.js"

// 导入插件
import ViewportService from "/Webcore/Viewport/ViewportService.js";
import SecurityService from "/Webcore/Security/SecurityService.js";

// Configuration 配置
webcore.setConfig('base','http://localhost/');

// 注册全局组件
// webcore.useComponent(components);

// 使用路由
webcore.useRouter(router);

// 安装插件
webcore.usePlugin(ViewportService, {global: true});
webcore.usePlugin(SecurityService, {global: true});


// 初始化
webcore.initial.open = ()=>{console.log('   8.1 自定义初始化逻辑')};
webcore.initial.loaded = ()=>{console.log('   8.2 DOM元素加载后的初始化逻辑')};

// 添加全局路由守卫
// webcore.router.beforeEach((route)=>{
//     console.log(route)
//     return true;
// });

// 启动应用程序
webcore.run();
