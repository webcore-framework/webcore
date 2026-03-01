import sha256 from "./SHA256.js";
import { hmac } from "./HMAC.js";

function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && "Uint8Array" === a.constructor.name
}
function anumber(n, title="") {
    if (!Number.isSafeInteger(n) || n < 0) {
        throw new Error(`${title && `"${title}" `}expected integer >= 0, got ${n}`)
    }
}
function abytes(value, length, title="") {
    const bytes = isBytes(value)
      , len = value?.length
      , needsLen = void 0 !== length;
    if (!bytes || needsLen && len !== length) {
        throw new Error((title && `"${title}" `) + "expected Uint8Array" + (needsLen ? ` of length ${length}` : "") + ", got " + (bytes ? `length=${len}` : "type=" + typeof value))
    }
    return value
}
function ahash(h) {
    if ("function" != typeof h || "function" != typeof h.create)
        throw new Error("Hash must wrapped by utils.createHasher");
    anumber(h.outputLen),
    anumber(h.blockLen)
}

const hasHexBuiltin = ( () => "function" == typeof Uint8Array.from([]).toHex && "function" == typeof Uint8Array.fromHex)()
  , hexes = Array.from({
    length: 256
}, (_, i) => i.toString(16).padStart(2, "0"));

function bytesToHex(bytes) {
    if (abytes(bytes),
    hasHexBuiltin)
        return bytes.toHex();
    let hex = "";
    for (let i = 0; i < bytes.length; i++)
        hex += hexes[bytes[i]];
    return hex
}
const asciis__0 = 48
  , asciis__9 = 57
  , asciis_A = 65
  , asciis_F = 70
  , asciis_a = 97
  , asciis_f = 102;
function asciiToBase16(ch) {
    return ch >= asciis__0 && ch <= asciis__9 ? ch - asciis__0 : ch >= asciis_A && ch <= asciis_F ? ch - (asciis_A - 10) : ch >= asciis_a && ch <= asciis_f ? ch - (asciis_a - 10) : void 0
}
function hexToBytes(hex) {
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
}

function concatBytes(...arrays) {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
        const a = arrays[i];
        abytes(a),
        sum += a.length
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
        const a = arrays[i];
        res.set(a, pad),
        pad += a.length
    }
    return res
}

function randomBytes(bytesLength=32) {
    const cr = "object" == typeof globalThis ? globalThis.crypto : null;
    if ("function" != typeof cr?.getRandomValues)
        throw new Error("crypto.getRandomValues must be defined");
    return cr.getRandomValues(new Uint8Array(bytesLength))
}

// NIST P-256
const _0n$3 = BigInt(0), _1n$3 = BigInt(1);
function abool(value, title="") {
    if ("boolean" != typeof value) {
        throw new Error((title && `"${title}" `) + "expected boolean, got type=" + typeof value)
    }
    return value
}
function abignumber(n) {
    if ("bigint" == typeof n) {
        if (!isPosBig(n))
            throw new Error("positive bigint expected, got " + n)
    } else
        anumber(n);
    return n
}
function numberToHexUnpadded(num) {
    const hex = abignumber(num).toString(16);
    return 1 & hex.length ? "0" + hex : hex
}
function hexToNumber(hex) {
    if ("string" != typeof hex)
        throw new Error("hex string expected, got " + typeof hex);
    return "" === hex ? _0n$3 : BigInt("0x" + hex)
}
function bytesToNumberBE(bytes) {
    return hexToNumber(bytesToHex(bytes))
}
function bytesToNumberLE(bytes) {
    return hexToNumber(bytesToHex(function(bytes) {
        return Uint8Array.from(bytes)
    }(abytes(bytes)).reverse()))
}
function numberToBytesBE(n, len) {
    anumber(len);
    const res = hexToBytes((n = abignumber(n)).toString(16).padStart(2 * len, "0"));
    if (res.length !== len)
        throw new Error("number too large");
    return res
}
function numberToBytesLE(n, len) {
    return numberToBytesBE(n, len).reverse()
}
const isPosBig = n => "bigint" == typeof n && _0n$3 <= n;
function aInRange(title, n, min, max) {
    if (!function(n, min, max) {
        return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max
    }(n, min, max))
        throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n)
}
const bitMask = n => (_1n$3 << BigInt(n)) - _1n$3;
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
function memoized(fn) {
    const map = new WeakMap;
    return (arg, ...args) => {
        const val = map.get(arg);
        if (void 0 !== val)
            return val;
        const computed = fn(arg, ...args);
        return map.set(arg, computed),
        computed
    }
}
const _0n$2 = BigInt(0)
  , _1n$2 = BigInt(1)
  , _2n$1 = BigInt(2)
  , _3n$1 = BigInt(3)
  , _4n$1 = BigInt(4)
  , _5n = BigInt(5)
  , _7n = BigInt(7)
  , _8n = BigInt(8)
  , _9n = BigInt(9)
  , _16n = BigInt(16);
function mod(a, b) {
    const result = a % b;
    return result >= _0n$2 ? result : b + result
}
function invert(number, modulo) {
    if (number === _0n$2)
        throw new Error("invert: expected non-zero number");
    if (modulo <= _0n$2)
        throw new Error("invert: expected positive modulus, got " + modulo);
    let a = mod(number, modulo)
      , b = modulo
      , x = _0n$2
      , u = _1n$2;
    for (; a !== _0n$2; ) {
        const r = b % a
          , m = x - u * (b / a);
        b = a,
        a = r,
        x = u,
        u = m
    }
    if (b !== _1n$2)
        throw new Error("invert: does not exist");
    return mod(x, modulo)
}
function assertIsSquare(Fp, root, n) {
    if (!Fp.eql(Fp.sqr(root), n))
        throw new Error("Cannot find square root")
}
function sqrt3mod4(Fp, n) {
    const p1div4 = (Fp.ORDER + _1n$2) / _4n$1
      , root = Fp.pow(n, p1div4);
    return assertIsSquare(Fp, root, n),
    root
}
function sqrt5mod8(Fp, n) {
    const p5div8 = (Fp.ORDER - _5n) / _8n
      , n2 = Fp.mul(n, _2n$1)
      , v = Fp.pow(n2, p5div8)
      , nv = Fp.mul(n, v)
      , i = Fp.mul(Fp.mul(nv, _2n$1), v)
      , root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
    return assertIsSquare(Fp, root, n),
    root
}
function tonelliShanks(P) {
    if (P < _3n$1)
        throw new Error("sqrt is not defined for small field");
    let Q = P - _1n$2
      , S = 0;
    for (; Q % _2n$1 === _0n$2; )
        Q /= _2n$1,
        S++;
    let Z = _2n$1;
    const _Fp = Field(P);
    for (; 1 === FpLegendre(_Fp, Z); )
        if (Z++ > 1e3)
            throw new Error("Cannot find square root: probably non-prime P");
    if (1 === S)
        return sqrt3mod4;
    let cc = _Fp.pow(Z, Q);
    const Q1div2 = (Q + _1n$2) / _2n$1;
    return function(Fp, n) {
        if (Fp.is0(n))
            return n;
        if (1 !== FpLegendre(Fp, n))
            throw new Error("Cannot find square root");
        let M = S
          , c = Fp.mul(Fp.ONE, cc)
          , t = Fp.pow(n, Q)
          , R = Fp.pow(n, Q1div2);
        for (; !Fp.eql(t, Fp.ONE); ) {
            if (Fp.is0(t))
                return Fp.ZERO;
            let i = 1
              , t_tmp = Fp.sqr(t);
            for (; !Fp.eql(t_tmp, Fp.ONE); )
                if (i++,
                t_tmp = Fp.sqr(t_tmp),
                i === M)
                    throw new Error("Cannot find square root");
            const exponent = _1n$2 << BigInt(M - i - 1)
              , b = Fp.pow(c, exponent);
            M = i,
            c = Fp.sqr(b),
            t = Fp.mul(t, c),
            R = Fp.mul(R, b)
        }
        return R
    }
}
function FpSqrt(P) {
    return P % _4n$1 === _3n$1 ? sqrt3mod4 : P % _8n === _5n ? sqrt5mod8 : P % _16n === _9n ? function(P) {
        const Fp_ = Field(P)
          , tn = tonelliShanks(P)
          , c1 = tn(Fp_, Fp_.neg(Fp_.ONE))
          , c2 = tn(Fp_, c1)
          , c3 = tn(Fp_, Fp_.neg(c1))
          , c4 = (P + _7n) / _16n;
        return (Fp, n) => {
            let tv1 = Fp.pow(n, c4)
              , tv2 = Fp.mul(tv1, c1);
            const tv3 = Fp.mul(tv1, c2)
              , tv4 = Fp.mul(tv1, c3)
              , e1 = Fp.eql(Fp.sqr(tv2), n)
              , e2 = Fp.eql(Fp.sqr(tv3), n);
            tv1 = Fp.cmov(tv1, tv2, e1),
            tv2 = Fp.cmov(tv4, tv3, e2);
            const e3 = Fp.eql(Fp.sqr(tv2), n)
              , root = Fp.cmov(tv1, tv2, e3);
            return assertIsSquare(Fp, root, n),
            root
        }
    }(P) : tonelliShanks(P)
}
const FIELD_FIELDS = ["create", "isValid", "is0", "neg", "inv", "sqrt", "sqr", "eql", "add", "sub", "mul", "pow", "div", "addN", "subN", "mulN", "sqrN"];
function FpInvertBatch(Fp, nums, passZero=!1) {
    const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0)
      , multipliedAcc = nums.reduce( (acc, num, i) => Fp.is0(num) ? acc : (inverted[i] = acc,
    Fp.mul(acc, num)), Fp.ONE)
      , invertedAcc = Fp.inv(multipliedAcc);
    return nums.reduceRight( (acc, num, i) => Fp.is0(num) ? acc : (inverted[i] = Fp.mul(acc, inverted[i]),
    Fp.mul(acc, num)), invertedAcc),
    inverted
}
function FpLegendre(Fp, n) {
    const p1mod2 = (Fp.ORDER - _1n$2) / _2n$1
      , powered = Fp.pow(n, p1mod2)
      , yes = Fp.eql(powered, Fp.ONE)
      , zero = Fp.eql(powered, Fp.ZERO)
      , no = Fp.eql(powered, Fp.neg(Fp.ONE));
    if (!yes && !zero && !no)
        throw new Error("invalid Legendre symbol result");
    return yes ? 1 : zero ? 0 : -1
}
class _Field {
    ORDER;
    BITS;
    BYTES;
    isLE;
    ZERO = _0n$2;
    ONE = _1n$2;
    _lengths;
    _sqrt;
    _mod;
    constructor(ORDER, opts={}) {
        if (ORDER <= _0n$2)
            throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
        let _nbitLength;
        this.isLE = !1,
        null != opts && "object" == typeof opts && ("number" == typeof opts.BITS && (_nbitLength = opts.BITS),
        "function" == typeof opts.sqrt && (this.sqrt = opts.sqrt),
        "boolean" == typeof opts.isLE && (this.isLE = opts.isLE),
        opts.allowedLengths && (this._lengths = opts.allowedLengths?.slice()),
        "boolean" == typeof opts.modFromBytes && (this._mod = opts.modFromBytes));
        const {nBitLength: nBitLength, nByteLength: nByteLength} = function(n, nBitLength) {
            void 0 !== nBitLength && anumber(nBitLength);
            const _nBitLength = void 0 !== nBitLength ? nBitLength : n.toString(2).length;
            return {
                nBitLength: _nBitLength,
                nByteLength: Math.ceil(_nBitLength / 8)
            }
        }(ORDER, _nbitLength);
        if (nByteLength > 2048)
            throw new Error("invalid field: expected ORDER of <= 2048 bytes");
        this.ORDER = ORDER,
        this.BITS = nBitLength,
        this.BYTES = nByteLength,
        this._sqrt = void 0,
        Object.preventExtensions(this)
    }
    create(num) {
        return mod(num, this.ORDER)
    }
    isValid(num) {
        if ("bigint" != typeof num)
            throw new Error("invalid field element: expected bigint, got " + typeof num);
        return _0n$2 <= num && num < this.ORDER
    }
    is0(num) {
        return num === _0n$2
    }
    isValidNot0(num) {
        return !this.is0(num) && this.isValid(num)
    }
    isOdd(num) {
        return (num & _1n$2) === _1n$2
    }
    neg(num) {
        return mod(-num, this.ORDER)
    }
    eql(lhs, rhs) {
        return lhs === rhs
    }
    sqr(num) {
        return mod(num * num, this.ORDER)
    }
    add(lhs, rhs) {
        return mod(lhs + rhs, this.ORDER)
    }
    sub(lhs, rhs) {
        return mod(lhs - rhs, this.ORDER)
    }
    mul(lhs, rhs) {
        return mod(lhs * rhs, this.ORDER)
    }
    pow(num, power) {
        return function(Fp, num, power) {
            if (power < _0n$2)
                throw new Error("invalid exponent, negatives unsupported");
            if (power === _0n$2)
                return Fp.ONE;
            if (power === _1n$2)
                return num;
            let p = Fp.ONE
              , d = num;
            for (; power > _0n$2; )
                power & _1n$2 && (p = Fp.mul(p, d)),
                d = Fp.sqr(d),
                power >>= _1n$2;
            return p
        }(this, num, power)
    }
    div(lhs, rhs) {
        return mod(lhs * invert(rhs, this.ORDER), this.ORDER)
    }
    sqrN(num) {
        return num * num
    }
    addN(lhs, rhs) {
        return lhs + rhs
    }
    subN(lhs, rhs) {
        return lhs - rhs
    }
    mulN(lhs, rhs) {
        return lhs * rhs
    }
    inv(num) {
        return invert(num, this.ORDER)
    }
    sqrt(num) {
        return this._sqrt || (this._sqrt = FpSqrt(this.ORDER)),
        this._sqrt(this, num)
    }
    toBytes(num) {
        return this.isLE ? numberToBytesLE(num, this.BYTES) : numberToBytesBE(num, this.BYTES)
    }
    fromBytes(bytes, skipValidation=!1) {
        abytes(bytes);
        const {_lengths: allowedLengths, BYTES: BYTES, isLE: isLE, ORDER: ORDER, _mod: modFromBytes} = this;
        if (allowedLengths) {
            if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES)
                throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
            const padded = new Uint8Array(BYTES);
            padded.set(bytes, isLE ? 0 : padded.length - bytes.length),
            bytes = padded
        }
        if (bytes.length !== BYTES)
            throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
        let scalar = isLE ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
        if (modFromBytes && (scalar = mod(scalar, ORDER)),
        !skipValidation && !this.isValid(scalar))
            throw new Error("invalid field element: outside of range 0..ORDER");
        return scalar
    }
    invertBatch(lst) {
        return FpInvertBatch(this, lst)
    }
    cmov(a, b, condition) {
        return condition ? b : a
    }
}
function Field(ORDER, opts={}) {
    return new _Field(ORDER,opts)
}
function getFieldBytesLength(fieldOrder) {
    if ("bigint" != typeof fieldOrder)
        throw new Error("field order must be bigint");
    const bitLength = fieldOrder.toString(2).length;
    return Math.ceil(bitLength / 8)
}
function getMinHashLength(fieldOrder) {
    const length = getFieldBytesLength(fieldOrder);
    return length + Math.ceil(length / 2)
}
const _0n$1 = BigInt(0)
  , _1n$1 = BigInt(1);
function negateCt(condition, item) {
    const neg = item.negate();
    return condition ? neg : item
}
function normalizeZ(c, points) {
    const invertedZs = FpInvertBatch(c.Fp, points.map(p => p.Z));
    return points.map( (p, i) => c.fromAffine(p.toAffine(invertedZs[i])))
}
function validateW(W, bits) {
    if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
        throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W)
}
function calcWOpts(W, scalarBits) {
    validateW(W, scalarBits);
    const maxNumber = 2 ** W;
    return {
        windows: Math.ceil(scalarBits / W) + 1,
        windowSize: 2 ** (W - 1),
        mask: bitMask(W),
        maxNumber: maxNumber,
        shiftBy: BigInt(W)
    }
}
function calcOffsets(n, window, wOpts) {
    const {windowSize: windowSize, mask: mask, maxNumber: maxNumber, shiftBy: shiftBy} = wOpts;
    let wbits = Number(n & mask)
      , nextN = n >> shiftBy;
    wbits > windowSize && (wbits -= maxNumber,
    nextN += _1n$1);
    const offsetStart = window * windowSize;
    return {
        nextN: nextN,
        offset: offsetStart + Math.abs(wbits) - 1,
        isZero: 0 === wbits,
        isNeg: wbits < 0,
        isNegF: window % 2 != 0,
        offsetF: offsetStart
    }
}
const pointPrecomputes = new WeakMap
  , pointWindowSizes = new WeakMap;
function getW(P) {
    return pointWindowSizes.get(P) || 1
}
function assert0(n) {
    if (n !== _0n$1)
        throw new Error("invalid wNAF")
}
class wNAF {
    BASE;
    ZERO;
    Fn;
    bits;
    constructor(Point, bits) {
        this.BASE = Point.BASE,
        this.ZERO = Point.ZERO,
        this.Fn = Point.Fn,
        this.bits = bits
    }
    _unsafeLadder(elm, n, p=this.ZERO) {
        let d = elm;
        for (; n > _0n$1; )
            n & _1n$1 && (p = p.add(d)),
            d = d.double(),
            n >>= _1n$1;
        return p
    }
    precomputeWindow(point, W) {
        const {windows: windows, windowSize: windowSize} = calcWOpts(W, this.bits)
          , points = [];
        let p = point
          , base = p;
        for (let window = 0; window < windows; window++) {
            base = p,
            points.push(base);
            for (let i = 1; i < windowSize; i++)
                base = base.add(p),
                points.push(base);
            p = base.double()
        }
        return points
    }
    wNAF(W, precomputes, n) {
        if (!this.Fn.isValid(n))
            throw new Error("invalid scalar");
        let p = this.ZERO
          , f = this.BASE;
        const wo = calcWOpts(W, this.bits);
        for (let window = 0; window < wo.windows; window++) {
            const {nextN: nextN, offset: offset, isZero: isZero, isNeg: isNeg, isNegF: isNegF, offsetF: offsetF} = calcOffsets(n, window, wo);
            n = nextN,
            isZero ? f = f.add(negateCt(isNegF, precomputes[offsetF])) : p = p.add(negateCt(isNeg, precomputes[offset]))
        }
        return assert0(n),
        {
            p: p,
            f: f
        }
    }
    wNAFUnsafe(W, precomputes, n, acc=this.ZERO) {
        const wo = calcWOpts(W, this.bits);
        for (let window = 0; window < wo.windows && n !== _0n$1; window++) {
            const {nextN: nextN, offset: offset, isZero: isZero, isNeg: isNeg} = calcOffsets(n, window, wo);
            if (n = nextN,
            !isZero) {
                const item = precomputes[offset];
                acc = acc.add(isNeg ? item.negate() : item)
            }
        }
        return assert0(n),
        acc
    }
    getPrecomputes(W, point, transform) {
        let comp = pointPrecomputes.get(point);
        return comp || (comp = this.precomputeWindow(point, W),
        1 !== W && ("function" == typeof transform && (comp = transform(comp)),
        pointPrecomputes.set(point, comp))),
        comp
    }
    cached(point, scalar, transform) {
        const W = getW(point);
        return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar)
    }
    unsafe(point, scalar, transform, prev) {
        const W = getW(point);
        return 1 === W ? this._unsafeLadder(point, scalar, prev) : this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev)
    }
    createCache(P, W) {
        validateW(W, this.bits),
        pointWindowSizes.set(P, W),
        pointPrecomputes.delete(P)
    }
    hasCache(elm) {
        return 1 !== getW(elm)
    }
}
function createField(order, field, isLE) {
    if (field) {
        if (field.ORDER !== order)
            throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
        return function(field) {
            validateObject(field, FIELD_FIELDS.reduce( (map, val) => (map[val] = "function",
            map), {
                ORDER: "bigint",
                BYTES: "number",
                BITS: "number"
            }))
        }(field),
        field
    }
    return Field(order, {
        isLE: isLE
    })
}

const divNearest = (num, den) => (num + (num >= 0 ? den : -den) / _2n) / den;
function _splitEndoScalar(k, basis, n) {
    const [[a1,b1],[a2,b2]] = basis
      , c1 = divNearest(b2 * k, n)
      , c2 = divNearest(-b1 * k, n);
    let k1 = k - c1 * a1 - c2 * a2
      , k2 = -c1 * b1 - c2 * b2;
    const k1neg = k1 < _0n
      , k2neg = k2 < _0n;
    k1neg && (k1 = -k1),
    k2neg && (k2 = -k2);
    const MAX_NUM = bitMask(Math.ceil(function(n) {
        let len;
        for (len = 0; n > _0n$3; n >>= _1n$3,
        len += 1)
            ;
        return len
    }(n) / 2)) + _1n;
    if (k1 < _0n || k1 >= MAX_NUM || k2 < _0n || k2 >= MAX_NUM)
        throw new Error("splitScalar (endomorphism): failed, k=" + k);
    return {
        k1neg: k1neg,
        k1: k1,
        k2neg: k2neg,
        k2: k2
    }
}
function validateSigFormat(format) {
    if (!["compact", "recovered", "der"].includes(format))
        throw new Error('Signature format must be "compact", "recovered", or "der"');
    return format
}
function validateSigOpts(opts, def) {
    const optsn = {};
    for (let optName of Object.keys(def))
        optsn[optName] = void 0 === opts[optName] ? def[optName] : opts[optName];
    return abool(optsn.lowS, "lowS"),
    abool(optsn.prehash, "prehash"),
    void 0 !== optsn.format && validateSigFormat(optsn.format),
    optsn
}
class DERErr extends Error {
    constructor(m="") {
        super(m)
    }
}
const DER = {
    Err: DERErr,
    _tlv: {
        encode: (tag, data) => {
            const {Err: E} = DER;
            if (tag < 0 || tag > 256)
                throw new E("tlv.encode: wrong tag");
            if (1 & data.length)
                throw new E("tlv.encode: unpadded data");
            const dataLen = data.length / 2
              , len = numberToHexUnpadded(dataLen);
            if (len.length / 2 & 128)
                throw new E("tlv.encode: long form length too big");
            const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
            return numberToHexUnpadded(tag) + lenLen + len + data
        }
        ,
        decode(tag, data) {
            const {Err: E} = DER;
            let pos = 0;
            if (tag < 0 || tag > 256)
                throw new E("tlv.encode: wrong tag");
            if (data.length < 2 || data[pos++] !== tag)
                throw new E("tlv.decode: wrong tlv");
            const first = data[pos++];
            let length = 0;
            if (!!(128 & first)) {
                const lenLen = 127 & first;
                if (!lenLen)
                    throw new E("tlv.decode(long): indefinite length not supported");
                if (lenLen > 4)
                    throw new E("tlv.decode(long): byte length is too big");
                const lengthBytes = data.subarray(pos, pos + lenLen);
                if (lengthBytes.length !== lenLen)
                    throw new E("tlv.decode: length bytes not complete");
                if (0 === lengthBytes[0])
                    throw new E("tlv.decode(long): zero leftmost byte");
                for (const b of lengthBytes)
                    length = length << 8 | b;
                if (pos += lenLen,
                length < 128)
                    throw new E("tlv.decode(long): not minimal encoding")
            } else
                length = first;
            const v = data.subarray(pos, pos + length);
            if (v.length !== length)
                throw new E("tlv.decode: wrong value length");
            return {
                v: v,
                l: data.subarray(pos + length)
            }
        }
    },
    _int: {
        encode(num) {
            const {Err: E} = DER;
            if (num < _0n)
                throw new E("integer: negative integers are not allowed");
            let hex = numberToHexUnpadded(num);
            if (8 & Number.parseInt(hex[0], 16) && (hex = "00" + hex),
            1 & hex.length)
                throw new E("unexpected DER parsing assertion: unpadded hex");
            return hex
        },
        decode(data) {
            const {Err: E} = DER;
            if (128 & data[0])
                throw new E("invalid signature integer: negative");
            if (0 === data[0] && !(128 & data[1]))
                throw new E("invalid signature integer: unnecessary leading zero");
            return bytesToNumberBE(data)
        }
    },
    toSig(bytes) {
        const {Err: E, _int: int, _tlv: tlv} = DER
          , data = abytes(bytes, void 0, "signature")
          , {v: seqBytes, l: seqLeftBytes} = tlv.decode(48, data);
        if (seqLeftBytes.length)
            throw new E("invalid signature: left bytes after parsing");
        const {v: rBytes, l: rLeftBytes} = tlv.decode(2, seqBytes)
          , {v: sBytes, l: sLeftBytes} = tlv.decode(2, rLeftBytes);
        if (sLeftBytes.length)
            throw new E("invalid signature: left bytes after parsing");
        return {
            r: int.decode(rBytes),
            s: int.decode(sBytes)
        }
    },
    hexFromSig(sig) {
        const {_tlv: tlv, _int: int} = DER
          , seq = tlv.encode(2, int.encode(sig.r)) + tlv.encode(2, int.encode(sig.s));
        return tlv.encode(48, seq)
    }
}
  , _0n = BigInt(0)
  , _1n = BigInt(1)
  , _2n = BigInt(2)
  , _3n = BigInt(3)
  , _4n = BigInt(4);
function weierstrass(params, extraOpts={}) {
    const validated = function(type, CURVE, curveOpts={}, FpFnLE) {
        if (void 0 === FpFnLE && (FpFnLE = "edwards" === type),
        !CURVE || "object" != typeof CURVE)
            throw new Error(`expected valid ${type} CURVE object`);
        for (const p of ["p", "n", "h"]) {
            const val = CURVE[p];
            if (!("bigint" == typeof val && val > _0n$1))
                throw new Error(`CURVE.${p} must be positive bigint`)
        }
        const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE)
          , Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE)
          , params = ["Gx", "Gy", "a", "b"];
        for (const p of params)
            if (!Fp.isValid(CURVE[p]))
                throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
        return {
            CURVE: CURVE = Object.freeze(Object.assign({}, CURVE)),
            Fp: Fp,
            Fn: Fn
        }
    }("weierstrass", params, extraOpts)
      , {Fp: Fp, Fn: Fn} = validated;
    let CURVE = validated.CURVE;
    const {h: cofactor, n: CURVE_ORDER} = CURVE;
    validateObject(extraOpts, {}, {
        allowInfinityPoint: "boolean",
        clearCofactor: "function",
        isTorsionFree: "function",
        fromBytes: "function",
        toBytes: "function",
        endo: "object"
    });
    const {endo: endo} = extraOpts;
    if (endo && (!Fp.is0(CURVE.a) || "bigint" != typeof endo.beta || !Array.isArray(endo.basises)))
        throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    const lengths = getWLengths(Fp, Fn);
    function assertCompressionIsSupported() {
        if (!Fp.isOdd)
            throw new Error("compression is not supported: Field does not have .isOdd()")
    }
    const encodePoint = extraOpts.toBytes || function(_c, point, isCompressed) {
        const {x: x, y: y} = point.toAffine()
          , bx = Fp.toBytes(x);
        if (abool(isCompressed, "isCompressed"),
        isCompressed) {
            assertCompressionIsSupported();
            return concatBytes(pprefix(!Fp.isOdd(y)), bx)
        }
        return concatBytes(Uint8Array.of(4), bx, Fp.toBytes(y))
    }
      , decodePoint = extraOpts.fromBytes || function(bytes) {
        abytes(bytes, void 0, "Point");
        const {publicKey: comp, publicKeyUncompressed: uncomp} = lengths
          , length = bytes.length
          , head = bytes[0]
          , tail = bytes.subarray(1);
        if (length !== comp || 2 !== head && 3 !== head) {
            if (length === uncomp && 4 === head) {
                const L = Fp.BYTES
                  , x = Fp.fromBytes(tail.subarray(0, L))
                  , y = Fp.fromBytes(tail.subarray(L, 2 * L));
                if (!isValidXY(x, y))
                    throw new Error("bad point: is not on curve");
                return {
                    x: x,
                    y: y
                }
            }
            throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`)
        }
        {
            const x = Fp.fromBytes(tail);
            if (!Fp.isValid(x))
                throw new Error("bad point: is not on curve, wrong x");
            const y2 = weierstrassEquation(x);
            let y;
            try {
                y = Fp.sqrt(y2)
            } catch (sqrtError) {
                const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
                throw new Error("bad point: is not on curve, sqrt error" + err)
            }
            assertCompressionIsSupported();
            return !(1 & ~head) !== Fp.isOdd(y) && (y = Fp.neg(y)),
            {
                x: x,
                y: y
            }
        }
    }
    ;
    function weierstrassEquation(x) {
        const x2 = Fp.sqr(x)
          , x3 = Fp.mul(x2, x);
        return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b)
    }
    function isValidXY(x, y) {
        const left = Fp.sqr(y)
          , right = weierstrassEquation(x);
        return Fp.eql(left, right)
    }
    if (!isValidXY(CURVE.Gx, CURVE.Gy))
        throw new Error("bad curve params: generator point");
    const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n), _4n)
      , _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
    if (Fp.is0(Fp.add(_4a3, _27b2)))
        throw new Error("bad curve params: a or b");
    function acoord(title, n, banZero=!1) {
        if (!Fp.isValid(n) || banZero && Fp.is0(n))
            throw new Error(`bad point coordinate ${title}`);
        return n
    }
    function aprjpoint(other) {
        if (!(other instanceof Point))
            throw new Error("Weierstrass Point expected")
    }
    function splitEndoScalarN(k) {
        if (!endo || !endo.basises)
            throw new Error("no endo");
        return _splitEndoScalar(k, endo.basises, Fn.ORDER)
    }
    const toAffineMemo = memoized( (p, iz) => {
        const {X: X, Y: Y, Z: Z} = p;
        if (Fp.eql(Z, Fp.ONE))
            return {
                x: X,
                y: Y
            };
        const is0 = p.is0();
        null == iz && (iz = is0 ? Fp.ONE : Fp.inv(Z));
        const x = Fp.mul(X, iz)
          , y = Fp.mul(Y, iz)
          , zz = Fp.mul(Z, iz);
        if (is0)
            return {
                x: Fp.ZERO,
                y: Fp.ZERO
            };
        if (!Fp.eql(zz, Fp.ONE))
            throw new Error("invZ was invalid");
        return {
            x: x,
            y: y
        }
    }
    )
      , assertValidMemo = memoized(p => {
        if (p.is0()) {
            if (extraOpts.allowInfinityPoint && !Fp.is0(p.Y))
                return;
            throw new Error("bad point: ZERO")
        }
        const {x: x, y: y} = p.toAffine();
        if (!Fp.isValid(x) || !Fp.isValid(y))
            throw new Error("bad point: x or y not field elements");
        if (!isValidXY(x, y))
            throw new Error("bad point: equation left != right");
        if (!p.isTorsionFree())
            throw new Error("bad point: not in prime-order subgroup");
        return !0
    }
    );
    function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
        return k2p = new Point(Fp.mul(k2p.X, endoBeta),k2p.Y,k2p.Z),
        k1p = negateCt(k1neg, k1p),
        k2p = negateCt(k2neg, k2p),
        k1p.add(k2p)
    }
    class Point {
        static BASE = new Point(CURVE.Gx,CURVE.Gy,Fp.ONE);
        static ZERO = new Point(Fp.ZERO,Fp.ONE,Fp.ZERO);
        static Fp = Fp;
        static Fn = Fn;
        X;
        Y;
        Z;
        constructor(X, Y, Z) {
            this.X = acoord("x", X),
            this.Y = acoord("y", Y, !0),
            this.Z = acoord("z", Z),
            Object.freeze(this)
        }
        static CURVE() {
            return CURVE
        }
        static fromAffine(p) {
            const {x: x, y: y} = p || {};
            if (!p || !Fp.isValid(x) || !Fp.isValid(y))
                throw new Error("invalid affine point");
            if (p instanceof Point)
                throw new Error("projective point not allowed");
            return Fp.is0(x) && Fp.is0(y) ? Point.ZERO : new Point(x,y,Fp.ONE)
        }
        static fromBytes(bytes) {
            const P = Point.fromAffine(decodePoint(abytes(bytes, void 0, "point")));
            return P.assertValidity(),
            P
        }
        static fromHex(hex) {
            return Point.fromBytes(hexToBytes(hex))
        }
        get x() {
            return this.toAffine().x
        }
        get y() {
            return this.toAffine().y
        }
        precompute(windowSize=8, isLazy=!0) {
            return wnaf.createCache(this, windowSize),
            isLazy || this.multiply(_3n),
            this
        }
        assertValidity() {
            assertValidMemo(this)
        }
        hasEvenY() {
            const {y: y} = this.toAffine();
            if (!Fp.isOdd)
                throw new Error("Field doesn't support isOdd");
            return !Fp.isOdd(y)
        }
        equals(other) {
            aprjpoint(other);
            const {X: X1, Y: Y1, Z: Z1} = this
              , {X: X2, Y: Y2, Z: Z2} = other
              , U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1))
              , U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
            return U1 && U2
        }
        negate() {
            return new Point(this.X,Fp.neg(this.Y),this.Z)
        }
        double() {
            const {a: a, b: b} = CURVE
              , b3 = Fp.mul(b, _3n)
              , {X: X1, Y: Y1, Z: Z1} = this;
            let X3 = Fp.ZERO
              , Y3 = Fp.ZERO
              , Z3 = Fp.ZERO
              , t0 = Fp.mul(X1, X1)
              , t1 = Fp.mul(Y1, Y1)
              , t2 = Fp.mul(Z1, Z1)
              , t3 = Fp.mul(X1, Y1);
            return t3 = Fp.add(t3, t3),
            Z3 = Fp.mul(X1, Z1),
            Z3 = Fp.add(Z3, Z3),
            X3 = Fp.mul(a, Z3),
            Y3 = Fp.mul(b3, t2),
            Y3 = Fp.add(X3, Y3),
            X3 = Fp.sub(t1, Y3),
            Y3 = Fp.add(t1, Y3),
            Y3 = Fp.mul(X3, Y3),
            X3 = Fp.mul(t3, X3),
            Z3 = Fp.mul(b3, Z3),
            t2 = Fp.mul(a, t2),
            t3 = Fp.sub(t0, t2),
            t3 = Fp.mul(a, t3),
            t3 = Fp.add(t3, Z3),
            Z3 = Fp.add(t0, t0),
            t0 = Fp.add(Z3, t0),
            t0 = Fp.add(t0, t2),
            t0 = Fp.mul(t0, t3),
            Y3 = Fp.add(Y3, t0),
            t2 = Fp.mul(Y1, Z1),
            t2 = Fp.add(t2, t2),
            t0 = Fp.mul(t2, t3),
            X3 = Fp.sub(X3, t0),
            Z3 = Fp.mul(t2, t1),
            Z3 = Fp.add(Z3, Z3),
            Z3 = Fp.add(Z3, Z3),
            new Point(X3,Y3,Z3)
        }
        add(other) {
            aprjpoint(other);
            const {X: X1, Y: Y1, Z: Z1} = this
              , {X: X2, Y: Y2, Z: Z2} = other;
            let X3 = Fp.ZERO
              , Y3 = Fp.ZERO
              , Z3 = Fp.ZERO;
            const a = CURVE.a
              , b3 = Fp.mul(CURVE.b, _3n);
            let t0 = Fp.mul(X1, X2)
              , t1 = Fp.mul(Y1, Y2)
              , t2 = Fp.mul(Z1, Z2)
              , t3 = Fp.add(X1, Y1)
              , t4 = Fp.add(X2, Y2);
            t3 = Fp.mul(t3, t4),
            t4 = Fp.add(t0, t1),
            t3 = Fp.sub(t3, t4),
            t4 = Fp.add(X1, Z1);
            let t5 = Fp.add(X2, Z2);
            return t4 = Fp.mul(t4, t5),
            t5 = Fp.add(t0, t2),
            t4 = Fp.sub(t4, t5),
            t5 = Fp.add(Y1, Z1),
            X3 = Fp.add(Y2, Z2),
            t5 = Fp.mul(t5, X3),
            X3 = Fp.add(t1, t2),
            t5 = Fp.sub(t5, X3),
            Z3 = Fp.mul(a, t4),
            X3 = Fp.mul(b3, t2),
            Z3 = Fp.add(X3, Z3),
            X3 = Fp.sub(t1, Z3),
            Z3 = Fp.add(t1, Z3),
            Y3 = Fp.mul(X3, Z3),
            t1 = Fp.add(t0, t0),
            t1 = Fp.add(t1, t0),
            t2 = Fp.mul(a, t2),
            t4 = Fp.mul(b3, t4),
            t1 = Fp.add(t1, t2),
            t2 = Fp.sub(t0, t2),
            t2 = Fp.mul(a, t2),
            t4 = Fp.add(t4, t2),
            t0 = Fp.mul(t1, t4),
            Y3 = Fp.add(Y3, t0),
            t0 = Fp.mul(t5, t4),
            X3 = Fp.mul(t3, X3),
            X3 = Fp.sub(X3, t0),
            t0 = Fp.mul(t3, t1),
            Z3 = Fp.mul(t5, Z3),
            Z3 = Fp.add(Z3, t0),
            new Point(X3,Y3,Z3)
        }
        subtract(other) {
            return this.add(other.negate())
        }
        is0() {
            return this.equals(Point.ZERO)
        }
        multiply(scalar) {
            const {endo: endo2} = extraOpts;
            if (!Fn.isValidNot0(scalar))
                throw new Error("invalid scalar: out of range");
            let point, fake;
            const mul = n => wnaf.cached(this, n, p => normalizeZ(Point, p));
            if (endo2) {
                const {k1neg: k1neg, k1: k1, k2neg: k2neg, k2: k2} = splitEndoScalarN(scalar)
                  , {p: k1p, f: k1f} = mul(k1)
                  , {p: k2p, f: k2f} = mul(k2);
                fake = k1f.add(k2f),
                point = finishEndo(endo2.beta, k1p, k2p, k1neg, k2neg)
            } else {
                const {p: p, f: f} = mul(scalar);
                point = p,
                fake = f
            }
            return normalizeZ(Point, [point, fake])[0]
        }
        multiplyUnsafe(sc) {
            const {endo: endo2} = extraOpts
              , p = this;
            if (!Fn.isValid(sc))
                throw new Error("invalid scalar: out of range");
            if (sc === _0n || p.is0())
                return Point.ZERO;
            if (sc === _1n)
                return p;
            if (wnaf.hasCache(this))
                return this.multiply(sc);
            if (endo2) {
                const {k1neg: k1neg, k1: k1, k2neg: k2neg, k2: k2} = splitEndoScalarN(sc)
                  , {p1: p1, p2: p2} = function(Point, point, k1, k2) {
                    let acc = point
                      , p1 = Point.ZERO
                      , p2 = Point.ZERO;
                    for (; k1 > _0n$1 || k2 > _0n$1; )
                        k1 & _1n$1 && (p1 = p1.add(acc)),
                        k2 & _1n$1 && (p2 = p2.add(acc)),
                        acc = acc.double(),
                        k1 >>= _1n$1,
                        k2 >>= _1n$1;
                    return {
                        p1: p1,
                        p2: p2
                    }
                }(Point, p, k1, k2);
                return finishEndo(endo2.beta, p1, p2, k1neg, k2neg)
            }
            return wnaf.unsafe(p, sc)
        }
        toAffine(invertedZ) {
            return toAffineMemo(this, invertedZ)
        }
        isTorsionFree() {
            const {isTorsionFree: isTorsionFree} = extraOpts;
            return cofactor === _1n || (isTorsionFree ? isTorsionFree(Point, this) : wnaf.unsafe(this, CURVE_ORDER).is0())
        }
        clearCofactor() {
            const {clearCofactor: clearCofactor} = extraOpts;
            return cofactor === _1n ? this : clearCofactor ? clearCofactor(Point, this) : this.multiplyUnsafe(cofactor)
        }
        isSmallOrder() {
            return this.multiplyUnsafe(cofactor).is0()
        }
        toBytes(isCompressed=!0) {
            return abool(isCompressed, "isCompressed"),
            this.assertValidity(),
            encodePoint(Point, this, isCompressed)
        }
        toHex(isCompressed=!0) {
            return bytesToHex(this.toBytes(isCompressed))
        }
        toString() {
            return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`
        }
    }
    const bits = Fn.BITS
      , wnaf = new wNAF(Point,extraOpts.endo ? Math.ceil(bits / 2) : bits);
    return Point.BASE.precompute(8),
    Point
}
function pprefix(hasEvenY) {
    return Uint8Array.of(hasEvenY ? 2 : 3)
}
function getWLengths(Fp, Fn) {
    return {
        secretKey: Fn.BYTES,
        publicKey: 1 + Fp.BYTES,
        publicKeyUncompressed: 1 + 2 * Fp.BYTES,
        publicKeyHasPrefix: !0,
        signature: 2 * Fn.BYTES
    }
}
function ecdh(Point, ecdhOpts={}) {
    const {Fn: Fn} = Point
      , randomBytes_ = ecdhOpts.randomBytes || randomBytes
      , lengths = Object.assign(getWLengths(Point.Fp, Fn), {
        seed: getMinHashLength(Fn.ORDER)
    });
    function randomSecretKey(seed=randomBytes_(lengths.seed)) {
        return function(key, fieldOrder, isLE=!1) {
            abytes(key);
            const len = key.length
              , fieldLen = getFieldBytesLength(fieldOrder)
              , minLen = getMinHashLength(fieldOrder);
            if (len < 16 || len < minLen || len > 1024)
                throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
            const reduced = mod(isLE ? bytesToNumberLE(key) : bytesToNumberBE(key), fieldOrder - _1n$2) + _1n$2;
            return isLE ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen)
        }(abytes(seed, lengths.seed, "seed"), Fn.ORDER)
    }
    function getPublicKey(secretKey, isCompressed=!0) {
        return Point.BASE.multiply(Fn.fromBytes(secretKey)).toBytes(isCompressed)
    }
    function isProbPub(item) {
        const {secretKey: secretKey, publicKey: publicKey, publicKeyUncompressed: publicKeyUncompressed} = lengths;
        if (!isBytes(item))
            return;
        if ("_lengths"in Fn && Fn._lengths || secretKey === publicKey)
            return;
        const l = abytes(item, void 0, "key").length;
        return l === publicKey || l === publicKeyUncompressed
    }
    const utils = {
        isValidSecretKey: function(secretKey) {
            try {
                const num = Fn.fromBytes(secretKey);
                return Fn.isValidNot0(num)
            } catch (error) {
                return !1
            }
        },
        isValidPublicKey: function(publicKey, isCompressed) {
            const {publicKey: comp, publicKeyUncompressed: publicKeyUncompressed} = lengths;
            try {
                const l = publicKey.length;
                return (!0 !== isCompressed || l === comp) && ((!1 !== isCompressed || l === publicKeyUncompressed) && !!Point.fromBytes(publicKey))
            } catch (error) {
                return !1
            }
        },
        randomSecretKey: randomSecretKey
    }
      , keygen = function(randomSecretKey, getPublicKey) {
        return function(seed) {
            const secretKey = randomSecretKey(seed);
            return {
                secretKey: secretKey,
                publicKey: getPublicKey(secretKey)
            }
        }
    }(randomSecretKey, getPublicKey);
    return Object.freeze({
        getPublicKey: getPublicKey,
        getSharedSecret: function(secretKeyA, publicKeyB, isCompressed=!0) {
            if (!0 === isProbPub(secretKeyA))
                throw new Error("first arg must be private key");
            if (!1 === isProbPub(publicKeyB))
                throw new Error("second arg must be public key");
            const s = Fn.fromBytes(secretKeyA);
            return Point.fromBytes(publicKeyB).multiply(s).toBytes(isCompressed)
        },
        keygen: keygen,
        Point: Point,
        utils: utils,
        lengths: lengths
    })
}
function ecdsa(Point, hash, ecdsaOpts={}) {
    ahash(hash),
    validateObject(ecdsaOpts, {}, {
        hmac: "function",
        lowS: "boolean",
        randomBytes: "function",
        bits2int: "function",
        bits2int_modN: "function"
    });
    const randomBytes$1 = (ecdsaOpts = Object.assign({}, ecdsaOpts)).randomBytes || randomBytes
      , hmac$1 = ecdsaOpts.hmac || ( (key, msg) => hmac(hash, key, msg))
      , {Fp: Fp, Fn: Fn} = Point
      , {ORDER: CURVE_ORDER, BITS: fnBits} = Fn
      , {keygen: keygen, getPublicKey: getPublicKey, getSharedSecret: getSharedSecret, utils: utils, lengths: lengths} = ecdh(Point, ecdsaOpts)
      , defaultSigOpts = {
        prehash: !0,
        lowS: "boolean" != typeof ecdsaOpts.lowS || ecdsaOpts.lowS,
        format: "compact",
        extraEntropy: !1
    }
      , hasLargeCofactor = CURVE_ORDER * _2n < Fp.ORDER;
    function isBiggerThanHalfOrder(number) {
        return number > CURVE_ORDER >> _1n
    }
    function validateRS(title, num) {
        if (!Fn.isValidNot0(num))
            throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
        return num
    }
    function assertSmallCofactor() {
        if (hasLargeCofactor)
            throw new Error('"recovered" sig type is not supported for cofactor >2 curves')
    }
    function validateSigLength(bytes, format) {
        validateSigFormat(format);
        const size = lengths.signature;
        return abytes(bytes, "compact" === format ? size : "recovered" === format ? size + 1 : void 0)
    }
    class Signature {
        r;
        s;
        recovery;
        constructor(r, s, recovery) {
            if (this.r = validateRS("r", r),
            this.s = validateRS("s", s),
            null != recovery) {
                if (assertSmallCofactor(),
                ![0, 1, 2, 3].includes(recovery))
                    throw new Error("invalid recovery id");
                this.recovery = recovery
            }
            Object.freeze(this)
        }
        static fromBytes(bytes, format=defaultSigOpts.format) {
            let recid;
            if (validateSigLength(bytes, format),
            "der" === format) {
                const {r: r2, s: s2} = DER.toSig(abytes(bytes));
                return new Signature(r2,s2)
            }
            "recovered" === format && (recid = bytes[0],
            format = "compact",
            bytes = bytes.subarray(1));
            const L = lengths.signature / 2
              , r = bytes.subarray(0, L)
              , s = bytes.subarray(L, 2 * L);
            return new Signature(Fn.fromBytes(r),Fn.fromBytes(s),recid)
        }
        static fromHex(hex, format) {
            return this.fromBytes(hexToBytes(hex), format)
        }
        assertRecovery() {
            const {recovery: recovery} = this;
            if (null == recovery)
                throw new Error("invalid recovery id: must be present");
            return recovery
        }
        addRecoveryBit(recovery) {
            return new Signature(this.r,this.s,recovery)
        }
        recoverPublicKey(messageHash) {
            const {r: r, s: s} = this
              , recovery = this.assertRecovery()
              , radj = 2 === recovery || 3 === recovery ? r + CURVE_ORDER : r;
            if (!Fp.isValid(radj))
                throw new Error("invalid recovery id: sig.r+curve.n != R.x");
            const x = Fp.toBytes(radj)
              , R = Point.fromBytes(concatBytes(pprefix(!(1 & recovery)), x))
              , ir = Fn.inv(radj)
              , h = bits2int_modN(abytes(messageHash, void 0, "msgHash"))
              , u1 = Fn.create(-h * ir)
              , u2 = Fn.create(s * ir)
              , Q = Point.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
            if (Q.is0())
                throw new Error("invalid recovery: point at infinify");
            return Q.assertValidity(),
            Q
        }
        hasHighS() {
            return isBiggerThanHalfOrder(this.s)
        }
        toBytes(format=defaultSigOpts.format) {
            if (validateSigFormat(format),
            "der" === format)
                return hexToBytes(DER.hexFromSig(this));
            const {r: r, s: s} = this
              , rb = Fn.toBytes(r)
              , sb = Fn.toBytes(s);
            return "recovered" === format ? (assertSmallCofactor(),
            concatBytes(Uint8Array.of(this.assertRecovery()), rb, sb)) : concatBytes(rb, sb)
        }
        toHex(format) {
            return bytesToHex(this.toBytes(format))
        }
    }
    const bits2int = ecdsaOpts.bits2int || function(bytes) {
        if (bytes.length > 8192)
            throw new Error("input is too large");
        const num = bytesToNumberBE(bytes)
          , delta = 8 * bytes.length - fnBits;
        return delta > 0 ? num >> BigInt(delta) : num
    }
      , bits2int_modN = ecdsaOpts.bits2int_modN || function(bytes) {
        return Fn.create(bits2int(bytes))
    }
      , ORDER_MASK = bitMask(fnBits);
    function int2octets(num) {
        return aInRange("num < 2^" + fnBits, num, _0n, ORDER_MASK),
        Fn.toBytes(num)
    }
    function validateMsgAndHash(message, prehash) {
        return abytes(message, void 0, "message"),
        prehash ? abytes(hash(message), void 0, "prehashed message") : message
    }
    return Object.freeze({
        keygen: keygen,
        getPublicKey: getPublicKey,
        getSharedSecret: getSharedSecret,
        utils: utils,
        lengths: lengths,
        Point: Point,
        sign: function(message, secretKey, opts={}) {
            const {seed: seed, k2sig: k2sig} = function(message, secretKey, opts) {
                const {lowS: lowS, prehash: prehash, extraEntropy: extraEntropy} = validateSigOpts(opts, defaultSigOpts);
                message = validateMsgAndHash(message, prehash);
                const h1int = bits2int_modN(message)
                  , d = Fn.fromBytes(secretKey);
                if (!Fn.isValidNot0(d))
                    throw new Error("invalid private key");
                const seedArgs = [int2octets(d), int2octets(h1int)];
                if (null != extraEntropy && !1 !== extraEntropy) {
                    const e = !0 === extraEntropy ? randomBytes$1(lengths.secretKey) : extraEntropy;
                    seedArgs.push(abytes(e, void 0, "extraEntropy"))
                }
                const seed = concatBytes(...seedArgs)
                  , m = h1int;
                return {
                    seed: seed,
                    k2sig: function(kBytes) {
                        const k = bits2int(kBytes);
                        if (!Fn.isValidNot0(k))
                            return;
                        const ik = Fn.inv(k)
                          , q = Point.BASE.multiply(k).toAffine()
                          , r = Fn.create(q.x);
                        if (r === _0n)
                            return;
                        const s = Fn.create(ik * Fn.create(m + r * d));
                        if (s === _0n)
                            return;
                        let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n)
                          , normS = s;
                        return lowS && isBiggerThanHalfOrder(s) && (normS = Fn.neg(s),
                        recovery ^= 1),
                        new Signature(r,normS,hasLargeCofactor ? void 0 : recovery)
                    }
                }
            }(message, secretKey, opts);
            return function(hashLen, qByteLen, hmacFn) {
                if (anumber(hashLen, "hashLen"),
                anumber(qByteLen, "qByteLen"),
                "function" != typeof hmacFn)
                    throw new Error("hmacFn must be a function");
                const u8n = len => new Uint8Array(len)
                  , NULL = Uint8Array.of()
                  , byte0 = Uint8Array.of(0)
                  , byte1 = Uint8Array.of(1);
                let v = u8n(hashLen)
                  , k = u8n(hashLen)
                  , i = 0;
                const reset = () => {
                    v.fill(1),
                    k.fill(0),
                    i = 0
                }
                  , h = (...msgs) => hmacFn(k, concatBytes(v, ...msgs))
                  , reseed = (seed=NULL) => {
                    k = h(byte0, seed),
                    v = h(),
                    0 !== seed.length && (k = h(byte1, seed),
                    v = h())
                }
                  , gen = () => {
                    if (i++ >= 1e3)
                        throw new Error("drbg: tried max amount of iterations");
                    let len = 0;
                    const out = [];
                    for (; len < qByteLen; ) {
                        v = h();
                        const sl = v.slice();
                        out.push(sl),
                        len += v.length
                    }
                    return concatBytes(...out)
                }
                ;
                return (seed, pred) => {
                    let res;
                    for (reset(),
                    reseed(seed); !(res = pred(gen())); )
                        reseed();
                    return reset(),
                    res
                }
            }(hash.outputLen, Fn.BYTES, hmac$1)(seed, k2sig).toBytes(opts.format)
        },
        verify: function(signature, message, publicKey, opts={}) {
            const {lowS: lowS, prehash: prehash, format: format} = validateSigOpts(opts, defaultSigOpts);
            if (publicKey = abytes(publicKey, void 0, "publicKey"),
            message = validateMsgAndHash(message, prehash),
            !isBytes(signature)) {
                throw new Error("verify expects Uint8Array signature" + (signature instanceof Signature ? ", use sig.toBytes()" : ""))
            }
            validateSigLength(signature, format);
            try {
                const sig = Signature.fromBytes(signature, format)
                  , P = Point.fromBytes(publicKey);
                if (lowS && sig.hasHighS())
                    return !1;
                const {r: r, s: s} = sig
                  , h = bits2int_modN(message)
                  , is = Fn.inv(s)
                  , u1 = Fn.create(h * is)
                  , u2 = Fn.create(r * is)
                  , R = Point.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2));
                if (R.is0())
                    return !1;
                return Fn.create(R.x) === r
            } catch (e) {
                return !1
            }
        },
        recoverPublicKey: function(signature, message, opts={}) {
            const {prehash: prehash} = validateSigOpts(opts, defaultSigOpts);
            return message = validateMsgAndHash(message, prehash),
            Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes()
        },
        Signature: Signature,
        hash: hash
    })
}
const p256 = ecdsa(weierstrass(( () => ({
    p: BigInt("0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff"),
    n: BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551"),
    h: BigInt(1),
    a: BigInt("0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc"),
    b: BigInt("0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b"),
    Gx: BigInt("0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296"),
    Gy: BigInt("0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5")
}))()), sha256);

export default p256;
