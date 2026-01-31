import CacheEntry from "./CacheEntry.js";

export default class CacheService {
    static singleton = true;
    static system = true;
    static serviceName = "cache";

    #data = new Map();

    constructor(){Object.freeze(this);}

    async expire(cache){
        const expirehandler = cache.handler;
        this.#data.delete(cache.key);
        if (expirehandler !== null){return Promise.resolve(expirehandler());}
        return Promise.resolve(null);
    }

    get count(){return this.#data.size;}

    has(key){
        Error.throwIfWhiteSpace(key, "key");
        if (!this.#data.has(key)){return false;}
        if (this.get(key) === null) {return false;}
        return true;
    }

    set(key, value, options = null, handler = null){
        if (value != null){
            const cache = new CacheEntry(key, value, options, handler);
            this.#data.set(key, cache);
        }
        return this;
    }

    get(key){
        Error.throwIfWhiteSpace(key, "key");
        if (this.#data.has(key)){
            const cache = this.#data.get(key);
            if (cache.expired){
                this.expire(cache);
                return null;
            }
            return cache.value;
        }
        return null;
    }

    delete(key){
        this.get(key);
        this.#data.delete(key);
        return this;
    }
    keys(){return this.#data.keys();}
    clear(){this.#data.clear();return this;}
}
