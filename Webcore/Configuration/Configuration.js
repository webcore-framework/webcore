import DataBase from "../Base/DataBase.js";

export default class Configuration extends DataBase {
    constructor(config=null){
        if (Object.isObject(config)){
            for (const key of Object.keys(config)){
                if (Object.hasPrototype(config[key])){Object.setPrototypeOf(config[key], null);}
            }
        }
        super(config);
    }
    create(config=null){return new Configuration(config);}
}
