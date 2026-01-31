export default class ReactiveElement {
    #element = null;
    #value = "";
    #onchange = null;

    constructor(element, content=null){
        if (element instanceof HTMLElement){
            this.#element = element;
        } else {
            this.#element = document.createElement("div");
        }
        if (typeof content === "string"){
            this.#element.textContent = content;
            this.#value = content;
        } else {
            this.#value = this.#element.textContent;
        }
        Object.freeze(this);
    }

    get element(){return this.#element;}
    get value(){return this.#value;}
    set value(value){
        if (typeof this.#onchange === "function" && this.#value !== value){
            this.#onchange(value, this.#value, this.#element);
        }
        this.#value = value;
        this.#element.textContent = value;
    }
    set onchange(value){
        Error.throwIfNotFunction(value, "Change callback")
        this.#onchange=value;
    }

    mount(target){
        if (typeof target === "string"){
            const node = document.querySelector(target);
            if (node){node.append(this.#element)}
        } else if (target instanceof HTMLElement){
            target.append(this.#element);
        }
        return this;
    }

    unmount() {
        this.#element.remove();
        return this;
    }
}
