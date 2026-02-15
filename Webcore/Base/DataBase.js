export default class DataBase {
    constructor(data = null){
        if (Object.isObject(data)){
            for (const [key,value] of Object.entries(data)){
                this[key] = value
            }
        }
    }

    get length(){return Object.keys(this).length}
    has(key){return Object.hasOwn(this, key)}
    set(key, value){
        key = String.toNotEmptyString(key, "Key");
        this[key] = value;
        return this;
    }
    get(key){return this.has(key) ? this[key] : null}
    keys(){return Object.keys(this)}
    entries() {return Object.entries(this)}
    delete(key){
        if(this.has(key)){delete this[key]}
        return this;
    }
    clear(){
        for (const key of Object.keys(this)){delete this[key]}
        return true
    }
}
