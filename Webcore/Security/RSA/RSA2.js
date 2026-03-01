export default class RSA {
    static #instance = null;
    #encryptor = null;
    #publicKey = null;
    #privateKey = null;

    constructor(){
        if (RSA.#instance){
            return RSA.#instance;
        }
        if (typeof JSEncrypt === "function") {
            this.#encryptor = new JSEncrypt();
            this.#publicKey = this.#encryptor.getPublicKeyB64();
            this.#privateKey = this.#encryptor.getPrivateKeyB64();
        }
        RSA.#instance = this;
    }

    generateKeyPair(bits = 2048) {
        try {
            this.#encryptor.getKey(bits);
            return {
                publicKey: this.getPublicKey(),
                privateKey: this.getPrivateKey()
            };
        } catch (error) {
            throw new Error("密钥对生成失败: " + error.message);
        }
    }
    getPublicKey(){return this.#encryptor.getPublicKeyB64();}
    getPrivateKey(){return this.#encryptor.getPrivateKeyB64();}
    importPublicKey(publicKey){this.#encryptor.setPublicKey(publicKey);}
    importPrivateKey(privateKey){this.#encryptor.setPrivateKey(privateKey);}


    encrypt(plaintext, publicKey = null){
        if (plaintext == undefined || plaintext == null) {throw new Error("\u8981\u52a0\u5bc6\u7684\u5185\u5bb9\u4e0d\u80fd\u4e3a\u7a7a");}
        if (typeof plaintext !== "string") {throw new Error("\u8981\u52a0\u5bc6\u7684\u5185\u5bb9\u5fc5\u987b\u662f\u5b57\u7b26\u4e32\u7c7b\u578b");}
        try {
            if (typeof publicKey === "string") {this.importPublicKey(publicKey);}
            const chunkSize = this.#publicKey.length > 216 ? 245 : 117;
            const encoder = new TextEncoder("utf-8");
            plaintext = window.btoa(String.fromCharCode.apply(null, new Uint8Array(encoder.encode(plaintext))));
            if (plaintext.length <= chunkSize) {
                return this.#encryptor.encrypt(plaintext);
            } else {
                const size = plaintext.length;
                let encrypted = "";
                for (let i = 0,j = chunkSize;i < size;i += chunkSize,j += chunkSize) {
                    encrypted += this.#encryptor.encrypt(plaintext.substring(i, j));
                }
                return encrypted;
            }
        } catch (error) {
            throw new Error("\u52a0\u5bc6\u5931\u8d25");
        }
    }

    decrypt(ciphertext, privateKey){
        if (ciphertext == undefined || ciphertext == null) {throw new Error("\u8981\u89e3\u5bc6\u7684\u5bc6\u6587\u4e0d\u80fd\u4e3a\u7a7a");}
        if (typeof ciphertext !== "string") {throw new Error("\u8981\u89e3\u5bc6\u7684\u5bc6\u6587\u5fc5\u987b\u4e3a\u5b57\u7b26\u4e32");}
        try {
            if (typeof privateKey === "string") {this.importPrivateKey(privateKey);}
            const chunkSize = this.#privateKey.length > 812 ? 344 : 172;
            const decoder = new TextDecoder("utf-8");
            let encrypted = "";
            if (ciphertext.length <= chunkSize) {
                encrypted = this.#encryptor.decrypt(ciphertext);
            } else {
                const size = ciphertext.length;
                for (let i = 0,j = chunkSize;i < size;i += chunkSize,j += chunkSize) {
                    encrypted += this.#encryptor.decrypt(ciphertext.substring(i, j)) || "";
                }
            }
            const binary = window.atob(encrypted);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0;i < binary.length;i ++) {bytes[i] = binary.charCodeAt(i);}
            return decoder.decode(bytes);
        } catch(error) {
            throw new Error("\u89e3\u5bc6\u5931\u8d25");
        }
    }
}
