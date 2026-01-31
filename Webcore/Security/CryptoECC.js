import Application from "../Application/Application.js";

class X25519 {
    constructor(){
        Object.freezeProp(this,"name","x25519");

        import("./lib/X25519.js").then(module=>{
            Object.freezeProp(X25519, "x25519", module.default())
        });

        Object.freezeProp(this, "generateKey", function generateKey(){
            const privateKey = X25519.x25519.utils.randomSecretKey();
            const publicKey = X25519.x25519.getPublicKey(privateKey);
            const keygen = Object.pure({privateKey,publicKey});
            return Object.pure({
                name: "x25519",
                keygen,
                privateKeyBase64: Application.instance.text.encoding.bytesToBase64(privateKey),
                publicKeyBase64: Application.instance.text.encoding.bytesToBase64(publicKey),
            })
        });

        Object.freezeProp(this, "getSharedSecret", function getSharedSecret(privateKey, publicKey){
            return X25519.x25519.getSharedSecret(privateKey, publicKey);
        });

    }
}

class ED25519 {
    constructor(){
        Object.freezeProp(this,"name","ed25519");

        import("./lib/ED25519.js").then(module=>{
            Object.freezeProp(ED25519, "ed25519", module.default)
        });

        Object.freezeProp(this, "generateKey", function generateKey(){
            const keygen = ED25519.ed25519.keygen();
            return Object.pure({
                name: "ed25519",
                keygen: Object.pure(keygen),
                secretKeyBase64: Application.instance.text.encoding.bytesToBase64(keygen.secretKey),
                publicKeyBase64: Application.instance.text.encoding.bytesToBase64(keygen.publicKey),
            });
        });

        Object.freezeProp(this, "sign", function sign(message, secretKey){
            return ED25519.ed25519.sign(message, secretKey)
        });

        Object.freezeProp(this, "verify", function verify(sign, message, publicKey, strict = true){
            if (strict){
                return ED25519.ed25519.verify(sign, message, publicKey, { zip215: false })
            } else {
                return ED25519.ed25519.verify(sign, message, publicKey, { zip215: true })
            }
        });

        Object.freezeProp(this, "toX25519PrivateKey", function toX25519PrivateKey(secretKey){
            secretKey = ED25519.ed25519.utils.toMontgomerySecret(secretKey);
            return Object.pure({
                name: "x25519",
                privateKey: secretKey,
                privateKeyBase64: Application.instance.text.encoding.bytesToBase64(secretKey)
            });
        });

        Object.freezeProp(this, "toX25519PublicKey", function toX25519PublicKey(publicKey){
            publicKey = ED25519.ed25519.utils.toMontgomery(publicKey);
            return Object.pure({
                name: "x25519",
                publicKey: publicKey,
                publicKeyBase64: Application.instance.text.encoding.bytesToBase64(publicKey)
            });
        });

        Object.freezeProp(this, "toX25519Keys", function toX25519Keys(secretKey, publicKey){
            secretKey = this.toX25519PrivateKey(secretKey);
            publicKey = this.toX25519PublicKey(publicKey);
            return Object.pure({
                name: "x25519",
                keygen: Object.pure({
                    privateKey: secretKey.privateKey,
                    publicKey: publicKey.publicKey,
                }),
                privateKeyBase64: secretKey.privateKeyBase64,
                publicKeyBase64: publicKey.publicKeyBase64,
            });
        });
    }
}



export default class CryptoECC {

    constructor(){

        Object.freezeProp(this, "x25519", new X25519());
        Object.freezeProp(this, "ed25519", new ED25519());
    }


}
