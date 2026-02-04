import ComponentService from "./ComponentService.js";

export default class ComponentTemplate {

    constructor(){
        this.innerHTML = "<slot></slot>";
        this.url = null;
        this.created = false;
        this.fragment = null;
    }

    set html(value){
        if (!this.created){
            Error.throwIfNotString(value, "Component template");
            value = ComponentTemplate.compress(value);
            if (!String.isNullOrWhiteSpace(value) && !value.includes("<") && !value.includes(">")){
                try {
                    this.url = URL.create(value, ComponentService.instance.base);
                } catch  {
                    this.innerHTML = value;
                }
            } else {
                this.innerHTML = value;
            }
            this.created = true;
        }
    }

    async getFragment(){
        if (this.fragment === null){
            if (this.url !== null){
                try {
                    const template = await URL.loader(this.url);
                    this.innerHTML = ComponentTemplate.compress(template);
                } catch {
                    throw new TypeError("Component template loading failed.");
                }
            }

            if (String.isNullOrWhiteSpace(this.innerHTML)){
                this.fragment = document.createDocumentFragment()
            } else {
                const fragment = document.createRange().createContextualFragment(this.innerHTML);
                // html 安全处理
                fragment.querySelectorAll('script').forEach(script => script.remove());
                fragment.querySelectorAll('[onerror]').forEach(el => el.removeAttribute("onerror"));
                this.fragment = fragment;
            }
        }
        this.created = true;
        return this.fragment.cloneNode(true);
    }

    static compress(html){
        return html.replace(/<!--[\s\S]*?-->/g, "").trim();
    }
}
