import DataBase from "../Base/DataBase.js";

export default class StateService extends DataBase {
    static #instance = null;

    constructor(){
        super()
        if (StateService.#instance){return StateService.#instance;}
        Object.freeze(this);
        StateService.#instance = this;
    }
}
