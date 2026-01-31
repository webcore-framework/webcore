import Home from "../views/Home/Home.js";
import HelloWorld from "../views/HelloWorld/HelloWorld.js";

const router = {
    mode: "hash",
    base: "/",
    routes: [
        {
            path: "/",
            redirect: '/home',
        },
        {
            path: "/home",
            name: "Home",
            cache: true,
            component: Home,
            meta: {title: '首页'},
            children: [
                {
                    path: "/welcome",
                    name: "Welcome",
                    cache: true,
                    // 用 url 按需加载、远程加载
                    component: '/src/views/Welcome/welcome.js',
                    meta: {title: '欢迎'}
                },
                {
                    path: "/helloworld",
                    name: "HelloWorld",
                    cache: true,
                    // 直接使用组件
                    component: HelloWorld,
                    meta: {title: 'Hello World'},
                }
            ]
        }
    ]
};

export default router;
