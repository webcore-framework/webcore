class ViewportObserver {

    constructor(){
        if (ViewportObserver.instance){return ViewportObserver.instance;}
        Object.freezeProp(ViewportObserver, "observers", new Set());
        Object.freeze(this);
        Object.freezeProp(ViewportObserver, "instance", this);
    }

    removed(target, func, options={childList: true, subtree: true}){
        if (typeof target === "string"){target = document.querySelector(target);}
        if (!(target instanceof HTMLElement)) {throw new TypeError("Invalid target element or selector.");}
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.removedNodes.length > 0){
                    for (let i = 0;i < mutation.removedNodes.length;i ++) {
                        const node = mutation.removedNodes[i];
                        if (node.nodeType === Node.ELEMENT_NODE) {func(node);}
                    }
                }
            });
        });
        observer.observe(target, options);
        ViewportObserver.observers.add(observer);
        return ()=>{
            observer.disconnect();
            ViewportObserver.observers.delete(observer);
        };
    }

    added(target, func, options={childList: true, subtree: true}){
        if (typeof target === "string"){target = document.querySelector(target);}
        if (!(target instanceof HTMLElement)) {throw new TypeError("Invalid target element or selector.");}
        if (typeof func !== "function"){throw new TypeError("Callback function is required.")}
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length > 0){
                    for (let i = 0;i < mutation.addedNodes.length;i ++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType === Node.ELEMENT_NODE) {func(node);}
                    }
                }
            });
        });
        observer.observe(target, options);
        ViewportObserver.observers.add(observer);
        return ()=>{
            observer.disconnect();
            ViewportObserver.observers.delete(observer);
        };
    }

    attributes(target, func, attributes=[]) {
        if (typeof target === "string") {target = document.querySelector(target);}
        if (!(target instanceof HTMLElement)) {throw new TypeError("Invalid target element or selector.");}
        if (typeof func !== "function") {throw new TypeError("Callback function is required.");}
        const attributeList = Array.isArray(attributes) ? attributes : [attributes];
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === "attributes" && mutation.target.nodeType === Node.ELEMENT_NODE) {
                    const attributeName = mutation.attributeName;
                    if (attributeList.length === 0 || attributeList.includes(attributeName)) {
                        func(target, attributeName, mutation.oldValue, target.getAttribute(attributeName));
                    }
                }
            });
        });
        observer.observe(target, {
            attributes: true,
            attributeOldValue: true,
            subtree: false,
            childList: false,
            characterData: false
        });
        ViewportObserver.observers.add(observer);

        return () => {
            observer.disconnect();
            ViewportObserver.observers.delete(observer);
        };
    }

    visible(target, func, options={}, unobserve=true){
        if (!(target instanceof HTMLElement) && typeof target !== "string" ) {
            throw new TypeError("Target must be an HTMLElement or selector string");
        }
        if (typeof func !== "function"){throw new TypeError("Callback function is required")}
        const observer = new IntersectionObserver((entries)=>{
            for (const entry of entries){
                if (entry.isIntersecting && entry.target.nodeType === Node.ELEMENT_NODE){
                    func(entry.target);
                    if (unobserve){observer.unobserve(entry.target);}
                }
            }
        }, options);
        if (target instanceof HTMLElement){
            observer.observe(target);
        } else if (typeof target === "string") {
            document.querySelectorAll(target).forEach((el)=>{
                if (el.nodeType === Node.ELEMENT_NODE) {observer.observe(el);}
            });
        }
        ViewportObserver.observers.add(observer);
        return () => {
            observer.disconnect();
            ViewportObserver.observers.delete(observer);
        };
    }

    disconnect() {
        for (const observer of ViewportObserver.observers) {
            observer.disconnect();
        }
        ViewportObserver.observers.clear();
    }
}


// 默认导出插件
export default {
    // 插件名称
    name: "observer",

    // 插件安装
    install: function install(app){
        if (app){
            Object.freezeProp(app.viewport, "observe", new ViewportObserver())
        }
    },
};
