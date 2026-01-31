export default class Route {
    static keys = ["from", "to", "name", "params", "meta", "view", "link"]
    constructor(mode, routing, replace=false){
        Error.throwIfNull(routing, "Routing");
        Object.freezeProp(this, "mode", mode);
        Object.freezeProp(this, "replace", replace);
        if (typeof routing === "string"){
            Object.freezeProp(this, "to", routing);
            this.parse(routing);
        } else if (Object.isObject(routing)){
            Error.throwIfNotHasOwn(routing, "to", "To");
            for (const key of Route.keys){
                if (Object.hasOwn(routing, key)){
                    Object.freezeProp(this, key, routing[key])
                }
            }
            this.parse(routing.to);
        }
        if (!Object.hasOwn(this, "from")){
            if (mode === "hash"){
                Object.freezeProp(this, "from", location.hash.replace("#",""));
            } else if (mode === "history") {
                Object.freezeProp(this, "from", location.pathname);
            }
        }
        if (!Object.hasOwn(this, "view")){
            Object.freezeProp(this, "view", "default")
        }
    }

    parse(to){
        const url = new URL(to, location.origin);
        Object.sealProp(this, "path", url.pathname);
        if (url.searchParams.size > 0){
            if (!Object.hasOwn(this, "params")){
                Object.freezeProp(this, "params", Object.pure(Object.fromEntries(url.searchParams)));
            } else {
                for (const [key, value] of url.searchParams.entries()){
                    this.params[key] = value
                }
            }
        }
    }
}
