import GlobalData from "./GlobalData.js";

export default class GlobalService {
    static #instance = null;

    constructor(){
        if (GlobalService.#instance){return GlobalService.#instance;}
        Object.freezeProp(this,"system",new GlobalData());
        Object.freezeProp(this,"vars",new GlobalData());
        Object.freezeProp(this,"constants",new GlobalData());
        this.start();
        Object.freeze(this);
        GlobalService.#instance = this;
        Object.freeze(GlobalService);
    }

    start(){

    }
}
