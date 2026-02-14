export default class Route {
    static keys = ["name", "params", "meta", "view", "link"]
    constructor(mode, routing, from=null, replace=false){
        Error.throwIfNull(routing, "Routing");
        Object.freezeProp(this, "mode", mode);
        Object.freezeProp(this, "replace", replace);

        // 解析路由配置
        if (Object.isObject(routing)){
            for (const key of Route.keys){
                if (Object.hasOwn(routing, key)){
                    Object.freezeProp(this, key, routing[key])
                }
            }
        }

        // 解析路径和查询参数
        this.parse(routing);

        // 保存上一次路由
        if (from instanceof Route){
            Object.freezeProp(this, "from", from.to);
        } else {
            Object.freezeProp(this, "from", "/");
        }
        // 指定视图名称
        if (!Object.hasOwn(this, "view")){
            Object.freezeProp(this, "view", "default")
        }
    }

    // 解析查询参数
    parse(routing){
        let to = routing;
        if (Object.isObject(routing)){
            Error.throwIfNotHasOwn(routing, "to", "Route to");
            to = routing.to;
        }
        if (typeof to !== "string"){Error.throwIfWhiteSpace(to, "Route to")}
        const url = new URL(to, location.origin);
        // 解析 path
        Object.sealProp(this, "path", url.pathname);
        // 解析查询参数
        if (Object.isObject(this.params)){
            if (Object.keys(this.params).length > 0){
                Object.sealProp(this, "to", `${url.pathname}?${new URLSearchParams(this.params).toString()}`);

            } else if (url.searchParams.size > 0){
                Object.sealProp(this, "to", `${url.pathname}?${url.searchParams.toString()}`);
                for (const [key, value] of url.searchParams.entries()){
                    this.params[key] = value
                }
            }
        } else if (url.searchParams.size > 0) {
            Object.freezeProp(this, "params", Object.pure(Object.fromEntries(url.searchParams)));
        } else {
            Object.sealProp(this, "to", url.pathname);
        }
        to = null;
    }
}
