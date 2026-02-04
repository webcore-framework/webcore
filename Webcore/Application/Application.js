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

    /**
     * 创建应用程序构造器
     * @returns {ApplicationBuilder}
     */
    static createBuilder(){return new ApplicationBuilder();}

    /**
     * 获取配置
     * @param {string} key
     * @returns {any}
     */
    getConfig(key){return this.configuration.get(key)}

    /**
     * 设置配置
     * @param {string} key
     * @param {any} value
     * @returns {any}
     */
    setConfig(key,value){return this.configuration.set(key,value)}

    /**
     * 判断服务是否已安装
     * @param {string} serviceName
     * @returns {boolean}
     */
    hasService(name){return Application.services.has(name)}

    /**
     * 获取服务
     * @param {string} serviceName
     * @returns {any}
     */
    getService(name){return Application.services.resolve(name)}

    /**
     * 安装插件
     * @param {Object} plugin
     * @param {Object?} options
     * @returns {Application}
     */
    usePlugin(plugin,options){this.plugin.use(plugin,options);return this;}

    /**
     * 获取所有服务的名称
     * @returns {string[]}
     */
    serviceNames(){return Application.services.serviceNames()}

    /**
     * 批量解析服务
     * @param {string[]} names
     * @returns {object[]}
     */
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

    /**
     * 加载器
     * @param {string} url
     * @returns {Promise<string>}
     */
    async loader(url){return await URL.loader(url);}


    /**
     * 启动应用程序
     */
    run(){
        console.log("7. 应用程序启动中……");
        if (Object.hasOwn(this, "initial")){this.initial.execute();}
        console.log("9. 应用程序启动完成");
        delete Object.getPrototypeOf(this).run;
    }
}
