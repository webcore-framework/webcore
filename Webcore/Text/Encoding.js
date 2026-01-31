export default class Encoding {
    constructor(){
        Object.freezeProp(this, "encoder", new TextEncoder());
        Object.freezeProp(this, "decoder", new TextDecoder("utf-8"));
    }

    stringToBytes(str) {
        Error.throwIfNotString(str);
        return this.encoder.encode(str);
    }

    bytesToString(bytes) {
        if (!(bytes instanceof Uint8Array)){
            throw new TypeError("Invalid Uint8Array type.")
        }
        return this.decoder.decode(bytes);
    }

    bytesToHex(bytes){
        if (!(bytes instanceof Uint8Array)){
            throw new TypeError("Invalid Uint8Array type.")
        }
        return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
    }

    hexToBytes(hex) {
        Error.throwIfNotString(hex, "Hex string");
        if (hex.length % 2 !== 0) {
            throw new TypeError("Hex string must have even length");
        }
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    }

    hexToBase64(hex) {
        return this.bytesToBase64(this.hexToBytes(hex));
    }

    base64ToHex(base64) {
        return this.bytesToHex(this.base64ToBytes(base64));
    }

    arrayBufferToHex(buffer) {
        if (!(buffer instanceof ArrayBuffer)){
            throw new TypeError("Invalid ArrayBuffer type.")
        }
        return this.bytesToHex(new Uint8Array(buffer));
    }

    bytesToBase64(bytes) {
        if (!(bytes instanceof Uint8Array)){
            throw new TypeError("Invalid Uint8Array type.")
        }
        let binary = "";
        if (bytes.byteLength <= 65536){
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        } else {
            const CHUNK_SIZE = 0x8000; // 32KB
            for (let i = 0; i < bytes.byteLength; i += CHUNK_SIZE) {
                const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.byteLength));
                binary += String.fromCharCode.apply(null, chunk);
            }
            return window.btoa(binary);
        }
    }

    arrayBufferToBase64(buffer) {
        if (!(buffer instanceof ArrayBuffer)){
            throw new TypeError("Invalid ArrayBuffer type.")
        }
        return this.bytesToBase64(new Uint8Array(buffer));
    }

    base64ToBytes(base64) {
        Error.throwIfNotString(base64,"Base64");
        try {
            const binary = window.atob(base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0;i < binary.length;i ++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return bytes;
        } catch {
            throw new TypeError("Base64 decoding error.");
        }
    }

    base64ToArrayBuffer(base64) {
        return this.base64ToBytes(base64).buffer;
    }

    stringToBase64(str) {
        return this.bytesToBase64(this.stringToBytes(str));
    }

    base64ToString(base64){
        return this.bytesToString(this.base64ToBytes(base64));
    }

    stringToUrlBase64(str) {
        const base64 = this.stringToBase64(str);
        return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    urlBase64ToString(base64) {
        Error.throwIfNotString(base64, "Base64");
        base64 = base64.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {base64 += "=";}
        return this.base64ToString(base64);
    }
}
