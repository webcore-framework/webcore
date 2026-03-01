import Application from "../Application/Application.js";


let ecdsa = null;
let ecdh = null;
let derive = null;
let secret = null;

export default class SecretSession {
    constructor(service){
        Object.freezeProp(SecretSession, "service", service);
        Object.freezeProp(this, "secureMode", service.secureMode);

        Object.freezeProp(this, "generateKey", async function generateKey(){
            ecdh = await SecretSession.service.ecdh.generateKey();
            if (SecretSession.service.ecdh.secureMode){
                ecdsa = await SecretSession.service.ecdsa.generateKey();
            } else {
                ecdsa = ecdh
            }
            return ecdh.publicKeyBase64;
        });

        Object.freezeProp(this, "deriveKey", async function deriveKey(publicKey, salt, info){
            derive = await SecretSession.service.ecdh.importKey(publicKey);
            const sharedSecret = await SecretSession.service.ecdh.getSharedSecret(ecdh.keygen.privateKey, derive);
            secret = await SecretSession.service.hkdf.deriveKey(sharedSecret, salt, info);
            return secret;
        });

        Object.freezeProp(this, "encrypt", async function encrypt(plaintext){
            return await SecretSession.service.aes.encrypt(plaintext, secret);
        });

        Object.freezeProp(this, "decrypt", async function decrypt(ciphertext, iv){
            return await SecretSession.service.aes.decrypt(ciphertext, secret, iv);
        });

        Object.freezeProp(this, "sign", async function sign(message){
            return await SecretSession.service.ecdsa.sign(message, ecdsa.keygen.privateKey);
        });

        Object.freezeProp(this, "verify", async function verify(publicKey, signature, message){
            return await SecretSession.service.ecdsa.verify(message, signature, publicKey);
        });
    }
}
