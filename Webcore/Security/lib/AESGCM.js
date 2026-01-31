function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array"
}
function abytes(value, length, title="") {
    const bytes = isBytes(value);
    const len = value?.length;
    const needsLen = length !== void 0;
    if (!bytes || needsLen && len !== length) {
        const prefix = title && `"${title}" `;
        const ofLen = needsLen ? ` of length ${length}` : "";
        const got = bytes ? `length=${len}` : `type=${typeof value}`;
        throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got)
    }
    return value
}
function aexists(instance, checkFinished=true) {
    if (instance.destroyed)
        throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
        throw new Error("Hash#digest() has already been called")
}
function aoutput(out, instance) {
    abytes(out, void 0, "output");
    const min = instance.outputLen;
    if (out.length < min) {
        throw new Error("digestInto() expects output buffer of length at least " + min)
    }
}
function u8(arr) {
    return new Uint8Array(arr.buffer,arr.byteOffset,arr.byteLength)
}
function u32(arr) {
    return new Uint32Array(arr.buffer,arr.byteOffset,Math.floor(arr.byteLength / 4))
}
function clean(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
        arrays[i].fill(0)
    }
}
function createView(arr) {
    return new DataView(arr.buffer,arr.byteOffset,arr.byteLength)
}
const isLE = ( () => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();

function equalBytes(a, b) {
    if (a.length !== b.length)
        return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++)
        diff |= a[i] ^ b[i];
    return diff === 0
}

function getOutput(expectedLength, out, onlyAligned=true) {
    if (out === void 0)
        return new Uint8Array(expectedLength);
    if (out.length !== expectedLength)
        throw new Error('"output" expected Uint8Array of length ' + expectedLength + ", got: " + out.length);
    if (onlyAligned && !isAligned32(out))
        throw new Error("invalid output, must be aligned");
    return out
}
function u64Lengths(dataLength, aadLength, isLE2) {
    const num = new Uint8Array(16);
    const view = createView(num);
    view.setBigUint64(0, BigInt(aadLength), isLE2);
    view.setBigUint64(8, BigInt(dataLength), isLE2);
    return num
}
function isAligned32(bytes) {
    return bytes.byteOffset % 4 === 0
}
function copyBytes(bytes) {
    return Uint8Array.from(bytes)
}
const BLOCK_SIZE$1 = 16;
const ZEROS16 = new Uint8Array(16);
const ZEROS32 = u32(ZEROS16);
const POLY$1 = 225;
const mul2$1 = (s0, s1, s2, s3) => {
    const hiBit = s3 & 1;
    return {
        s3: s2 << 31 | s3 >>> 1,
        s2: s1 << 31 | s2 >>> 1,
        s1: s0 << 31 | s1 >>> 1,
        s0: s0 >>> 1 ^ POLY$1 << 24 & -(hiBit & 1)
    }
}
;
const swapLE = n => (n >>> 0 & 255) << 24 | (n >>> 8 & 255) << 16 | (n >>> 16 & 255) << 8 | n >>> 24 & 255 | 0;
function _toGHASHKey(k) {
    k.reverse();
    const hiBit = k[15] & 1;
    let carry = 0;
    for (let i = 0; i < k.length; i++) {
        const t = k[i];
        k[i] = t >>> 1 | carry;
        carry = (t & 1) << 7
    }
    k[0] ^= -hiBit & 225;
    return k
}
const estimateWindow = bytes => {
    if (bytes > 64 * 1024)
        return 8;
    if (bytes > 1024)
        return 4;
    return 2
}
;
class GHASH {
    blockLen = BLOCK_SIZE$1;
    outputLen = BLOCK_SIZE$1;
    s0 = 0;
    s1 = 0;
    s2 = 0;
    s3 = 0;
    finished = false;
    t;
    W;
    windowSize;
    constructor(key2, expectedLength) {
        abytes(key2, 16, "key");
        key2 = copyBytes(key2);
        const kView = createView(key2);
        let k0 = kView.getUint32(0, false);
        let k1 = kView.getUint32(4, false);
        let k2 = kView.getUint32(8, false);
        let k3 = kView.getUint32(12, false);
        const doubles = [];
        for (let i = 0; i < 128; i++) {
            doubles.push({
                s0: swapLE(k0),
                s1: swapLE(k1),
                s2: swapLE(k2),
                s3: swapLE(k3)
            });
            ({s0: k0, s1: k1, s2: k2, s3: k3} = mul2$1(k0, k1, k2, k3))
        }
        const W = estimateWindow(expectedLength || 1024);
        if (![1, 2, 4, 8].includes(W))
            throw new Error("ghash: invalid window size, expected 2, 4 or 8");
        this.W = W;
        const bits = 128;
        const windows = bits / W;
        const windowSize = this.windowSize = 2 ** W;
        const items = [];
        for (let w = 0; w < windows; w++) {
            for (let byte = 0; byte < windowSize; byte++) {
                let s0 = 0
                  , s1 = 0
                  , s2 = 0
                  , s3 = 0;
                for (let j = 0; j < W; j++) {
                    const bit = byte >>> W - j - 1 & 1;
                    if (!bit)
                        continue;
                    const {s0: d0, s1: d1, s2: d2, s3: d3} = doubles[W * w + j];
                    s0 ^= d0,
                    s1 ^= d1,
                    s2 ^= d2,
                    s3 ^= d3
                }
                items.push({
                    s0: s0,
                    s1: s1,
                    s2: s2,
                    s3: s3
                })
            }
        }
        this.t = items
    }
    _updateBlock(s0, s1, s2, s3) {
        s0 ^= this.s0,
        s1 ^= this.s1,
        s2 ^= this.s2,
        s3 ^= this.s3;
        const {W: W, t: t, windowSize: windowSize} = this;
        let o0 = 0
          , o1 = 0
          , o2 = 0
          , o3 = 0;
        const mask = (1 << W) - 1;
        let w = 0;
        for (const num of [s0, s1, s2, s3]) {
            for (let bytePos = 0; bytePos < 4; bytePos++) {
                const byte = num >>> 8 * bytePos & 255;
                for (let bitPos = 8 / W - 1; bitPos >= 0; bitPos--) {
                    const bit = byte >>> W * bitPos & mask;
                    const {s0: e0, s1: e1, s2: e2, s3: e3} = t[w * windowSize + bit];
                    o0 ^= e0,
                    o1 ^= e1,
                    o2 ^= e2,
                    o3 ^= e3;
                    w += 1
                }
            }
        }
        this.s0 = o0;
        this.s1 = o1;
        this.s2 = o2;
        this.s3 = o3
    }
    update(data2) {
        aexists(this);
        abytes(data2);
        data2 = copyBytes(data2);
        const b32 = u32(data2);
        const blocks = Math.floor(data2.length / BLOCK_SIZE$1);
        const left = data2.length % BLOCK_SIZE$1;
        for (let i = 0; i < blocks; i++) {
            this._updateBlock(b32[i * 4 + 0], b32[i * 4 + 1], b32[i * 4 + 2], b32[i * 4 + 3])
        }
        if (left) {
            ZEROS16.set(data2.subarray(blocks * BLOCK_SIZE$1));
            this._updateBlock(ZEROS32[0], ZEROS32[1], ZEROS32[2], ZEROS32[3]);
            clean(ZEROS32)
        }
        return this
    }
    destroy() {
        const {t: t} = this;
        for (const elm of t) {
            elm.s0 = 0,
            elm.s1 = 0,
            elm.s2 = 0,
            elm.s3 = 0
        }
    }
    digestInto(out) {
        aexists(this);
        aoutput(out, this);
        this.finished = true;
        const {s0: s0, s1: s1, s2: s2, s3: s3} = this;
        const o32 = u32(out);
        o32[0] = s0;
        o32[1] = s1;
        o32[2] = s2;
        o32[3] = s3;
        return out
    }
    digest() {
        const res = new Uint8Array(BLOCK_SIZE$1);
        this.digestInto(res);
        this.destroy();
        return res
    }
}
class Polyval extends GHASH {
    constructor(key2, expectedLength) {
        abytes(key2);
        const ghKey = _toGHASHKey(copyBytes(key2));
        super(ghKey, expectedLength);
        clean(ghKey)
    }
    update(data2) {
        aexists(this);
        abytes(data2);
        data2 = copyBytes(data2);
        const b32 = u32(data2);
        const left = data2.length % BLOCK_SIZE$1;
        const blocks = Math.floor(data2.length / BLOCK_SIZE$1);
        for (let i = 0; i < blocks; i++) {
            this._updateBlock(swapLE(b32[i * 4 + 3]), swapLE(b32[i * 4 + 2]), swapLE(b32[i * 4 + 1]), swapLE(b32[i * 4 + 0]))
        }
        if (left) {
            ZEROS16.set(data2.subarray(blocks * BLOCK_SIZE$1));
            this._updateBlock(swapLE(ZEROS32[3]), swapLE(ZEROS32[2]), swapLE(ZEROS32[1]), swapLE(ZEROS32[0]));
            clean(ZEROS32)
        }
        return this
    }
    digestInto(out) {
        aexists(this);
        aoutput(out, this);
        this.finished = true;
        const {s0: s0, s1: s1, s2: s2, s3: s3} = this;
        const o32 = u32(out);
        o32[0] = s0;
        o32[1] = s1;
        o32[2] = s2;
        o32[3] = s3;
        return out.reverse()
    }
}
function wrapConstructorWithKey(hashCons) {
    const hashC = (msg, key2) => hashCons(key2, msg.length).update(msg).digest();
    const tmp = hashCons(new Uint8Array(16), 0);
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = (key2, expectedLength) => hashCons(key2, expectedLength);
    return hashC
}
const ghash = wrapConstructorWithKey( (key2, expectedLength) => new GHASH(key2,expectedLength));
wrapConstructorWithKey( (key2, expectedLength) => new Polyval(key2,expectedLength));
const BLOCK_SIZE = 16;
const BLOCK_SIZE32 = 4;
const EMPTY_BLOCK = new Uint8Array(BLOCK_SIZE);
const POLY = 283;
function validateKeyLength(key2) {
    if (![16, 24, 32].includes(key2.length))
        throw new Error('"aes key" expected Uint8Array of length 16/24/32, got length=' + key2.length)
}
function mul2(n) {
    return n << 1 ^ POLY & -(n >> 7)
}
function mul(a, b) {
    let res = 0;
    for (; b > 0; b >>= 1) {
        res ^= a & -(b & 1);
        a = mul2(a)
    }
    return res
}
const sbox = ( () => {
    const t = new Uint8Array(256);
    for (let i = 0, x = 1; i < 256; i++,
    x ^= mul2(x))
        t[i] = x;
    const box = new Uint8Array(256);
    box[0] = 99;
    for (let i = 0; i < 255; i++) {
        let x = t[255 - i];
        x |= x << 8;
        box[t[i]] = (x ^ x >> 4 ^ x >> 5 ^ x >> 6 ^ x >> 7 ^ 99) & 255
    }
    clean(t);
    return box
}
)();
const rotr32_8 = n => n << 24 | n >>> 8;
const rotl32_8 = n => n << 8 | n >>> 24;
function genTtable(sbox2, fn) {
    if (sbox2.length !== 256)
        throw new Error("Wrong sbox length");
    const T0 = new Uint32Array(256).map( (_, j) => fn(sbox2[j]));
    const T1 = T0.map(rotl32_8);
    const T2 = T1.map(rotl32_8);
    const T3 = T2.map(rotl32_8);
    const T01 = new Uint32Array(256 * 256);
    const T23 = new Uint32Array(256 * 256);
    const sbox22 = new Uint16Array(256 * 256);
    for (let i = 0; i < 256; i++) {
        for (let j = 0; j < 256; j++) {
            const idx = i * 256 + j;
            T01[idx] = T0[i] ^ T1[j];
            T23[idx] = T2[i] ^ T3[j];
            sbox22[idx] = sbox2[i] << 8 | sbox2[j]
        }
    }
    return {
        sbox: sbox2,
        sbox2: sbox22,
        T0: T0,
        T1: T1,
        T2: T2,
        T3: T3,
        T01: T01,
        T23: T23
    }
}
const tableEncoding = genTtable(sbox, s => mul(s, 3) << 24 | s << 16 | s << 8 | mul(s, 2));
const xPowers = ( () => {
    const p = new Uint8Array(16);
    for (let i = 0, x = 1; i < 16; i++,
    x = mul2(x))
        p[i] = x;
    return p
}
)();
function expandKeyLE(key2) {
    abytes(key2);
    const len = key2.length;
    validateKeyLength(key2);
    const {sbox2: sbox2} = tableEncoding;
    const toClean = [];
    if (!isAligned32(key2))
        toClean.push(key2 = copyBytes(key2));
    const k32 = u32(key2);
    const Nk = k32.length;
    const subByte = n => applySbox(sbox2, n, n, n, n);
    const xk = new Uint32Array(len + 28);
    xk.set(k32);
    for (let i = Nk; i < xk.length; i++) {
        let t = xk[i - 1];
        if (i % Nk === 0)
            t = subByte(rotr32_8(t)) ^ xPowers[i / Nk - 1];
        else if (Nk > 6 && i % Nk === 4)
            t = subByte(t);
        xk[i] = xk[i - Nk] ^ t
    }
    clean(...toClean);
    return xk
}
function apply0123(T01, T23, s0, s1, s2, s3) {
    return T01[s0 << 8 & 65280 | s1 >>> 8 & 255] ^ T23[s2 >>> 8 & 65280 | s3 >>> 24 & 255]
}
function applySbox(sbox2, s0, s1, s2, s3) {
    return sbox2[s0 & 255 | s1 & 65280] | sbox2[s2 >>> 16 & 255 | s3 >>> 16 & 65280] << 16
}
function encrypt(xk, s0, s1, s2, s3) {
    const {sbox2: sbox2, T01: T01, T23: T23} = tableEncoding;
    let k = 0;
    s0 ^= xk[k++],
    s1 ^= xk[k++],
    s2 ^= xk[k++],
    s3 ^= xk[k++];
    const rounds = xk.length / 4 - 2;
    for (let i = 0; i < rounds; i++) {
        const t02 = xk[k++] ^ apply0123(T01, T23, s0, s1, s2, s3);
        const t12 = xk[k++] ^ apply0123(T01, T23, s1, s2, s3, s0);
        const t22 = xk[k++] ^ apply0123(T01, T23, s2, s3, s0, s1);
        const t32 = xk[k++] ^ apply0123(T01, T23, s3, s0, s1, s2);
        s0 = t02,
        s1 = t12,
        s2 = t22,
        s3 = t32
    }
    const t0 = xk[k++] ^ applySbox(sbox2, s0, s1, s2, s3);
    const t1 = xk[k++] ^ applySbox(sbox2, s1, s2, s3, s0);
    const t2 = xk[k++] ^ applySbox(sbox2, s2, s3, s0, s1);
    const t3 = xk[k++] ^ applySbox(sbox2, s3, s0, s1, s2);
    return {
        s0: t0,
        s1: t1,
        s2: t2,
        s3: t3
    }
}
function ctr32(xk, isLE2, nonce2, src, dst) {
    abytes(nonce2, BLOCK_SIZE, "nonce");
    abytes(src);
    dst = getOutput(src.length, dst);
    const ctr = nonce2;
    const c32 = u32(ctr);
    const view = createView(ctr);
    const src32 = u32(src);
    const dst32 = u32(dst);
    const ctrPos = isLE2 ? 0 : 12;
    const srcLen = src.length;
    let ctrNum = view.getUint32(ctrPos, isLE2);
    let {s0: s0, s1: s1, s2: s2, s3: s3} = encrypt(xk, c32[0], c32[1], c32[2], c32[3]);
    for (let i = 0; i + 4 <= src32.length; i += 4) {
        dst32[i + 0] = src32[i + 0] ^ s0;
        dst32[i + 1] = src32[i + 1] ^ s1;
        dst32[i + 2] = src32[i + 2] ^ s2;
        dst32[i + 3] = src32[i + 3] ^ s3;
        ctrNum = ctrNum + 1 >>> 0;
        view.setUint32(ctrPos, ctrNum, isLE2);
        ({s0: s0, s1: s1, s2: s2, s3: s3} = encrypt(xk, c32[0], c32[1], c32[2], c32[3]))
    }
    const start = BLOCK_SIZE * Math.floor(src32.length / BLOCK_SIZE32);
    if (start < srcLen) {
        const b32 = new Uint32Array([s0, s1, s2, s3]);
        const buf = u8(b32);
        for (let i = start, pos = 0; i < srcLen; i++,
        pos++)
            dst[i] = src[i] ^ buf[pos];
        clean(b32)
    }
    return dst
}
function computeTag(fn, isLE2, key2, data2, AAD) {
    const aadLength = AAD ? AAD.length : 0;
    const h = fn.create(key2, data2.length + aadLength);
    if (AAD)
        h.update(AAD);
    const num = u64Lengths(8 * data2.length, 8 * aadLength, isLE2);
    h.update(data2);
    h.update(num);
    const res = h.digest();
    clean(num);
    return res
}

const wrapCipher = (params, constructor) => {

    function AES(key2, ...args) {
        abytes(key2, void 0, "key");
        if (!isLE)
            throw new Error("Non little-endian hardware is not yet supported");
        if (params.nonceLength !== void 0) {
            const nonce2 = args[0];
            abytes(nonce2, params.varSizeNonce ? void 0 : params.nonceLength, "nonce")
        }
        const tagl = params.tagLength;
        if (tagl && args[1] !== void 0)
            abytes(args[1], void 0, "AAD");

        const cipher = constructor(key2, ...args);

        const checkOutput = (fnLength, output) => {
            if (output !== void 0) {
                if (fnLength !== 2)
                    throw new Error("cipher output not supported");
                abytes(output, void 0, "output")
            }
        }
        ;
        let called = false;

        const wrCipher = {
            encrypt(data2, output) {
                if (called)
                    throw new Error("cannot encrypt() twice with same key + nonce");
                called = true;
                abytes(data2);
                checkOutput(cipher.encrypt.length, output);
                return cipher.encrypt(data2, output)
            },
            decrypt(data2, output) {
                abytes(data2);
                if (tagl && data2.length < tagl)
                    throw new Error('"ciphertext" expected length bigger than tagLength=' + tagl);
                checkOutput(cipher.decrypt.length, output);
                return cipher.decrypt(data2, output)
            }
        };
        return wrCipher
    }
    Object.assign(AES, params);
    return AES;
}

const gcm = wrapCipher(
    {
        blockSize: 16,
        nonceLength: 12,
        tagLength: 16,
        varSizeNonce: true
    },

    function aesgcm(key2, nonce2, AAD) {
        if (nonce2.length < 8)
            throw new Error("aes/gcm: invalid nonce length");
        const tagLength = 16;
        function _computeTag(authKey, tagMask, data2) {
            const tag = computeTag(ghash, false, authKey, data2, AAD);
            for (let i = 0; i < tagMask.length; i++)
                tag[i] ^= tagMask[i];
            return tag
        }
        function deriveKeys() {
            const xk = expandKeyLE(key2);
            const authKey = EMPTY_BLOCK.slice();
            const counter = EMPTY_BLOCK.slice();
            ctr32(xk, false, counter, counter, authKey);
            if (nonce2.length === 12) {
                counter.set(nonce2)
            } else {
                const nonceLen = EMPTY_BLOCK.slice();
                const view = createView(nonceLen);
                view.setBigUint64(8, BigInt(nonce2.length * 8), false);
                const g = ghash.create(authKey).update(nonce2).update(nonceLen);
                g.digestInto(counter);
                g.destroy()
            }
            const tagMask = ctr32(xk, false, counter, EMPTY_BLOCK);
            return {
                xk: xk,
                authKey: authKey,
                counter: counter,
                tagMask: tagMask
            }
        }

        return {
            encrypt(plaintext) {
                const {xk: xk, authKey: authKey, counter: counter, tagMask: tagMask} = deriveKeys();
                const out = new Uint8Array(plaintext.length + tagLength);
                const toClean = [xk, authKey, counter, tagMask];
                if (!isAligned32(plaintext))
                    toClean.push(plaintext = copyBytes(plaintext));
                ctr32(xk, false, counter, plaintext, out.subarray(0, plaintext.length));
                const tag = _computeTag(authKey, tagMask, out.subarray(0, out.length - tagLength));
                toClean.push(tag);
                out.set(tag, plaintext.length);
                clean(...toClean);
                return out
            },
            decrypt(ciphertext2) {
                const {xk: xk, authKey: authKey, counter: counter, tagMask: tagMask} = deriveKeys();
                const toClean = [xk, authKey, tagMask, counter];
                if (!isAligned32(ciphertext2))
                    toClean.push(ciphertext2 = copyBytes(ciphertext2));
                const data2 = ciphertext2.subarray(0, -tagLength);
                const passedTag = ciphertext2.subarray(-tagLength);
                const tag = _computeTag(authKey, tagMask, data2);
                toClean.push(tag);
                if (!equalBytes(tag, passedTag))
                    throw new Error("aes/gcm: invalid ghash tag");
                const out = ctr32(xk, false, counter, data2);
                clean(...toClean);
                return out
            }
        }
    }
);

export default gcm;
