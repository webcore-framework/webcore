export default class Component {

    constructor(name, component){
        this.name = name;
        this.props = component.observedAttributes || null;
        this.component = component;
        Object.sealProp(component, "routing", false);
        Object.sealProp(component, "position", Object.pure({left:0,top:0}));
    }

    createInstance(){
        return new this.component();
    }

    getComponentClass(){
        return this.component;
    }
}
