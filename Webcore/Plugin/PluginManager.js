import Application from "../Application/Application.js";

export default class PluginManager {

    constructor(services){
        Object.freezeProp(PluginManager, "services", services);
        Object.freezeProp(PluginManager, "plugins", new Map())
    }


    get pluginNames(){
        return Array.from(PluginManager.plugins.keys());
    }

    // 安装插件
    use(plugin, options = {}) {
        if (!Object.isObject(plugin)){
            throw new TypeError("Invalid plugin.")
        }
        let name = plugin.name || options.name;
        name = String.toNotEmptyString(name, "Plugin name");
        if (PluginManager.plugins.has(name)){
            throw new TypeError("The plugin has already been installed.")
        }
        PluginManager.plugins.set(name, Object.pure(plugin));
        if (typeof plugin.install === "function" && plugin.installed !== true) {
            plugin.install(Application.instance, options);
        }
        if (Object.isObject(plugin.service)){
            Object.pure(plugin.service);
            const service = plugin.service;
            name = String.toNotEmptyString(service.name, "Service name");
            const config = Object.pure({
                global: false,
                singleton: false,
                dependency: [],
                constructor: null,
                type: "plugin",
                ...service
            });
            PluginManager.services.register(name, config.constructor, config);
            if (config.global === true){
                Application.instance[name] = PluginManager.services.resolve(name)
            }
        }
        plugin.installed = true;
        return this;
    }

    // 卸载插件
    unuse(name) {
        if (!PluginManager.plugins.has(name)){return this;}
        const plugin = PluginManager.plugins.get(name);
        if (plugin.installed === true && typeof plugin.uninstall === "function") {
            plugin.instance.uninstall(Application.instance);

        }
        if (Object.isObject(plugin.service)){
            PluginManager.services.delete(plugin.service.name);
        }
        PluginManager.plugins.delete(name);
        plugin.installed = false;
        return this;
    }
}
