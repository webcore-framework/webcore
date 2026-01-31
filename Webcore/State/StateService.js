import DataBase from "../Base/DataBase.js";

export default class StateService extends DataBase {
    static #instance = null;

    static singleton = true;
    static system = true;
    static serviceName = "state";

    constructor(){
        super()
        if (StateService.#instance){return StateService.#instance;}
        Object.freeze(this);
        StateService.#instance = this;
    }
}
