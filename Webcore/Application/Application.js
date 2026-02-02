import ApplicationBuilder from "./ApplicationBuilder.js";

export default class Application {
    constructor(configuration, services, plugin){
        if (Application.instance) {return Application.instance;}
        Object.freezeProp(this, "configuration", configuration);
        Object.freezeProp(this, "plugin", plugin);
        Object.freezeProp(Application, "services", services);
        Object.freezeProp(Application, "instance", this);
        Object.freeze(Application);
    }

    static createBuilder(){return new ApplicationBuilder();}

    getConfig(key){return this.configuration.get(key)}
    setConfig(key,value){return this.configuration.set(key,value)}
    getService(name){return Application.services.resolve(name)}
    getPlugin(name){return this.plugin.get(name)}
    usePlugin(name,plugin,options){this.plugin.use(name,plugin,options);return this;}
    hasService(name){return Application.services.has(name)}
    serviceNames(){return Application.services.serviceNames()}
    resolve(names){
        Error.throwIfNotArray(names, "Service names")
        const services = Object.pure();
        for (const name of names){
            if (Application.services.has(name)){
                services[name] = Application.services.resolve(name);
            }
        }
        return services;
    }

    async loader(url){return await URL.loader(url);}

    run(){
        console.log("7. 应用程序启动中……");
        if (Object.hasOwn(this, "initial")){this.initial.execute();}
        console.log("9. 应用程序启动完成");
        delete Object.getPrototypeOf(this).run;
    }
}
