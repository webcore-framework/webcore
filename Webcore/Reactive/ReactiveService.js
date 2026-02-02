import ReactiveElement from "./ReactiveElement.js";
import ReactiveStore from "./ReactiveStore.js";

export default class ReactiveService {
    static #instance = null;

    constructor(){
        if (ReactiveService.#instance){
            return ReactiveService.#instance;
        }
        Object.freeze(ReactiveElement);
        Object.freeze(ReactiveStore);
        ReactiveService.#instance = this;
    }

    element(target = "div", content){
        if (target instanceof HTMLElement){
            return new ReactiveElement(target, content);
        } else {
            try {
                if (typeof target !== "string"){target = "div";}
                const element = document.createElement(target);
                return new ReactiveElement(element, content);
            } catch  {
                return new ReactiveElement(document.createElement("div"), content);
            }
        }
    }

    store(value){
        return new ReactiveStore(value);
    }
}
