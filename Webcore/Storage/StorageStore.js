export default class StorageStore {
    constructor(storage){
        Object.freezeProp(this, "data", storage);
    }

    get length(){return this.data.length;}

    has(key){
        key = String.toNotEmptyString(key,"Key");
        return this.data.getItem(key) !== null;
    }
    set(key, value){
        key = String.toNotEmptyString(key,"Key");
        if (value == null){
            this.data.removeItem(key);
            return this;
        }
        this.data.setItem(key, JSON.stringify(value));
        return this;
    }
    get(key, defaultValue = null){
        key = String.toNotEmptyString(key,"Key");
        const value = this.data.getItem(key);
        try {
            return value === null ? defaultValue : JSON.parse(value);
        } catch (error) {
            console.warn(`Failed to parse JSON for key "${key}": `, error);
            return value;
        }
    }
    keys(){return Object.keys(this.data);}

    entries() {
        const result = [];
        for (let i = 0; i < this.data.length; i++) {
            const key = this.data.key(i);
            const value = this.data.getItem(key);
            try {
                result.push([key, JSON.parse(value)]);
            } catch (error) {
                result.push([key, value]);
            }
        }
        return result;
    }

    delete(key){
        key = String.toNotEmptyString(key,"Key");
        this.data.removeItem(key);
        return this;
    }
    clear(){
        this.data.clear();
        return this;
    }
}
