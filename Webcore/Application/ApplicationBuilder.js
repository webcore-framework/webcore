import FrameworkCore from "../Framework/FrameworkCore.js";
import Application from "./Application.js";
import Configuration from "../Configuration/Configuration.js";
import ServiceManager from "../Services/ServicesManager.js";
import PluginManager from "../Plugin/PluginManager.js";

export default class ApplicationBuilder {
    static #instance = null;
    #application = null;
    #configuration;
    #serviceManager;
    #pluginManager;
    #registry = [];

    constructor(){
        if (ApplicationBuilder.#instance) {return ApplicationBuilder.#instance;}
        // 运行框架核心（有框架依赖的方法）
        new FrameworkCore();
        // 初始化逻辑
        this.#initialization();
        ApplicationBuilder.#instance = this;
    }
    #initialization(){
        // 创建系统配置对象
        this.#configuration = new Configuration();
        // 创建服务容器对象
        this.#serviceManager = new ServiceManager();
        // 创建插件管理服务
        this.#pluginManager = new PluginManager(this.#serviceManager);
        // 创建应用程序
        this.#application = new Application(this.#configuration, this.#serviceManager, this.#pluginManager);

        // 系统初始配置
        this.#configuration.set("base", location.origin);
        this.#configuration.set("environment", window.isSecureContext && location.protocol === "http:" ? "development": "production");
    }

    /**
     * 设置配置
     * @param {string} key
     * @param {any} value
     * @returns {any}
     */
    setConfig(key, value) {
        this.#configuration.set(key, value);
        return this;
    }

    /**
     * 注册服务
     * @param {object} service
     */
    addService(service){
        Error.throwIfNotObject(service, "Registration service configuration");
        this.#serviceManager.register(
            service.name,
            service.service,
            {
                name: service.name,
                singleton: service.singleton,
                dependency: service.dependency || [],
                type: "system",
                global: service.global || false,
            }
        );
        if (service.global === true){
            Object.freezeProp(this.#application, service.name, this.#serviceManager.resolve(service.name));
        }
    }

    /**
     * 构建应用程序
     * @returns {Application}
     */
    build(){
        console.log("5. 各项系统服务已启动");
        return this.#application;
    }
}
