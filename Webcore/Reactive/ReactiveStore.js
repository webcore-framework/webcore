export default class ReactiveStore {
    #proxy = null;

    constructor(value = null){
        const proxy = Object.pure();
        proxy.value = value;
        this.#proxy = new Proxy(proxy, {
            get : (target, prop)=>{return target.value;},
            set : (target, prop, value)=>{
                if (typeof this.onchange === "function"){this.onchange(value, target.value);}
                target.value = value;
                return true;
            },
        });
    }
    get value(){return this.#proxy.value;}
    set value(value){this.#proxy.value = value;}
}
