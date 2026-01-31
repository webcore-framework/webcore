import Application from "../Application/Application.js";

let keygen = null;
let derive = null;
let secret = null;

export default class SecretSession {
    constructor(service){
        Object.freezeProp(SecretSession, "service", service);

        Object.freezeProp(this, "generateKey", function generateKey(){
            keygen = SecretSession.service.ecc.x25519.generateKey();
            return keygen.publicKeyBase64;
        });

        Object.freezeProp(this, "deriveKey", function deriveKey(publicKey, salt, info){
            Error.throwIfNotString(publicKey, "Public Key");
            const bytes = Application.instance.text.encoding.base64ToBytes(publicKey);
            const sharedSecret = SecretSession.service.ecc.x25519.getSharedSecret(keygen.keygen.privateKey, bytes);
            derive = SecretSession.service.hkdf.deriveKey(sharedSecret, salt, info);
            return derive;
        });

        Object.freezeProp(this, "encrypt", async function encrypt(plaintext){
            if (secret === null) {secret = await SecretSession.service.aes.importKey(derive.secretKey);}
            return await SecretSession.service.aes.encrypt(plaintext, secret);
        });

        Object.freezeProp(this, "decrypt", async function decrypt(ciphertext, iv){
            if (secret === null) {secret = await SecretSession.service.aes.importKey(derive.secretKey);}
            return await SecretSession.service.aes.decrypt(ciphertext, secret, iv);
        });

    }
}
