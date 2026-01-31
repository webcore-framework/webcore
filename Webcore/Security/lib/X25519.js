/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
function anumber(n, title="") {
    if (!Number.isSafeInteger(n) || n < 0) {
        throw new Error(`${title && `"${title}" `}expected integer >= 0, got ${n}`)
    }
}
function abytes(value, length, title="") {
    const bytes = (a = value)instanceof Uint8Array || ArrayBuffer.isView(a) && "Uint8Array" === a.constructor.name;
    var a;
    const len = value?.length
      , needsLen = void 0 !== length;
    if (!bytes || needsLen && len !== length) {
        throw new Error((title && `"${title}" `) + "expected Uint8Array" + (needsLen ? ` of length ${length}` : "") + ", got " + (bytes ? `length=${len}` : "type=" + typeof value))
    }
    return value
}
const hasHexBuiltin = ( () => "function" == typeof Uint8Array.from([]).toHex && "function" == typeof Uint8Array.fromHex)()
  , hexes = Array.from({
    length: 256
}, (_, i) => i.toString(16).padStart(2, "0"));
const asciis__0 = 48
  , asciis__9 = 57
  , asciis_A = 65
  , asciis_F = 70
  , asciis_a = 97
  , asciis_f = 102;
function asciiToBase16(ch) {
    return ch >= asciis__0 && ch <= asciis__9 ? ch - asciis__0 : ch >= asciis_A && ch <= asciis_F ? ch - (asciis_A - 10) : ch >= asciis_a && ch <= asciis_f ? ch - (asciis_a - 10) : void 0
}
function randomBytes(bytesLength=32) {
    const cr = "object" == typeof globalThis ? globalThis.crypto : null;
    if ("function" != typeof cr?.getRandomValues)
        throw new Error("crypto.getRandomValues must be defined");
    return cr.getRandomValues(new Uint8Array(bytesLength))
}
const _0n$2 = BigInt(0);
function bytesToNumberLE(bytes) {
    return function(hex) {
        if ("string" != typeof hex)
            throw new Error("hex string expected, got " + typeof hex);
        return "" === hex ? _0n$2 : BigInt("0x" + hex)
    }(function(bytes) {
        if (abytes(bytes),
        hasHexBuiltin)
            return bytes.toHex();
        let hex = "";
        for (let i = 0; i < bytes.length; i++)
            hex += hexes[bytes[i]];
        return hex
    }(copyBytes(abytes(bytes)).reverse()))
}
function numberToBytesBE(n, len) {
    anumber(len);
    const res = function(hex) {
        if ("string" != typeof hex)
            throw new Error("hex string expected, got " + typeof hex);
        if (hasHexBuiltin)
            return Uint8Array.fromHex(hex);
        const hl = hex.length
          , al = hl / 2;
        if (hl % 2)
            throw new Error("hex string expected, got unpadded hex of length " + hl);
        const array = new Uint8Array(al);
        for (let ai = 0, hi = 0; ai < al; ai++,
        hi += 2) {
            const n1 = asciiToBase16(hex.charCodeAt(hi))
              , n2 = asciiToBase16(hex.charCodeAt(hi + 1));
            if (void 0 === n1 || void 0 === n2) {
                const char = hex[hi] + hex[hi + 1];
                throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi)
            }
            array[ai] = 16 * n1 + n2
        }
        return array
    }((n = function(n) {
        if ("bigint" == typeof n) {
            if (!isPosBig(n))
                throw new Error("positive bigint expected, got " + n)
        } else
            anumber(n);
        return n
    }(n)).toString(16).padStart(2 * len, "0"));
    if (res.length !== len)
        throw new Error("number too large");
    return res
}
function copyBytes(bytes) {
    return Uint8Array.from(bytes)
}
const isPosBig = n => "bigint" == typeof n && _0n$2 <= n;
function aInRange(title, n, min, max) {
    if (!function(n, min, max) {
        return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max
    }(n, min, max))
        throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n)
}
function validateObject(object, fields={}, optFields={}) {
    if (!object || "object" != typeof object)
        throw new Error("expected valid options object");
    const iter = (f, isOpt) => Object.entries(f).forEach( ([k,v]) => function(fieldName, expectedType, isOpt) {
        const val = object[fieldName];
        if (isOpt && void 0 === val)
            return;
        const current = typeof val;
        if (current !== expectedType || null === val)
            throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`)
    }(k, v, isOpt));
    iter(fields, !1),
    iter(optFields, !0)
}
const _0n$1 = BigInt(0);
function mod(a, b) {
    const result = a % b;
    return result >= _0n$1 ? result : b + result
}
function pow2(x, power, modulo) {
    let res = x;
    for (; power-- > _0n$1; )
        res *= res,
        res %= modulo;
    return res
}
function createKeygen(randomSecretKey, getPublicKey) {
    return function(seed) {
        const secretKey = randomSecretKey(seed);
        return {
            secretKey: secretKey,
            publicKey: getPublicKey(secretKey)
        }
    }
}
const _0n = BigInt(0)
  , _1n$1 = BigInt(1)
  , _2n$1 = BigInt(2);
function montgomery(curveDef) {
    const CURVE = (validateObject(curve = curveDef, {
        adjustScalarBytes: "function",
        powPminus2: "function"
    }),
    Object.freeze({
        ...curve
    }));
    var curve;
    const {P: P, type: type, adjustScalarBytes: adjustScalarBytes2, powPminus2: powPminus2, randomBytes: rand} = CURVE
      , is25519 = "x25519" === type;
    if (!is25519 && "x448" !== type)
        throw new Error("invalid type");
    const randomBytes_ = rand || randomBytes
      , montgomeryBits = is25519 ? 255 : 448
      , fieldLen = is25519 ? 32 : 56
      , Gu = is25519 ? BigInt(9) : BigInt(5)
      , a24 = is25519 ? BigInt(121665) : BigInt(39081)
      , minScalar = is25519 ? _2n$1 ** BigInt(254) : _2n$1 ** BigInt(447)
      , maxAdded = is25519 ? BigInt(8) * _2n$1 ** BigInt(251) - _1n$1 : BigInt(4) * _2n$1 ** BigInt(445) - _1n$1
      , maxScalar = minScalar + maxAdded + _1n$1
      , modP = n => mod(n, P)
      , GuBytes = encodeU(Gu);
    function encodeU(u) {
        return numberToBytesBE(modP(u), fieldLen).reverse()
    }
    function scalarMult(scalar, u) {
        const pu = function(u, scalar) {
            aInRange("u", u, _0n, P),
            aInRange("scalar", scalar, minScalar, maxScalar);
            const k = scalar
              , x_1 = u;
            let x_2 = _1n$1
              , z_2 = _0n
              , x_3 = u
              , z_3 = _1n$1
              , swap = _0n;
            for (let t = BigInt(montgomeryBits - 1); t >= _0n; t--) {
                const k_t = k >> t & _1n$1;
                swap ^= k_t,
                ({x_2: x_2, x_3: x_3} = cswap(swap, x_2, x_3)),
                ({x_2: z_2, x_3: z_3} = cswap(swap, z_2, z_3)),
                swap = k_t;
                const A = x_2 + z_2
                  , AA = modP(A * A)
                  , B = x_2 - z_2
                  , BB = modP(B * B)
                  , E = AA - BB
                  , C = x_3 + z_3
                  , DA = modP((x_3 - z_3) * A)
                  , CB = modP(C * B)
                  , dacb = DA + CB
                  , da_cb = DA - CB;
                x_3 = modP(dacb * dacb),
                z_3 = modP(x_1 * modP(da_cb * da_cb)),
                x_2 = modP(AA * BB),
                z_2 = modP(E * (AA + modP(a24 * E)))
            }
            ({x_2: x_2, x_3: x_3} = cswap(swap, x_2, x_3)),
            ({x_2: z_2, x_3: z_3} = cswap(swap, z_2, z_3));
            const z2 = powPminus2(z_2);
            return modP(x_2 * z2)
        }(function(u) {
            const _u = copyBytes(abytes(u, fieldLen, "uCoordinate"));
            return is25519 && (_u[31] &= 127),
            modP(bytesToNumberLE(_u))
        }(u), function(scalar) {
            return bytesToNumberLE(adjustScalarBytes2(copyBytes(abytes(scalar, fieldLen, "scalar"))))
        }(scalar));
        if (pu === _0n)
            throw new Error("invalid private or public key received");
        return encodeU(pu)
    }
    function scalarMultBase(scalar) {
        return scalarMult(scalar, GuBytes)
    }
    const getPublicKey = scalarMultBase
      , getSharedSecret = scalarMult;
    function cswap(swap, x_2, x_3) {
        const dummy = modP(swap * (x_2 - x_3));
        return {
            x_2: x_2 = modP(x_2 - dummy),
            x_3: x_3 = modP(x_3 + dummy)
        }
    }
    const lengths = {
        secretKey: fieldLen,
        publicKey: fieldLen,
        seed: fieldLen
    }
      , randomSecretKey = (seed=randomBytes_(fieldLen)) => (abytes(seed, lengths.seed, "seed"),
    seed)
      , utils = {
        randomSecretKey: randomSecretKey
    };
    return Object.freeze({
        keygen: createKeygen(randomSecretKey, getPublicKey),
        getSharedSecret: getSharedSecret,
        getPublicKey: getPublicKey,
        scalarMult: scalarMult,
        scalarMultBase: scalarMultBase,
        utils: utils,
        GuBytes: GuBytes.slice(),
        lengths: lengths
    })
}
const _1n = BigInt(1)
  , _2n = BigInt(2)
  , _3n = BigInt(3)
  , _5n = BigInt(5);
BigInt(8);
const ed25519_CURVE_p = BigInt("0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffed");
function adjustScalarBytes(bytes) {
    return bytes[0] &= 248,
    bytes[31] &= 127,
    bytes[31] |= 64,
    bytes
}
const x25519 = () => {
    const P = ed25519_CURVE_p;
    return montgomery({
        P: P,
        type: "x25519",
        powPminus2: x => {
            const {pow_p_5_8: pow_p_5_8, b2: b2} = function(x) {
                const _10n = BigInt(10)
                  , _20n = BigInt(20)
                  , _40n = BigInt(40)
                  , _80n = BigInt(80)
                  , P = ed25519_CURVE_p
                  , b2 = x * x % P * x % P
                  , b4 = pow2(b2, _2n, P) * b2 % P
                  , b5 = pow2(b4, _1n, P) * x % P
                  , b10 = pow2(b5, _5n, P) * b5 % P
                  , b20 = pow2(b10, _10n, P) * b10 % P
                  , b40 = pow2(b20, _20n, P) * b20 % P
                  , b80 = pow2(b40, _40n, P) * b40 % P
                  , b160 = pow2(b80, _80n, P) * b80 % P
                  , b240 = pow2(b160, _80n, P) * b80 % P
                  , b250 = pow2(b240, _10n, P) * b10 % P;
                return {
                    pow_p_5_8: pow2(b250, _2n, P) * x % P,
                    b2: b2
                }
            }(x);
            return mod(pow2(pow_p_5_8, _3n, P) * b2, P)
        }
        ,
        adjustScalarBytes: adjustScalarBytes
    })
};
export default x25519;
