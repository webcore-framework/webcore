export default class EventBuilder {
    #element = null;
    #handlers = Object.pure();
    #options = Object.pure();

    constructor(element){
        Error.throwIfNotElement(element, "Event target");
        this.#element = element;
        Object.freeze(this);
    }

    get element(){return this.#element;}
    get handlers(){return this.#handlers;}
    get options(){return this.#options;}

    on(event, handler, options = null){
        Error.throwIfWhiteSpace(event, "Event name");
        Error.throwIfNotFunction(handler, "Event handler");
        event = event.trim();
        this.#handlers[event] = handler;
        if (options){
            this.#options[event] = options;
        }
        return this;
    }

    bind(){
        Error.throwIfNull(EventBuilder.EventService, "Event service instance");
        EventBuilder.EventService.register(this);
        return this;
    }

    // 代理常用事件方法
    once(event, handler, options = null){
        if (!Object.isObject(options)){options = Object.pure()}
        options.once = true;
        return this.on(event, handler, options);
    }
    click(handler, options) {return this.on("click", handler, options);}
    pointerdown(handler, options) {return this.on("pointerdown", handler, options);}
    pointerup(handler, options) {return this.on("pointerup", handler, options);}
    submit(handler, options) {return this.on("submit", handler, options);}
    reset(handler, options) {return this.on("reset", handler, options);}
    invalid(handler, options) {return this.on("invalid", handler, options);}
    resize(handler, options) { return this.on("resize", handler, options);}
    scroll(handler, options) {return this.on("scroll", handler, options);}
    focus(handler, options) {return this.on("focus", handler, options);}
    blur(handler, options) {return this.on("blur", handler, options);}
    change(handler, options) {return this.on("change", handler, options);}
    input(handler, options) {return this.on("input", handler, options);}
    keydown(handler, options) {return this.on("keydown", handler, options);}
    toggle(handler, options) {return this.on("toggle", handler, options);}
    show(handler, options) {return this.on("show", handler, options);}
    open(handler, options) {return this.on("open", handler, options);}
    close(handler, options) {return this.on("close", handler, options);}
    error(handler, options) {return this.on("error", handler, options);}
    message(handler, options) {return this.on("message", handler, options);}
    dblclick(handler, options) {return this.on("dblclick", handler, options);}
    contextmenu(handler, options) {return this.on("contextmenu", handler, options);}
    hover(enterHandler, leaveHandler, options) {this.on("mouseenter", enterHandler, options);this.on("mouseleave", leaveHandler, options);return this;}
}
