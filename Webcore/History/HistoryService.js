export default class HistoryService {
    static singleton = true;
    static system = true;
    static serviceName = "history";

    constructor(){
        if (HistoryService.instance){return HistoryService.instance;}
        this.history=[];

        Object.freezeProp(HistoryService, "instance", this)
    }

    get state(){return top.history.state;}

    back(){top.history.back()}
    go(index){top.history.go(index)}
    forward(){top.history.forward()}
}
