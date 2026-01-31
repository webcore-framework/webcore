export default class CacheEntry {
    #options = null;
    #key = null;
    #value = null;
    #expire = 0;
    #handler = null;
    #created = null;
    #lastAccess = null;

    constructor(key = null, value = null, options = null, handler = null){
        Error.throwIfWhiteSpace(key, "key");
        const now = Date.now();
        this.#created = now;
        this.#lastAccess = now;

        this.#key = key;
        this.#value = value;
        this.#handler = handler;

        this.#options = Object.pure({
            sliding : 0,
            absolute : 0,
        });

        if (Object.isObject(options)){
            for (const key of Object.keys(this.#options)){
                if (Object.hasOwn(options, key)){
                    if (typeof options[key] === "number"){this.#options[key] = options[key];}
                }
            }
        }
        if (this.#options.sliding > 0){this.#expire = now + this.#options.sliding * 1000;}
        if (this.#options.absolute > 0){this.#expire = now + this.#options.absolute * 1000;}
        Object.seal(this);
    }

    get key(){return this.#key;}

    get value(){
        const now = Date.now();
        if (this.#options.sliding > 0){this.#expire = now + this.#options.sliding * 1000;}
        this.#lastAccess = now;
        return this.#value;
    }
    get handler(){const handler = this.#handler;this.#handler = null;return handler;}
    get expired(){
        if (this.#expire > 0 && Date.now() > this.#expire){
            this.#value = null;
            return true;
        }
        return false;
    }
}
