export default class Welcome extends webcore.component.builder {

    static tag = 'view-welcome';                      // 组件标签名称（如果省略前缀，会自动添加core-前缀，最终标签名为 core-welcome ）
    static observedAttributes = ['content'];                 // 设置要监听元素的哪些属性（这是原生API，格式不能变）

    // 组件第一步，必须使用 create 方法，设置初始模板或样式等。（可链式调用）
    create(){
        this.template('/src/views/welcome/welcome.html')                    // 设置初始模板
        .styles('/src/views/welcome/welcome.css')                           // 也可通过 url 加载样式表
        .mode('closed')                                                     // 影子DOM模式 (默认值 open)
        .inject(['event', 'cache', 'http', 'reactive'])                     // 依赖服务注入
    }

    // 生命周期
    onCreated(){
        // 自己写的组件逻辑，可以在这里依次调用。（这个没有框架约定或限制了，自己随意发挥了）
        // this.hook();
        console.log("onCreated")
    }

    hook(){
        // 单个获取使用服务（必须先依赖服务注入）
        // const event = this.service('event');
        // const http = this.service('http');

        const {event, cache, http, reactive} = this.services;               // 批量解构获取服务

        // 使用组件封装的 selector 方法获取组件内元素
        const h1 = this.querySelector('h1')

        // 将元素变为响应式元素( reactive.element() 会把 DOM 元素变成响应式，修改 .value 会自动更新页面)
        const content = reactive.element(h1);
        // 可添加额外的回调执行其他逻辑
        content.onchange = (value, oldvalue, element)=>{
            console.log("页面变化前的额外回调:", element, "新值：",value, "; 旧值：", oldvalue);
        };

        // 保存到组件的状态容器
        this.state.content = content;

        // 添加缓存数据（滑动过期10秒钟）
        cache.set('key', 'value', {sliding: 10 },
            ()=>{console.log('key 缓存已过期')}  // 缓存过期回调函数
        );

        // 向 localStorage 添加数据 ( storage 是全局服务，可直接使用)
        webcore.storage.local.set('token', 'jPSrdmIcOjkrKzwTBSbbAWdPUbeInaBtzQXoUBSEraJ');
        webcore.storage.session.set('sid', 'jsojfwejofijhdfhfgdskjfhksfoajwoeifjowegjld');

        // 给元素绑定事件
        event.select(content)   // 使用 event 服务的 select 方法，选择要绑定事件的元素
        .click(                 // 可以链式调用，添加多个事件
            ()=>{content.value = 'Hello World'}
        ).bind();               // 调用 .bind() 绑定生效

        // 主动暴露组件方法，让其他组件调用
        event.expose('welcome', {
            show(arg1, arg2){console.log(`已运行组件暴露的 show 方法，并拿到参数 ${arg1} 和 ${arg2}`)}
        });                    // 没有复杂的组件通讯逻辑，什么父传子、子传父等，统统不需要考虑
        // 其他组件要调用时，只需要：
        const welcomeProvider = event.use("welcome")            // 拿到暴露的所有方法，按需调用
        const welcomeShow = event.use("welcome", "show")        // 只拿暴露的 show 方法，后面调用
        // event.emit("welcome", "show", "a","b")                  // 或直接调用 show 方法


        // 使用 http 服务创建请求客户端
        const api = http.create({
            url: '/src/styles/Welcome.css',
            // baseUrl: '',
            // timeout: 1000,                                               // 超时 1000 毫秒 (1秒)
            // cache: 10                                                    // 缓存 10 秒
        });
        // api.get().then();       //   await api.get()
        // api.post().then();      //   await api.get()
        // api.put().then();       //   await api.get()
        // api.delete().then();    //   await api.get()
    }

    // 组件挂载前
    onBeforeMount(){
        console.log("onBeforeMount")
    }

    // 组件连接时
    onConnected(){
        console.log("Welcome 组件已经插入到 DOM 树")
    }


    // 组件挂载后
    onMounted(){
        console.log("onMounted")
    }

    // 组件断开时
    onDisconnected(){
        console.log("Welcome 组件从页面中卸载");
        // 组件卸载时要做的回收工作
        this.services.event.delete('welcome');            // 删除向外暴露的方法
    }

    // 属性值的变化
    onAttributeChanged(attr, value, old){
        console.log(`组件属性监听：组件 'my-welcome' 的 ${attr} 属性值发生改变: ${old} -> ${value}`);
        if (attr === "content"){this.state.content.value = value;}                             // 监听到属性值变化，就可以改变内容了
    }

    onAdopted(){
        console.log('组件被移动到新文档');
    }

    // 路由前
    onBeforeRoute(route){
        console.log("onBeforeRoute")
        console.log(route)
        return true;
    }

    // 路由后
    onRouted(route){

    }
}
