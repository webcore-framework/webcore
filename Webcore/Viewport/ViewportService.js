// import ViewportObserver from "./ViewportObserver.js";

export default class ViewportService {

    constructor(){
        if (ViewportService.instance){return ViewportService.instance}
        Object.freezeProp(ViewportService,"instance",this);
    }

}
