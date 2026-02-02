import webcore from "../Webcore/App.js";
// import components from "./components/index.js"
import router from "./router/index.js"

// 导入插件
import ViewportService from "/Webcore/Viewport/ViewportService.js";
import SecurityService from "/Webcore/Security/SecurityService.js";

const app = webcore;
// const app = window.webcore;

// Configuration 配置
app.setConfig('base','http://localhost/');

// 注册全局组件
// app.useComponent(components);

// 使用路由
app.useRouter(router);

// 安装插件
app.usePlugin("viewport", ViewportService, {global: true});
app.usePlugin("security", SecurityService, {global: true});


// 初始化
app.initial.open = ()=>{console.log('   8.1 自定义初始化逻辑')};
app.initial.loaded = ()=>{console.log('   8.2 DOM元素加载后的初始化逻辑')};

// 添加全局路由守卫
app.router.beforeEach((route)=>{
    console.log("全局路由守卫")
    return true;
});

// 启动应用程序
app.run();
