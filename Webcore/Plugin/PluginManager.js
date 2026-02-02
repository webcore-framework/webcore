import Application from "../Application/Application.js";

export default class PluginManager {

    constructor(services){
        Object.freezeProp(PluginManager, "services", services);
        Object.freeze(this);
    }

    get(name){return PluginManager.services.resolve(name)}

    // 安装插件
    use(name, plugin, options = {}) {
        if (typeof plugin !== "function"){throw new TypeError("Invalid plugin.")}
        name = name || plugin.serviceName;
        name = String.toNotEmptyString(name, "Plugin service name");
        if (PluginManager.services.has(name)) {
            throw new Error(`The "${name}" plugin has been registered.`);
        }
        if (typeof plugin.install === "function") {
            plugin.install(Application.instance, options);
        }
        const config = Object.pure({
            singleton: false,
            dependency: [],
            type: "plugin",
            installedAt: new Date()
        });
        if (plugin.singleton === true){config.singleton = true}
        if (Array.isArray(plugin.dependency)){config.dependency = dependency}
        if (Object.isObject(options)){Object.assign(config, options)}
        PluginManager.services.register(name, plugin, config);
        if (plugin.system === true){
            Object.freezeProp(Application.instance, name, PluginManager.services.resolve(name))
        } else if (options.global === true){
            Application.instance[name] = PluginManager.services.resolve(name)
        }
        return this;
    }

    // 卸载插件
    unuse(name) {
        if (!PluginManager.services.has(name)){return this;}
        const plugin = PluginManager.services.get(name);
        if (typeof plugin.uninstall === "function") {
            plugin.instance.uninstall(Application.instance);
        }
        PluginManager.services.delete(name);
        return this;
    }
}
