export default class InitialService {
    constructor(){
        if (InitialService.instance){return InitialService.instance;}
        Object.sealProp(this, "executed", false);
        this.handlers = Object.pure({"open":null, "loaded":null})

        Object.freezeProp(InitialService, "instance", this);
        Object.freeze(InitialService);
    }

    set open(func){
        Error.throwIfNotFunction(func, "Value");
        this.handlers.open = func;
    }
    set loaded(func){
        Error.throwIfNotFunction(func, "Value");
        this.handlers.loaded = func;
    }

    execute(){
        console.log("8. 开始运行初始化程序……");
        if (!this.executed){
            try {
                if (typeof this.handlers.open === "function"){
                    this.handlers.open();
                }
                self.addEventListener("DOMContentLoaded", ()=>{
                    try {
                        if (typeof this.handlers.loaded === "function"){
                            this.handlers.loaded();
                        }
                        this.executed = true;
                        delete this.handlers;
                        Object.freeze(this);
                    } catch (error) {
                        console.error("Initialization task execution failed: ", error)
                        return false;
                    }
                }, {once: true});
                this.executed = true;
            } catch (error) {
                console.error("Initialization task execution failed: ", error)
                return false;
            }
        }

        return true;
    }
}
