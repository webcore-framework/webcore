import Encoding from "./Encoding.js";
// import Sanitize from "./Sanitize.js";

export default class TextService {
    static #instance = null;
    // sanitize = null;

    constructor(){
        if (TextService.#instance){return TextService.#instance;}
        Object.freezeProp(this, "encoding", new Encoding());
        Object.sealProp(this, "sanitize", null);

        // 检查参数是否为 Bytes 类型
        Object.freezeProp(Error, "throwIfNotBytes",
            function throwIfNotBytes(target, name = null){
                Error.throwIfNull(target, name);
                if (!(target instanceof Uint8Array)){
                    throw new TypeError(`${name || "Parameter"} must be of Uint8Array type.`);
                }
                return true;
            }
        );

        TextService.#instance = this;
    }

}
