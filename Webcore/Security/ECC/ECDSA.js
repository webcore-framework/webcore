import Application from "../../Application/Application.js";

export default class ECDSA {
    constructor(secureMode=true){
        Object.freezeProp(this, "secureMode", secureMode);
        Object.freezeProp(this, "curve", "P-256");
        Object.freezeProp(this, "length", 256);

        Object.freezeProp(ECDSA, "encoder", new TextEncoder());

        if (secureMode){
            // 创建密钥
            Object.freezeProp(this, "generateKey", async function generateKey(){
                try {

                    const keys = Object.pure({name: "ECDSA"});
                    const keygen = await crypto.subtle.generateKey(
                        { name: "ECDSA", namedCurve: "P-256"},
                        true,
                        ["sign", "verify"]
                    );
                    keys.keygen = Object.pure(keygen);
                    const publicKey = await window.crypto.subtle.exportKey("spki", keygen.publicKey);
                    const privateKey = await window.crypto.subtle.exportKey("pkcs8", keygen.privateKey);
                    keys.publicKeyBase64 = Application.instance.text.encoding.arrayBufferToBase64(publicKey);
                    keys.privateKeyBase64 = Application.instance.text.encoding.arrayBufferToBase64(privateKey);
                    return keys;
                } catch {
                    throw new Error("Failed to generate key.");
                }
            });

            // 对数据进行签名
            Object.freezeProp(this, "sign", async function sign(data, privateKey) {
                try {
                    Error.throwIfNull(privateKey, "Private key");
                    if (!(privateKey instanceof CryptoKey)) {throw new TypeError("Invalid private key: must be a CryptoKey.");}

                    Error.throwIfNull(data, "Sign data");

                    // 单独处理文件 blob，要异步处理
                    if (data instanceof Blob){
                        data = await data.arrayBuffer();
                        const signature = await crypto.subtle.sign(
                            { name: "ECDSA", hash: {name: "SHA-256"} },
                            privateKey,
                            data
                        );
                        return Application.instance.text.encoding.arrayBufferToBase64(signature);
                    }

                    // 检查 data 类型
                    if (String.isNumberOrString(data)){
                        data = ECDSA.encoder.encode(data)
                    } else  if (typeof data === 'boolean') {
                        data = ECDSA.encoder.encode(String(data));
                    } else if (Object.isObject(data) || Array.isArray(data) || data instanceof Map || data instanceof Set){
                        data = ECDSA.encoder.encode(JSON.stringify(data))
                    } else if (!(data instanceof ArrayBuffer) && !ArrayBuffer.isView(data)){
                        throw new TypeError(`Invalid sign data type: ${typeof data}.`);
                    }

                    // 验证签名
                    const signature = await crypto.subtle.sign(
                        { name: "ECDSA", hash: {name: "SHA-256"} },
                        privateKey,
                        data
                    );
                    return Application.instance.text.encoding.arrayBufferToBase64(signature);
                } catch {
                    throw new Error("Sign failed.");
                }
            });

            // 验证签名
            Object.freezeProp(this, "verify", async function verify(data, signature, publicKey) {
                try {
                    Error.throwIfNull(publicKey, "The public key");
                    if (!(publicKey instanceof CryptoKey)) {throw new TypeError("Invalid public key.");}
                    Error.throwIfNotString(signature, "Signature");
                    Error.throwIfNull(data, "Sign data");

                    // 单独处理文件 blob，要异步处理
                    if (data instanceof Blob){
                        data = await data.arrayBuffer();
                        return await crypto.subtle.verify(
                            { name: "ECDSA", hash: {name: "SHA-256"} },
                            publicKey,
                            Application.instance.text.encoding.base64ToArrayBuffer(signature),
                            data
                        );
                    }

                    // 检查 data 类型
                    if (String.isNumberOrString(data)){
                        data = ECDSA.encoder.encode(data)
                    } else  if (typeof data === 'boolean') {
                        data = ECDSA.encoder.encode(String(data));
                    } else if (Object.isObject(data) || Array.isArray(data) || data instanceof Map || data instanceof Set){
                        data = ECDSA.encoder.encode(JSON.stringify(data))
                    } else if (!(data instanceof ArrayBuffer) && !ArrayBuffer.isView(data)){
                        throw new TypeError(`Invalid sign data type: ${typeof data}.`);
                    }

                    // 验证签名
                    return await crypto.subtle.verify(
                        { name: "ECDSA", hash: {name: "SHA-256"} },
                        publicKey,
                        Application.instance.text.encoding.base64ToArrayBuffer(signature),
                        data
                    );

                } catch {
                    throw new Error("Verify failed.");
                }
            });

        } else {
            import("../lib/P256.js").then(module=>{
                Object.freezeProp(ECDSA, "p256", module.default);
            });

            // 创建密钥
            Object.freezeProp(this, "generateKey", async function generateKey(){
                try {
                    const keys = Object.pure({name: "ECDSA"});
                    const keygen = ECDSA.p256.keygen();
                    keys.keygen = Object.pure({privateKey: keygen.secretKey, publicKey: keygen.publicKey});

                    keys.publicKeyBase64 = Application.instance.text.encoding.bytesToBase64(keygen.publicKey);
                    keys.privateKeyBase64 = Application.instance.text.encoding.bytesToBase64(keygen.secretKey);
                    return keys;
                } catch {
                    throw new Error("Failed to generate key.");
                }
            });

            // 对数据进行签名
            Object.freezeProp(this, "sign", async function sign(message, privateKey) {
                try {
                    Error.throwIfNotBytes(privateKey, "Private key");

                    Error.throwIfNull(message, "Message");
                    if (String.isNumberOrString())

                    // 单独处理文件 blob，要异步处理
                    if (message instanceof Blob){
                        message = await message.arrayBuffer();
                        const signature = ECDSA.p256.sign(message, privateKey);
                        return Application.instance.text.encoding.arrayBufferToBase64(signature);
                    }

                     // 检查 data 类型
                    if (String.isNumberOrString(message)){
                        message = ECDSA.encoder.encode(message)
                    } else  if (typeof message === 'boolean') {
                        message = ECDSA.encoder.encode(String(message));
                    } else if (Object.isObject(message) || Array.isArray(message) || message instanceof Map || message instanceof Set){
                        message = ECDSA.encoder.encode(JSON.stringify(message))
                    } else if (!(message instanceof Uint8Array)){
                        throw new TypeError(`Invalid sign data type: ${typeof message}.`);
                    }

                    // 验证签名
                    const signature = ECDSA.p256.sign(message, privateKey);
                    return Application.instance.text.encoding.bytesToBase64(signature);
                } catch {
                    throw new Error("Sign failed.");
                }
            });


            // 验证签名
            Object.freezeProp(this, "verify", async function verify(message, signature, publicKey) {
                try {
                    Error.throwIfNull(signature, "Signature");
                    Error.throwIfNull(message, "Message");
                    Error.throwIfNotString(signature, "Signature");
                    Error.throwIfNotBytes(publicKey, "Public key");
                    signature = Application.instance.text.encoding.base64ToBytes(signature)

                    // 单独处理文件 blob，要异步处理
                    if (message instanceof Blob){
                        message = await message.arrayBuffer();
                        return ECDSA.p256.verify(signature, message, publicKey);
                    }

                     // 检查 data 类型
                    if (String.isNumberOrString(message)){
                        message = ECDSA.encoder.encode(message)
                    } else  if (typeof message === 'boolean') {
                        message = ECDSA.encoder.encode(String(message));
                    } else if (Object.isObject(message) || Array.isArray(message) || message instanceof Map || message instanceof Set){
                        message = ECDSA.encoder.encode(JSON.stringify(message))
                    } else if (!(message instanceof Uint8Array)){
                        throw new TypeError(`Invalid sign data type: ${typeof message}.`);
                    }

                    // 验证签名
                    return ECDSA.p256.verify(signature, message, publicKey);
                } catch {
                    throw new Error("Verify failed.");
                }
            });
        }
    }
}
