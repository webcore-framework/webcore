class SHA256 {
    async hash(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);

        // 转换为十六进制
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    secureCompare(hash1, hash2) {
        const len1 = hash1.length;
        const len2 = hash2.length;
        // 使用固定时间比较
        let diff = len1 ^ len2; // 如果长度不同，diff 不为 0
        // 逐字符比较，使用位运算而不是短路操作
        const maxLen = Math.max(len1, len2);
        for (let i = 0; i < maxLen; i++) {
            const char1 = i < len1 ? hash1.charCodeAt(i) : 0;
            const char2 = i < len2 ? hash2.charCodeAt(i) : 0;
            diff |= char1 ^ char2; // 如果字符不同，diff 不为 0
        }
        return diff === 0;
    }

    async verify(text, expectedHash) {
        const actualHash = await this.hash(text);
        return this.secureCompare(actualHash, expectedHash);
    }


    async verifyHmac(key, text, expectedHmac) {
        const actualHmac = await this.hmac(key, text);
        return this.secureCompare(actualHmac, expectedHmac);
    }

    async hmac(key, text) {
        const encoder = new TextEncoder();
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(key),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        const signature = await crypto.subtle.sign(
            'HMAC',
            cryptoKey,
            encoder.encode(text)
        );
        const hashArray = Array.from(new Uint8Array(signature));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }


}


const shared = x25519.getSharedSecret(privateKey, publicKey);

// 1. 导入为原始密钥材料
const rawKey = await crypto.subtle.importKey(
  'raw',
  shared,
  'HKDF', // 或者 'PBKDF2'
  false,
  ['deriveKey'] // 只能派生，不能直接加解密
);

// 2. 派生为AES密钥
const aesKey = await crypto.subtle.deriveKey(
  {
    name: 'HKDF',
    hash: 'SHA-256',
    salt: new Uint8Array(),
    info: new TextEncoder().encode('AES-GCM-key')
  },
  rawKey,
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
);

// 3. 现在才能用
const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv: ... },
  aesKey,
  data
);
