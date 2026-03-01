// 安全比较，防止时序攻击
class SecureCompare {

    constructor(){
        Object.freezeProp(SecureCompare, "encoder", new TextEncoder());

        Object.freezeProp(this, "compareBytes", function compareBytes(bytes1, bytes2) {
            const a = bytes1 instanceof ArrayBuffer ? new Uint8Array(bytes1) : bytes1;
            Error.throwIfNotBytes(a, "Bytes1");
            const b = bytes2 instanceof ArrayBuffer ? new Uint8Array(bytes2) : bytes2;
            Error.throwIfNotBytes(b, "Bytes2");

            const lengthA = a.length;
            const lengthB = b.length;
            let result = lengthA ^ lengthB;
            const maxLength = Math.max(lengthA, lengthB);

            for (let i = 0; i < maxLength; i++) {
                const byteA = i < lengthA ? a[i] : 0;
                const byteB = i < lengthB ? b[i] : 0;
                result |= byteA ^ byteB;
            }
            return result === 0;
        });

        Object.freezeProp(this, "compare", function compare(str1, str2) {
            if (typeof str1 === "string" && typeof str2 === "string"){
                return this.compareBytes(SecureCompare.encoder.encode(str1), SecureCompare.encoder.encode(str2));
            }
            return false;
        });

        Object.freezeProp(this, "compareHex", function compareHex(hex1, hex2) {
            return this.compare(hex1.toLowerCase(), hex2.toLowerCase());
        });

        Object.freezeProp(this, "compareBase64", function compareBase64(base64_1, base64_2) {
            return this.compare(base64_1.replace(/=+$/, ''), base64_2.replace(/=+$/, ''));
        });
    }
}

const secureCompare = new SecureCompare();
export default secureCompare;
