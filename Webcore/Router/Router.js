import ComponentService from "../Component/ComponentService.js";

import RouterService from "./RouterService.js";
import RouteSheet from "./RouteSheet.js";
import Route from "./Route.js";


// router-view 容器元素
class RouterView extends HTMLElement {
    constructor(){super()}
    render(view){
        this.replaceChildren(view);
    }
    clear(){
        this.replaceChildren()
    }
}
customElements.define('router-view', RouterView);


// 路由器
export default class Router {

    constructor(mode, view, routes){
        Object.freezeProp(this, "mode", Router.check(mode));
        Object.sealProp(this, "current", null);
        if (!(view instanceof RouterView)){
            throw new TypeError('Invalid "router-view" element.');
        }
        Object.freezeProp(this, "view", view);
        this.useRoute(routes);
    }

    // to
    to(routing){
        Error.throwIfNotObject(routing)
        if (routing.replace === true){
            this.replace(routing);
        } else {
            this.push(routing);
        }
        return true;
    }

    push(to){
        this.#navigate(new Route(this.mode, to, false));
        return true;
    }

    replace(to){
        this.#navigate(new Route(this.mode, to, true));
        return true;
    }

    // 路由入口
    async #navigate(route){
        // 先执行全局路由守卫
        if (typeof RouterService.beforeEach === "function"){
            const next = await RouterService.beforeEach(route);
            if (next === false){
                return false;
            } else if (Object.isObject(next) && !String.isNullOrWhiteSpace(next.to)){
                return this.to(next);
            }
        }

        let routes = this.routes.get(route.from);

        // 保存跳转前的滚动位置
        for (const route of routes){
            if (Router.cache.has(route.path)){
                const view = Router.cache.get(route.path);
                if (view.parentElement){
                    route.component.position.left = view.parentElement.scrollLeft;
                    route.component.position.top = view.parentElement.scrollTop;
                } else {
                    route.component.position.left = 0;
                    route.component.position.top = 0;
                }
            }
        }

        // 获取真实路径
        const pathname = this.routes.pathname(route);
        if (pathname === null) {return false;}

        // 获取路由表信息
        routes = this.routes.get(pathname);
        if (routes.length === 0){return false;}
        const views = [];

        // 拿到所有组件实例
        for (const route of routes){
            if (typeof route.component === "string"){
                route.component = await ComponentService.instance.load(route.component)
            }
            const component = route.component;
            component.routing = true;
            if (route.cache === true || (typeof route.cache === "number" && route.cache > 0)){
                if (!Router.cache.has(route.path)){
                    Router.cache.set(route.path, new component(), {absolute: route.cache === true ? 0 : route.cache})
                }
                const view = Router.cache.get(route.path);
                view.position = component.position;
                views.push(view);
            } else {
                const view = new component();
                view.position = Object.pure({left:0,top:0});
                views.push(view);
            }
        }
        const root = views[0];
        const target = views.pop();

        // 路由之前的回调
        if (typeof target.beforeRouteCallback === "function"){
            const next = await target.beforeRouteCallback(route);
            if (next === false){
                return false;
            } else if (Object.isObject(next) && !String.isNullOrWhiteSpace(next.to)){
                return this.to(next);
            } else {
                this.#render(pathname, route, views, root, target);
            }
        } else {
            this.#render(pathname, route, views, root, target);
        }
        return true;
    }

    // 路由渲染
    async #render(pathname, route, views, root, target){
        if (views.length > 0){
            try {
                const results = await Promise.all(
                    views.map(view => view.routeCallback(route.view))
                );
                const len = results.length-1;
                if (len > 0){
                    for (let i = 0;i < len;i ++){
                        results[i].render(views[i+1]);
                        this.scrollTo(results[i], views[i+1].position)
                    }
                }
                results[len].render(target);
                this.scrollTo(results[len], target.position)
            } catch {
                return false;
            }
        }
        // 检查一级路由是否已经在DOM中，避免重复渲染
        if (!this.view.contains(root)){
            this.view.render(root);
        }
        this.scrollTo(this.view, root.position);

        // 路由之后的回调
        if (typeof target.onRouted === "function"){
            target.onRouted(route);
        }
        this.#history(pathname, route);
    }

    // 地址栏改变
    #history(pathname, route){
        if (this.mode === "history"){
            pathname = `${RouterService.instance.base}${pathname}`
        } else {
            if (Object.isObject(route.params) && Object.keys(route.params).length > 0){
                pathname = `${RouterService.instance.base}/#${pathname}?${new URLSearchParams(route.params).toString()}`;
            } else {
                pathname = `${RouterService.instance.base}/#${pathname}`;
            }
        }
        if (this.current && this.current.link instanceof HTMLAnchorElement){
            this.current.link.classList.remove("active")
        }
        if (route.link instanceof HTMLAnchorElement){
            route.link.classList.add("active");
        }
        this.current = route;

        if (route.replace){
            top.history.replaceState(route, "", pathname)
        } else {
            top.history.pushState(route, "", pathname)
        }
        return true;
    }

    scrollTo(target, position){
        const smooth = getComputedStyle(target).scrollBehavior === "smooth";
        if (smooth){target.style.scrollBehavior = "auto";}
        if (target.scrollLeft !== position.left){
            target.scrollLeft = position.left;
        }
        if (target.scrollTop !== position.top){
            target.scrollTop = position.top;
        }
        if (smooth){
            target.style.scrollBehavior = "smooth";
        }
    }

    start(to){
        if (this.mode === "history"){
            if (location.pathname.endsWith("/index.html")){
                this.replace("/");
            } else {
                this.replace(location.pathname.replace(RouterService.instance.base,""));
            }
        } else if (location.hash){
            const index = location.hash.indexOf("?");
            if (index > -1){
                this.to({
                    to: location.hash.replace("#",""),
                    replace: true,
                    params: Object.pure(Object.fromEntries(new URLSearchParams(location.hash.slice(index+1))))
                })
            } else {
                this.replace(location.hash.replace("#",""))
            }
        } else {
            this.replace("/");
        }
        return true;
    }


    useRoute(routes){
        Error.throwIfNotArray(routes, "Routes")
        if (Object.hasOwn(this, "routes")){
            for (const route of routes){
                this.routes.set(route);
            }
        } else {
            Object.freezeProp(this, "routes", new RouteSheet(routes));
        }
        return this;
    }

    static check(mode){
        mode = String.toNotEmptyString(mode, "Router mode");
        if (["hash", "history"].includes(mode)){
            return mode;
        } else {
            throw new TypeError('Router mode must be "hash" or "history".')
        }
    }

}
