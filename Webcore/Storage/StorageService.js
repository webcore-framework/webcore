import StorageStore from "./StorageStore.js";
// import Database from "./Database.js";

export default class StorageService {
    static #instance = null;

    static singleton = true;
    static system = true;
    static serviceName = "storage";

    constructor(){
        if (StorageService.#instance){return StorageService.#instance;}
        Object.freezeProp(Map.prototype, "toObject",
            function toObject(){
                const obj = Object.pure();
                for (const [key, value] of this.entries()){
                    if (String.isNumberOrString(key)){obj[key] = value;}
                }
                return obj;
            }
        );
        Object.freezeProp(Map.prototype, "toJSON",function toJSON(){return this.toObject();});
        Object.freezeProp(Set.prototype, "toArray",function toArray(){return Array.from(this);});
        Object.freezeProp(Set.prototype, "toJSON",function toJSON(){return this.toArray();});

        Object.freezeProp(this, "local", new StorageStore(localStorage));
        Object.freezeProp(this, "session", new StorageStore(sessionStorage));
        Object.freezeProp(this, "database", null);
        StorageService.#instance = this;
        Object.freeze(StorageService);
    }
}
