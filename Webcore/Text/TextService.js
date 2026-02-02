import Encoding from "./Encoding.js";
// import Sanitize from "./Sanitize.js";

export default class TextService {
    static #instance = null;
    // sanitize = null;

    constructor(){
        if (TextService.#instance){return TextService.#instance;}
        Object.freezeProp(this, "encoding", new Encoding());
        Object.sealProp(this, "sanitize", null);
        TextService.#instance = this;
    }

}
