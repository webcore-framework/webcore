export default class ReactiveStore {
    #proxy = null;

    constructor(value = null){
        const proxy = Object.pure();
        proxy.value = value;
        this.#proxy = new Proxy(proxy, {
            get : (target, prop)=>{return target.value;},
            set : (target, prop, value)=>{
                let old = target.value;
                target.value = value;
                if (typeof this.onchange === "function"){this.onchange(value, old);}
                old = null;
                return true;
            },
        });
    }
    get value(){return this.#proxy.value;}
    set value(value){this.#proxy.value = value;}
}
