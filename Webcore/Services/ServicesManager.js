export default class ServiceManager {

    constructor(){
        Object.freezeProp(this, "services", new Map());
        Object.freezeProp(this, "singletons", new Map());
        Object.freeze(this);
    }

    #create(service) {
        const dependency = service.dependency.map(dep => this.resolve(dep));
        return new service.constructor(...dependency);
    }

    serviceNames() {return Array.from(this.services.keys());}
    has(name) {return this.services.has(name);}

    get(name){
        if (!this.has(name)){throw new Error(`The "${name}" service is not registered.`);}
        return this.services.get(name);
    }
    delete(name){
        this.singletons.delete(name);
        return this.services.delete(name);
    }
    resolve(name){
        const service = this.get(name);
        if (service.singleton) {
            if (!this.singletons.has(name)) {
                this.singletons.set(name, this.#create(service));
            }
            return this.singletons.get(name);
        } else {
            return this.#create(service);
        }
    }
    register(name, service, options = {}) {
        name = String.toNotEmptyString(name, "Service name");
        if (this.has(name)){throw new Error(`The "${name}" service has already been registered.`);}
        if (typeof service !== "function"){throw new Error(`The "${name}" service to be registered is invalid.`)}
        Error.throwIfNotObject(options, "Service options");
        const config = {singleton: false, dependency: [], ...options};
        this.services.set(name, {constructor: service, ...config});
        return this;
    }

    addSingleton(name, service, deps = [], options = {}) {
        return this.register(name, service, {singleton: true, dependency: deps, ...options});
    }

    addTransient(name, service, deps = [], options = {}) {
        return this.register(name, service, {singleton: false, dependency: deps, ...options});
    }

    destroy() {
        this.singletons.forEach(instance => {
            if (typeof instance.destroy === "function") {instance.destroy();}
        });
        this.services.clear();
        this.singletons.clear();
    }

}
