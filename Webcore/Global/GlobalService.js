import GlobalData from "./GlobalData.js";

export default class GlobalService {
    static #instance = null;

    constructor(){
        if (GlobalService.#instance){return GlobalService.#instance;}
        Object.freezeProp(this,"system",new GlobalData());
        Object.freezeProp(this,"vars",new GlobalData());
        Object.freezeProp(this,"constants",new GlobalData());
        this.start();
        GlobalService.#instance = this;
        Object.freeze(GlobalService);
    }

    start(){
        this.system.set("framework", Object.pure({
            name: "webcore",
            version: "0.0.1",
            author: "huachen"
        }));
    }
}
