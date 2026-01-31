export default class PBKDF2 {
    constructor(){
        Object.freezeProp(PBKDF2, "encoder", new TextEncoder());
    }

    async hash(text, salt) {
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            PBKDF2.encoder.encode(text),
            'PBKDF2',
            false,
            ['deriveBits']
        );

        const derivedKey = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: PBKDF2.encoder.encode(salt),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            256
        );
        return Array.from(new Uint8Array(derivedKey)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async verify(text, salt, hash) {
        const key = await this.hash(text, salt);
        return this.secureCompare(key, hash);
    }

    generateSalt(length = 16) {
        const salt = crypto.getRandomValues(new Uint8Array(length));
        return Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    }
}
