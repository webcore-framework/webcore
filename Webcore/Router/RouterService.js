import Application from "../Application/Application.js";
import Router from "./Router.js";
import Route from "./Route.js";

export default class RouterService {

    static singleton = true;
    static system = true;
    static serviceName = "router";

    constructor(cache){
        if (RouterService.instance){return RouterService.instance;}

        // 路由系统
        if (cache){Object.freezeProp(Router, "cache", cache)}
        Object.sealProp(RouterService, "beforeEach", null);
        Object.sealProp(RouterService, "afterEach", null);
        Object.freezeProp(Object.getPrototypeOf(Application.instance), "useRouter", function useRouter(router){
            RouterService.instance.use(router)
        });
        Object.sealProp(this, "base", "");

        // 普通a元素
        Object.sealProp(RouterService, "executed", false);
        Object.freezeProp(RouterService, "handlers", Object.pure());
        const handlers = RouterService.handlers;
        handlers.top = (ev)=>{ev.preventDefault();top.location.replace(ev.currentTarget.dataset.href);};
        handlers.parent = (ev)=>{ev.preventDefault();parent.location.replace(ev.currentTarget.dataset.href);};
        handlers.blank = (ev)=>{ev.preventDefault();self.open(ev.currentTarget.dataset.href, "_blank");};
        handlers.assign = (ev)=>{ev.preventDefault();location.assign(ev.currentTarget.dataset.href);};
        handlers.replace = (ev)=>{ev.preventDefault();location.replace(ev.currentTarget.dataset.href);};


        // 普通页面
        // top.addEventListener("DOMContentLoaded", ()=>{
        //     if (document.documentElement.classList.contains("app")) {
        //         this.init();
        //         this.anchor(document.body);
        //     }
        //     Object.freeze(RouterService);
        // },{once:true});


        Object.freezeProp(RouterService, "instance", this)
    }

    init(){
        if (RouterService.executed){return true;}
        RouterService.handlers.frames = Object.pure();
        const length = top.frames.length;
        for (let i = 0;i < length;i ++){
            const handler = Object.pure();
            handler.frame = top.frames[i];
            handler.assign = (ev)=>{ev.preventDefault();
                handler.frame.location.assign(ev.currentTarget.dataset.href);
            }
            handler.replace = (ev)=>{ev.preventDefault();
                handler.frame.location.replace(ev.currentTarget.dataset.href);
            }
            const name = top.frames[i].name || "view";
            RouterService.handlers.frames[name] = handler;
        }
        RouterService.executed = true;
    }

    anchor(element){
        if (!(element instanceof HTMLElement)) {return false;}
        if (element.childElementCount === 0 && element.parentElement !== null){
            element = element.parentElement
        }
        element.querySelectorAll("a[data-href]").forEach(el=>{
            const target = el.hasAttribute("data-target") ? el.dataset.target.trim() : false;
            const iframe = el.hasAttribute("data-iframe") ? el.dataset.iframe.trim() : false;
            if (target){
                if (target === "top") {el.onclick = RouterService.handlers.top;return true;}
                if (target === "parent") {el.onclick = RouterService.handlers.parent;return true;}
                if (target === "blank") {el.onclick = RouterService.handlers.blank;return true;}
            }
            if (iframe && Object.hasOwn(RouterService.handlers.frames, iframe)){
                if (target && target === "self") {el.onclick = RouterService.handlers.frames[iframe].replace;return true;}
                el.onclick = RouterService.handlers.frames[iframe].assign;return true;
            }
            if (target && target === "self") {el.onclick = RouterService.handlers.replace;return true;}
            el.onclick = RouterService.handlers.assign;return true;
        });
        return true;
    };

    // 使用路由
    use(router){
        Error.throwIfNotObject(router, "Router");
        Object.freezeProp(this, "mode", Router.check(router.mode));
        if (!String.isNullOrWhiteSpace(router.base)){
            try {
                const url = new URL(router.base.trim(), location.origin);
                this.base = url.pathname.replace(/\/+$/, '')
            } catch  {
                throw new URIError("Router base path invalid.")
            }
        }

        // 给 router-view 添加默认样式
        const sheet = new CSSStyleSheet();
        sheet.replaceSync("@layer reset,token,theme,framework,base,layout,component,page,utilitie,override;@layer reset{router-view{box-sizing: border-box;display:block;overflow:auto;scrollbar-width:thin;scroll-behavior:smooth}}");
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

        // 监听地址栏变化
        if (this.mode === "hash"){
            top.onhashchange = function hashchange(event){
                RouterService.router.to(
                    Object.pure({
                        from: new URL(event.oldURL).hash.replace("#",""),
                        to: new URL(event.newURL).hash.replace("#",""),
                        replace: true
                    })
                );
            }
        } else if (this.mode === "history"){
            top.onpopstate = function pathchange(event){
                RouterService.instance.replace(location.pathname.replace(RouterService.instance.base, ""));
            };
        }

        // 配置主路由
        top.addEventListener("DOMContentLoaded", ()=>{
            // 普通页面
            this.init();
            if (document.documentElement.classList.contains("app")) {
                this.anchor(document.body);
            }
            // 单页应用
            const view = document.querySelector("router-view");
            if (view){
                //创建默认路由器
                Object.freezeProp(RouterService, "router", new Router(this.mode, view, router.routes));
                // router-link 点击事件
                Object.freezeProp(RouterService, "invoke", function invoke(event){
                    if (!(event instanceof Event)){return false;}
                    const target = event.currentTarget;
                    const routing = Object.pure({
                        to: target.getAttribute("to"),
                        params: Object.pure(),
                        replace: target.hasAttribute("replace") ? true : false,
                        link: target
                    });
                    // 指定视图名称
                    if (target.hasAttribute("name")){
                        routing.view = target.getAttribute("name")
                    }
                    // 解析参数
                    const attrs = target.getAttributeNames();
                    let arr = null;
                    for (const attr of attrs){
                        arr = attr.split("-");
                        if (arr[0] === "data" && arr[1] === "params"){
                            routing.params[arr[2]] = target.getAttribute(attr)
                        }
                    }
                    RouterService.router.to(routing);
                    arr = null;return true;
                });
                RouterService.handlers.router = (ev)=>{RouterService.invoke(ev)};

                // 添加方法
                Object.freezeProp(this, "push", function push(to){RouterService.router.push(to)});
                Object.freezeProp(this, "replace", function replace(to){RouterService.router.replace(to)});

                // 启动
                RouterService.router.start();
            }
            Object.freeze(RouterService);
        },{once:true});
    }


    // 给 a 标签绑定路由
    bind(element){
        if (element instanceof HTMLElement || element instanceof DocumentFragment) {
            if (element.childElementCount === 0 && element.parentElement !== null){
                element = element.parentElement
            }
            element.querySelectorAll("a[to]").forEach(el=>{
                el.onclick = RouterService.handlers.router;
            });
            this.anchor(element);
            return true;
        }
        return false;
    }

    beforeEach(func){
        Error.throwIfNotFunction(func);
        RouterService.beforeEach = func;
    }
}
