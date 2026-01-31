import ComponentService from "../Component/ComponentService.js";
import ComponentBuilder from "../Component/ComponentBuilder.js";
import RouteRule from "./RouteRule.js";
import Route from "./Route.js";

export default class RouteSheet {

    constructor(routes){

        Object.freezeProp(this, "paths", new Map());
        Object.freezeProp(this, "names", new Map());

        if (Array.isArray(routes)){
            for (const route of routes){this.set(route)}
        }
    }

    pathname(route){
        if (!(route instanceof Route)){throw new TypeError("Route is invalid.");}
        let path = null;
        if (Object.hasOwn(route, "path")){
            path = route.path;
        } else if (Object.hasOwn(route, "name") && this.names.has(route.name)) {
            path = this.names.get(route.name).path;
            route.path = path;
        }
        if (this.paths.has(path)){
            const rule = this.paths.get(path);
            if (Object.hasOwn(rule, "redirect")){
                path = rule.redirect;
                route.path = path;
            }
        }
        return path;
    }

    parse(pathname){
        Error.throwIfNotString(pathname, "Path name");
        const paths = pathname.replace("/","").split("/");
        let parent = "";
        for (let i = 0;i < paths.length;i ++){
            paths[i] = `${parent}/${paths[i]}`;
            parent = paths[i];
        }
        parent = null;
        return paths;
    }

    get(pathname){
        const paths = this.parse(pathname);
        const routes = [];
        for (const path of paths) {
            if (this.paths.has(path)){
                routes.push(this.paths.get(path))
            }
        }
        return routes;
    }

    set(route, base=""){
        // route = new Route(route);
        if (Object.hasOwn(route, "redirect")){
            this.paths.set(route.path, new RouteRule(route));
            return true;
        }
        Error.throwIfNotHasOwn(route, "path", "Route");
        Error.throwIfNotHasOwn(route, "component", "Route");
        if (typeof route.component !== "string" && typeof route.component !== "function"){
            throw new TypeError('Component invalid.');
        } else if (typeof route.component === "function" &&
            Object.getPrototypeOf(route.component) !== ComponentBuilder){
            throw new TypeError('The component is invalid and is not a "webcore" component.');
        }
        const path = `${base}${String.toNotEmptyString(route.path)}`;
        route.path = path;
        const routerRoute = new RouteRule(route);
        this.paths.set(path, routerRoute);
        if (Object.hasOwn(route, "name")){
            route.name = String.toNotEmptyString(route.name);
            if (this.names.has(route.name)){
                throw new TypeError("Duplicate route name.");
            }
            this.names.set(route.name, routerRoute);
        }
        if (Object.getPrototypeOf(route.component) === ComponentBuilder){
            ComponentService.instance.register(route.component);
        }
        if (Object.hasOwn(route, "children") && Array.isArray(route.children)){
            for (const child of route.children){
                this.set(child, path);
            }
        }
    }
}
