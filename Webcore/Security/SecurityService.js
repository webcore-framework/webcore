import Generate from "./Generate.js";
// import Crypto from "./Crypto.js";
// import Hash from "./Hash.js";
import SHA256 from "./SHA256.js"
import CryptoAES from "./CryptoAES.js";
import CryptoRSA from "./CryptoRSA.js";
import PBKDF2 from "./PBKDF2.js";
import CryptoECC from "./CryptoECC.js"
import AES_GCM from "./lib/AESGCM.js";
import HKDF from "./HKDF.js";
import SecretSession from "./SecretSession.js";

class SecurityService {
    static #instance = null;

    static singleton = true;
    static serviceName = "security";

    constructor(){
        if (SecurityService.#instance){return SecurityService.#instance;}
        Object.freezeProp(this, "secureMode", Boolean(crypto.subtle && window.isSecureContext));
        Object.freezeProp(this, "generate", new Generate());
        Object.freezeProp(this, "sha256", new SHA256());
        Object.freezeProp(this, "rsa", new CryptoRSA());
        Object.freezeProp(this, "ecc", new CryptoECC());
        Object.freezeProp(this, "aes", new CryptoAES());
        Object.freezeProp(this, "aesgcm", AES_GCM);
        // Object.freezeProp(this, "hash", new Hash());
        Object.freezeProp(this, "pbkdf2", new PBKDF2());
        Object.freezeProp(this, "hkdf", new HKDF());
        Object.freezeProp(this, "secretSession", new SecretSession(this));
        // Object.sealProp(this, "crypto", null)
        SecurityService.#instance = this;
    }
}


export default {
    // 插件名称
    name: "security",

    // 提供服务
    service: {
        name: "security",
        singleton: true,
        global: true,
        constructor: SecurityService,
    },

    // // 插件安装
    // install: function install(app, options){

    // },

    // // 插件卸载
    // uninstall: function uninstall(app){

    // }
};
