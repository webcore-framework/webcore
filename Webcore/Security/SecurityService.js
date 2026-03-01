import Generate from "./Generate.js";
import SHA256 from "./Hash/SHA256.js";
import HKDF from "./HKDF/HKDF.js";
import HMAC from "./HMAC/HMAC.js";
import ECDSA from "./ECC/ECDSA.js";
import ECDH from "./ECC/ECDH.js";
import AESGCM from "./AES/AESGCM.js";
import RSAOAEP from "./RSA/RSAOAEP.js";
import PBKDF2 from "./Hash/PBKDF2.js";
import SecretSession from "./SecretSession.js";
import secureCompare from "./SecureCompare.js";

class SecurityService {
    static #instance = null;

    static singleton = true;
    static serviceName = "security";

    constructor(){
        if (SecurityService.#instance){return SecurityService.#instance;}
        Object.freezeProp(this, "secureMode", Boolean(crypto.subtle && window.isSecureContext));

        Object.freezeProp(this, "generate", new Generate());
        Object.freezeProp(this, "sha256", new SHA256(this.secureMode));
        Object.freezeProp(this, "aes", new AESGCM(this.secureMode));
        Object.freezeProp(this, "hkdf", new HKDF(this.secureMode));
        Object.freezeProp(this, "hmac", new HMAC(this.secureMode));
        Object.freezeProp(this, "rsa", new RSAOAEP(this.secureMode));

        Object.freezeProp(this, "ecdsa", new ECDSA(this.secureMode));
        Object.freezeProp(this, "ecdh", new ECDH(this.secureMode));

        Object.freezeProp(this, "pbkdf2", new PBKDF2(this.secureMode));
        Object.freezeProp(this, "secretSession", new SecretSession(this));
        Object.freezeProp(this, "secureCompare", secureCompare);

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
