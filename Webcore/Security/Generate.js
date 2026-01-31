export default class Generate {
    constructor(){}

    // 生成加密安全的随机字节
    randomBytes(length) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return array;
    }

    randomKey(length = 32) {
        const bytes = this.randomBytes(length);
        return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
    }

    salt(length = 16) {
        return this.randomKey(length);
    }

    randomBase64Key(length = 32) {
        const bytes = this.randomBytes(length);
        return btoa(String.fromCharCode(...bytes));
    }

    // 生成安全的随机ID
    secureId(length = 16) {
        return this.randomKey(length);
    }

    // 生成URL安全的随机字符串
    randomString(length = 32) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const bytes = this.randomBytes(length);
        let result = "";
        for (let i = 0; i < length; i++) {
            result += chars[bytes[i] % chars.length];
        }
        return result;
    }

    randomCaptcha(length = 6){
        const chars = "23456789abcdefghjkmnpqrstuvwxyz";
        const bytes = this.randomBytes(length);
        let captcha = "";
        for (let i = 0; i < length; i++) {
            captcha += chars[bytes[i] % chars.length];
        }
        return captcha;
    }

    // 生成数字验证码
    numericCode(digits = 6) {
        let code = "";
        const max = 10;
        while (code.length < digits) {
            const bytes = this.randomBytes(1);
            if (bytes[0] < 256 - (256 % max)) {
                code += (bytes[0] % max).toString();
            }
        }
        return code;
    }

    // 生成UUID
    uuid() {
        const bytes = this.randomBytes(16);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, "0"));
        return [
            hex.slice(0, 4).join(""),
            hex.slice(4, 6).join(""),
            hex.slice(6, 8).join(""),
            hex.slice(8, 10).join(""),
            hex.slice(10, 16).join("")
        ].join("-");
    }
}
