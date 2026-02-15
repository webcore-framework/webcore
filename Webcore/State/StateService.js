import DataBase from "../Base/DataBase.js";

export default class StateService extends DataBase {
    constructor(){
        super()
        if (StateService.instance){return StateService.instance;}
        Object.freezeProp(StateService, "instance", this);
    }
}
