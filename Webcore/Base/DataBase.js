export default class DataBase {
    #data = null;

    constructor(data = null){
        if (Object.isObject(data)){
            this.#data = Object.pure(data);
        } else {this.#data = Object.pure()}
        Object.freeze(this);
    }

    get length(){return Object.keys(this.#data).length}
    has(key){return Object.hasOwn(this.#data, key)}
    set(key, value){
        key = String.toNotEmptyString(key, "Key");
        this.#data[key] = value;return this;
    }
    get(key){return this.has(key) ? this.#data[key] : null;}
    keys(){return Object.keys(this.#data);}
    entries() {return Object.entries(this.#data);}
    delete(key){if(this.has(key)){delete this.#data[key]}return this;}
    clear(){for (const key of Object.keys(this.#data)){delete this.#data[key]}return true;}
}
