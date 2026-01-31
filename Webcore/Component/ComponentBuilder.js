import Application from "../Application/Application.js";
import ComponentService from "./ComponentService.js";
import ComponentStyles from "./ComponentStyles.js";
import ComponentTemplate from "./ComponentTemplate.js";

export default class ComponentBuilder extends HTMLElement {
    #name = "core-element";
    #mode = "open";
    #inject = [];
    #services = Object.pure();
    #state = Object.pure();
    #root = null;
    #shadow = null;
    #config = null;
    #builder = null;
    #views = null;
    #created = false;
    #render = false;
    #loader = null;

    constructor(){
        super();
        this.#builder = Object.getConstructorOf(this);
        if (Object.hasOwn(this.#builder, "instance")){
            return this.#builder.instance;
        }
        this.#name = this.#builder.tag;
        if (!Object.hasOwn(this.#builder, "template")){this.#builder.template = new ComponentTemplate();}
        if (!Object.hasOwn(this.#builder, "styles")){this.#builder.styles = new ComponentStyles();}

        if (typeof this.create === "function"){this.create()}
        this.#loader = this.#initialize();

        if (this.#builder.routing !== true){
            this.#loader.then(root => {
                if (typeof this.onCreated === "function" && typeof this.onBeforeMount === "function"){
                    Promise.resolve(this.onCreated()).then(
                        ()=>Promise.resolve(this.onBeforeMount())
                    ).then(()=>this.#build(root))
                } else if (typeof this.onCreated === "function"){
                    Promise.resolve(this.onCreated()).then(this.#build(root))
                } else if (typeof this.onBeforeMount === "function") {
                    Promise.resolve(this.onBeforeMount()).then(()=>this.#build(root))
                } else {this.#build(root)}
            });
        }
    }

    // 访问器
    get root(){return this.#root;}
    get shadow(){return this.#shadow;}
    get services(){return this.#services;}
    get config(){return this.#config;}
    get props(){return this.#builder.observedAttributes || null;}
    get name(){return this.#name;}
    get state(){return this.#state;}
    set state(value){this.#state=value;}


    template(html) {
        if (this.#builder.template.created === true){return this;}
        this.#builder.template.html = html;
        return this;
    }
    styles(styles) {
        if (this.#builder.styles.created === true){return this;}
        this.#builder.styles.style = styles;
        return this;
    }
    mode(shadowMode = "open") {
        if (!["open", "closed"].includes(shadowMode)) {
            throw new TypeError('Shadow DOM mode must be either "open" or "closed"');
        }
        this.#mode = shadowMode;
        return this;
    }
    inject(service){
        Error.throwIfNotArray(service, "Component service inject");
        this.#inject = service;
        return this;
    }
    configuration(config){
        this.#config = Application.instance.configuration.create(config);
        return this;
    }


    // 声明周期事件
    connectedCallback(){
        if (this.#render && typeof this.onConnected === "function"){return this.onConnected();}
    }
    async attributeChangedCallback(attr, old, value){
        if (this.#created && typeof this.onAttributeChanged === "function"){
            if (this.#render){
                return this.onAttributeChanged(attr, value, old);
            } else {
                await this.#loader;
                return this.onAttributeChanged(attr, value, old);
            }
        }
    }
    adoptedCallback(){
        if (typeof this.onAdopted === "function"){return this.onAdopted();}
    }
    disconnectedCallback(){
        if (typeof this.onDisconnected === "function"){return this.onDisconnected();}
    }

    // 路由接口
    async routeCallback(name){
        if (this.#render === true){
            if (this.#views !== null){
                const view = this.#views.get(name);
                if (view){
                    view.clear();
                    return view;
                }
            }
            return null;
        } else {
            const root = await this.#loader;
            if (typeof this.onCreated === "function"){
                await Promise.resolve(this.onCreated());
            }
            if (typeof this.onBeforeMount === "function"){
                await Promise.resolve(this.onBeforeMount());
            }
            this.#build(root);
            return this.#views.get(name) || null;
        }
    }

    async beforeRouteCallback(route){
        if (this.#render === true){
            if (typeof this.onBeforeRoute !== "function"){return true;}
            return await Promise.resolve(this.onBeforeRoute(route));
        } else {
            const root = await this.#loader;
            let next = true;

            if (typeof this.onCreated === "function"){
                await Promise.resolve(this.onCreated());
            }
            if (typeof this.onBeforeRoute === "function"){
                next = await Promise.resolve(this.onBeforeRoute(route));
            }
            if (next === true){
                if (typeof this.onBeforeMount === "function"){
                    await Promise.resolve(this.onBeforeMount());
                }
                this.#build(root);
            }
            return next;
        }
    }


    // 公共方法
    querySelector(selector){return this.#root.querySelector(selector)}
    selector(selector){return this.#root.querySelector(selector)}
    service(name) {return Object.hasOwn(this.#services, name) ? this.#services[name] : null;}

    // 私有方法
    async #initialize(){
        this.#shadow = this.attachShadow({ mode: this.#mode });
        this.#builder.styles.created = true;
        this.#created = true;

        // 加载样式
        if (this.#builder.styles.has){
            const styleSheet = await this.#builder.styles.getStyleSheet();
            this.#shadow.adoptedStyleSheets = styleSheet;
        }

        // 加载 HTML
        this.#root = await this.#builder.template.getFragment();
        this.#shadow.append(document.createElement("div"));
        this.#shadow.firstElementChild.classList.add("root");

        // 解析服务
        if (this.#inject.length > 0){
            this.#services = Application.instance.resolve(this.#inject);
        }

        return this.#root;
    }

    // 执行组件逻辑后的挂载方法
    #build(root){
        // 获取 router-view
        const views = root.querySelectorAll("router-view");
        if (views.length > 0){
            this.#views = new Map();
            for (let i = 0;i < views.length;i ++){
                const name = views[i].hasAttribute("name") ? views[i].getAttribute("name") : "default";
                this.#views.set(name, views[i])
            }
        }
        this.#render = true;
        this.#loader = null;

        this.#root = this.#shadow.firstElementChild;
        Application?.instance?.router?.bind(root);
        this.#root.replaceChildren(root);

        // 首次挂载后钩子
        if (typeof this.onMounted === "function"){this.onMounted();}
    }

    static check(name){
        name = String.toNotEmptyString(name, "Component tag name");
        if (!name.includes("-")){name = `core-${name}`;}
        return name;
    }
}
