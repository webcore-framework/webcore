class OrientationChange {
    static #instance = null;

    constructor(){
        if (OrientationChange.#instance){return OrientationChange.#instance}
        Object.freezeProp(OrientationChange, "tasks", []);
        Object.sealProp(OrientationChange, "running", false);
        Object.freeze(this);
        OrientationChange.#instance = this;
    }

    get running(){return OrientationChange.running;}
    get length(){return OrientationChange.tasks.length;}

    add(func){
        if (!this.running && typeof func === "function"){
            this.remove(func);
            OrientationChange.tasks.push(func);
        }
        return this;
    }

    has(func){
        if (typeof func === "function"){
            return OrientationChange.tasks.indexOf(func) !== -1;
        }
        return false;
    }

    async execute(){
        if (this.running) {
            console.warn("The task is currently being executed.");return false;
        }
        OrientationChange.running = true;
        for (const task of OrientationChange.tasks) {
            try {await Promise.resolve(task())} catch (error) {console.error("Task running error.", error.message);}
        }
        OrientationChange.running = false;
        return true;
    }

    remove(func){
        if (!this.running && typeof func === "function"){
            const index = OrientationChange.tasks.indexOf(func);
            if (index !== -1) {
                OrientationChange.tasks.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    removeAt(index) {
        if (this.running || typeof index !== "number"){return false;}
        if (index < 0 || index > this.length){return false;}
        OrientationChange.tasks.splice(index, 1);
        return true;
    }

    clear(){
        OrientationChange.tasks = [];return this;
    }
}



export default class Orientation {
    static #instance = null;

    constructor(){
        if (Orientation.#instance){return Orientation.#instance}
        Object.freezeProp(this, "change", new OrientationChange());
        Object.freezeProp(Orientation, "media", top.matchMedia("(orientation: landscape)"));
        Orientation.media.onchange = ()=>{this.change.execute()};

        const changHandler = ()=>{
            if (Orientation.media.matches){
                document.documentElement.classList.remove("portrait");
            } else {
                document.documentElement.classList.add("portrait");
            }
        };
        const orient = screen.orientation;
        if (document.documentElement.classList.contains("dync")
             || (orient.type.startsWith("p") && (orient.angle == 90 || orient.angle == 270))
             || (orient.type.startsWith("l") && (orient.angle == 0 || orient.angle == 180))
        ) {
            this.change.add(changHandler);
        }
        changHandler();
        Object.freeze(this);
        Orientation.#instance = this;
    }

    get landscape(){return Orientation.media.matches;}
    get portrait(){return !Orientation.media.matches;}
    get matches(){return Orientation.media.matches ? "landscape" : "portrait"}

    destroy() {
        Orientation.media.onchange = null;
        this.change.clear();
        Orientation.#instance = null;
    }
}
