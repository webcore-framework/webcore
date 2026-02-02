import Application from "../Application/Application.js";
import Component from "./Component.js";
import ComponentBuilder from "./ComponentBuilder.js";
import ComponentStyles from "./ComponentStyles.js";

export default class ComponentService {
    #components = new Map();

    constructor(){
        if (ComponentService.instance) {return ComponentService.instance;}
        Object.freezeProp(this, "builder", ComponentBuilder);
        Object.sealProp(this, "base", location.origin);
        Object.sealProp(ComponentStyles, "base", []);
        this.styles("@layer reset,token,theme,base,layout,component,view,utilitie,override;@layer reset{:host{box-sizing:border-box;contain:content}header,nav,main,footer,article,section,aside{box-sizing:border-box}h1,h2,h3,h4,h5,h6{box-sizing:border-box}ul,ol,li,dl,dt,dd{box-sizing:border-box}div,p,span,a,i,img,svg,button{box-sizing:border-box}dialog,details,summary{box-sizing:border-box}router-view{box-sizing: border-box;display:block;overflow:auto;scrollbar-width:thin}body,h1,h2,h3,h4,h5,h6,p{margin:0}ol,ul,dl,dd,figure,blockquote{margin:0}img,video{width:100%;font-size:inherit;vertical-align:top}a{text-decoration-line:none;vertical-align:middle}ul,ol{padding:0;list-style-position:inside;list-style-type:none}button{outline:none;font-size:inherit;font-family:inherit;white-space:nowrap;border:none;appearance:none;cursor:pointer}button:focus{outline:none}a[to],a[data-href],a[data-to]{cursor:pointer}dialog{overscroll-behavior-y:contain}a,img{-webkit-user-drag:none}a,summary,button,svg{-webkit-user-select:none;user-select:none}a,li,button,[onclick]{-webkit-tap-highlight-color:transparent}}");
        Object.freezeProp(Object.getPrototypeOf(Application.instance), "useComponent", function useComponent(components){
            ComponentService.instance.use(components)
        });
        Object.freezeProp(ComponentService, "instance", this);
        Object.freeze(ComponentService);
    }

    async load(url, tag){
        url = URL.create(url);
        try {
            const request = await import(url.href);
            const component = request.default;
            this.register(component, tag);
            return component;
        } catch {
            throw new Error("Component loading failed.");
        }
    }

    has(name){
        name = ComponentBuilder.check(name);
        return this.#components.has(name);
    }

    get(name){
        name = ComponentBuilder.check(name);
        if (!this.#components.has(name)){
            throw new Error("Component not registered, please register first");
        }
        return this.#components.get(name).createInstance();
    }
    getClass(name){
        name = ComponentBuilder.check(name);
        if (!this.#components.has(name)){
            throw new Error("Component not registered, please register first");
        }
        return this.#components.get(name).getComponentClass();
    }

    register(component, tag){
        if (Object.getPrototypeOf(component) !== ComponentBuilder){
            throw new Error('The component is invalid and is not a "webcore" component.');
        }
        if (String.isNullOrWhiteSpace(tag)){
            if (String.isNullOrWhiteSpace(component.tag)){throw new Error("Missing component tag name.");}
            tag = ComponentBuilder.check(component.tag)
        } else {
            tag = ComponentBuilder.check(tag);
        }
        if (!this.#components.has(tag)){
            try {
                customElements.define(tag, component);
                const meta = new Component(tag, component);
                this.#components.set(tag, meta);
                console.log(`Component "${tag}" registered successfully.`);
                return meta;
            } catch (error) {
                throw new Error(`Failed to register component "${tag}": ${error.message}.`);
            }
        }
        return this.#components.get(tag);
    }

    registerAll(components) {
        if (Object.isObject(components)){
            Object.entries(components).forEach(([tag, component]) => {
                this.register(component, tag);
            });
        } else if (Array.isArray(components)){
            for (const component of components){
                this.register(component);
            }
        }
        return this;
    }

    use(components){
        if (Object.getPrototypeOf(components) === ComponentBuilder){
            this.register(components);
        } else {
            this.registerAll(components);
        }
        return this;
    }

    clear() {
        this.#components.clear();
        return this;
    }

    async styles(style){
        if (typeof style === "string"){
            if (style.endsWith(".css")){style = await URL.loader(style);}
            ComponentStyles.base.push(ComponentStyles.compress(style));
        }
    }

    validName(name){
        return ComponentBuilder.check(name);
    }
}
