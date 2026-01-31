export default class RouteRule {
    static keys = ["path","name","redirect","component","cache","meta","params"];

    constructor(route){
        if (Object.isObject(route)){
            for (const key of RouteRule.keys){
                if (Object.hasOwn(route,key)){
                    Object.sealProp(this, key, route[key]);
                }
            }
            if (!Object.hasOwn(this, "cache")){
                Object.freezeProp(this, "cache", false);
            }
            if (Object.hasOwn(this, "params") && Object.isObject(this.params)){
                Object.pure(this.params);
                for (const value of Object.values(this.params)){
                    Object.pure(value);
                }
            }
        }
    }
}
