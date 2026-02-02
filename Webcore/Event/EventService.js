import EventBuilder from "./EventBuilder.js";
import EventProvider from "./EventProvider.js";

export default class EventService {
    constructor(){
        if (EventService.instance){return EventService.instance;}
        Object.sealProp(EventService, "handlers", new WeakMap());
        Object.freezeProp(EventProvider, "provider", new EventProvider());
        Object.freezeProp(EventService, "invoke", function invoke(event) {
            const type = event.type;
            let handler = null;
            if (this.instance.has(event.currentTarget, type)){
                handler = EventService.handlers.get(event.currentTarget)[type];
            } else if (this.instance.has(event.target, type)) {
                handler = EventService.handlers.get(event.target)[type];
            }
            if (typeof handler === "function") {
                try {
                    return handler(event);
                } catch (error) {
                    console.error("Event emit error:", error);
                    return false;
                }
            }
            return false;
        });

        Object.freezeProp(EventService, "handler", (event)=>{return EventService.invoke(event)});
        Object.freezeProp(EventBuilder, "EventService", this);
        Object.freeze(EventBuilder);
        Object.freeze(this);
        Object.freezeProp(EventService, "instance", this);
    }

    // 事件通讯
    // 暴露方法，其他组件调用
    expose(name, handlers){return EventProvider.provider.expose(name, handlers);}
    use(name, event){return EventProvider.provider.use(name, event);}
    delete(name){return EventProvider.provider.delete(name);}


    // 选择要绑定事件的元素
    select(element){
        if (Object.isElement(element)){
            return new EventBuilder(element);
        } else if (Object.isClassInstance(element, "ReactiveElement")){
            return new EventBuilder(element.element);
        } else {
            throw new ReferenceError("Invalid element.");
        }
    }
    // EventBuilder 内部调用绑定事件
    register(builder){
        try {
            if (builder instanceof EventBuilder){
                EventService.handlers.set(builder.element, builder.handlers);
                for (const event of Object.keys(builder.handlers)){
                    if (Object.hasOwn(builder.options, event)){
                        builder.element.addEventListener(event, EventService.handler, builder.options[event]);
                    } else {
                        builder.element.addEventListener(event, EventService.handler);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to add event listener:", error);
            return false;
        }
    }

    has(target, event){
        if (String.isNullOrWhiteSpace(event)){return false;}
        if (typeof target === "string"){return EventProvider.provider.has(target, event);}
        if (!(target instanceof HTMLElement)){return false;}
        if (!EventService.handlers.has(target)){return false;}
        return Object.hasOwn(EventService.handlers.get(target), event.trim());
    }
    emit(target, event, ...args){
        if (!this.has(target, event)){return false;}
        let handler = null;
        if (typeof target === "string"){
            handler = EventProvider.provider.use(target, event);
        } else {
            handler = EventService.handlers.get(target)[event.trim()];
        }
        try {
            if (typeof handler === "function") {return handler(...args);}
        } catch (error) {
            console.error("Event emit error:", error);
            throw error;
        }
        return false;
    }

    // 移除事件监听
    remove(target, event = null) {
        if (this.has(target)){
            let handlers = EventService.handlers.get(target);
            if (typeof event === "string"){
                if (!Object.hasOwn(handlers, event)) {return this;}
                handlers[event] = null;
                delete handlers[event];
                target.removeEventListener(event, EventService.handler);
                if (Object.keys(handlers).length === 0) {EventService.handlers.delete(target);}
            } else {
                for (const type of Object.keys(handlers)) {
                    handlers[type] = null;
                    target.removeEventListener(type, EventService.handler);
                }
                handlers = null;
                EventService.handlers.delete(target);
            }
        }
        return this;
    }

    destroy() {
        EventService.handlers = new WeakMap();
        EventProvider.provider.clear();
        return true;
    }

    target(event, tag, depth=10){
        if (!(event instanceof Event)) {return null;}
        if (!event.target || !event.currentTarget) {return null;}
        let target = event.target;
        const current = event.currentTarget;
        if (typeof tag !== "string"){return target;}
        tag = tag.trim().toUpperCase();
        if (!tag) {return target;}
        if (target === current) {
            if (current.nodeName === tag){return target;} else {return null;}
        }

        if (typeof tag === "string"){
            let step = 0;
            while (step < depth && target != current){
                if (target.nodeName === tag) {return target;}
                if (!target.parentElement) {return null;}
                target = target.parentElement;
                step ++;
            }
        }
        return null;
    };

    debounce(func, delay = 300, immediate = false) {
        let timer = null;
        return function(...args) {
            const context = this;
            if (timer) clearTimeout(timer);
            if (immediate && !timer) {func.apply(context, args); }
            timer = setTimeout(() => {
                timer = null;
                if (!immediate) {func.apply(context, args);}
            }, delay);
        };
    }

    throttle(func, delay = 300, trailing = true) {
        let timer = null;
        let lastExecTime = 0;
        return function(...args) {
            const context = this;
            const currentTime = Date.now();
            const remainingTime = delay - (currentTime - lastExecTime);
            if (timer) {clearTimeout(timer);timer = null;}
            if (remainingTime <= 0) {
                func.apply(context, args);
                lastExecTime = currentTime;
            } else if (trailing && !timer) {
                timer = setTimeout(() => {
                    func.apply(context, args);
                    lastExecTime = Date.now();
                    timer = null;
                }, remainingTime);
            }
        };
    }
}
