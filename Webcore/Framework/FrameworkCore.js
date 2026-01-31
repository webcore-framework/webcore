export default class FrameworkCore {
    static #instance = null;
    constructor(){
        if (FrameworkCore.#instance) {return FrameworkCore.#instance;}
        this.start();
        this.setupObjectExtension();
        this.setupNumberExtension();
        this.setupStringExtension();
        this.setupErrorExtension();
        this.setupOtherExtension();
        Object.freeze(this);
        FrameworkCore.#instance = this;
        Object.freeze(FrameworkCore);
        console.log("2. 框架核心已启动");
    }

    start(){
        // defineProperty
        Object.defineProperty(FrameworkCore, "defineProperty", {
            value: function defineProperty(target, key, val, desc={}){
                if (target === null){throw new TypeError("Target cannot be null or undefined.");}
                if (typeof target !== "object" && typeof target !== "function") {throw new TypeError("Target must be an object or function.");}
                if (typeof key !== "string" && typeof key !== "symbol") {throw new TypeError("Property key must be a string or symbol.");}
                Object.defineProperty(target, key, {writable: false, enumerable: false, configurable: false, ...desc, value: val});return true;
            },
            writable: false, enumerable: false, configurable: false
        });

        // 创建定义冻结属性的方法(不可修改，不可枚举，不可配置)
        Object.defineProperty(Object, "freezeProp", {
            value: function freezeProp(target, key, val){return FrameworkCore.defineProperty(target, key, val)},
            writable: false, enumerable: false, configurable: false
        });

        // 创建定义密封属性的方法(可修改，不可枚举，不可配置)
        Object.freezeProp(Object, "sealProp",
            function sealProp(target, key, val){return FrameworkCore.defineProperty(target, key, val, {writable: true});}
        );

        // 备份基础方法
        Object.freezeProp(FrameworkCore, "toString", Object.prototype.toString);

        // 检查类型
        Object.freezeProp(Object, "typeOf",
            function typeOf(target){
                if (target === undefined) {return "undefined";}
                if (target === null) {return "null";}
                return FrameworkCore.toString.call(target).replace(/^\[object (\S+)\]$/, "$1").toLowerCase();
            }
        );

        // 判断是否普通简单 Object 类型
        Object.freezeProp(Object, "isObject",
            function isObject(target){return FrameworkCore.toString.call(target) === "[object Object]";}
        );

        // 判断 Object 对象是否有原型
        Object.freezeProp(Object, "hasPrototype",
            function hasPrototype(target){
                if (target === null || typeof target !== "object"){return false;}
                return Object.getPrototypeOf(target) !== null && typeof Object.getPrototypeOf(target) === "object";
            }
        );

        // 返回没有原型的纯净 Object 对象（一般用于存储数据）
        Object.freezeProp(Object, "pure",
            function pure(target = null, clone = false){
                if (!Object.isObject(target)){return Object.create(null);}
                if (!Object.hasPrototype(target)){return target;}
                if (clone === true){
                    return Object.assign(Object.create(null), target);
                } else {
                    return Object.setPrototypeOf(target, null);
                }
            }
        );

    }

    // ------------------------------------  扩展 Object --------------------------------------
    setupObjectExtension(){
        // 获取实例的构造函数
        Object.freezeProp(Object, "getConstructorOf",
            function getConstructorOf(target){
                if (!Object.hasPrototype(target)){throw new TypeError("Object prototype is null.");}
                const proto = Object.getPrototypeOf(target);
                if (!Object.hasOwn(proto, "constructor") || typeof proto.constructor !== "function"){
                    throw new TypeError("Constructor is invalid.")
                }
                return proto.constructor;
            }
        );

        // 判断对象是否是某构造函数的实例（通过name属性判断，可能不准确，因为name属性可以被修改）
        Object.freezeProp(Object, "isClassInstance",
            function isClassInstance(target, name){
                if (typeof name !== "string"){return false;}
                if (!Object.hasPrototype(target)){return false;}
                const proto = Object.getPrototypeOf(target);
                if (Object.hasOwn(proto, "constructor") && Object.hasOwn(proto.constructor, "name")){
                    if (proto.constructor.name === name){return true;}
                }
                return false;
            }
        );

        // 判断是否 HTML 元素
        Object.freezeProp(Object, "isElement",
            function isElement(target){return target instanceof HTMLElement;}
        );
    }

    // ------------------------------------ 扩展 Number --------------------------------------
    setupNumberExtension(){
        // 判断是否为有效数字
        Object.freezeProp(Number, "isNumber",
            function isNumber(number){
                if (typeof number === "number" && Number.isFinite(number)) {return true;}
                return false;
            }
        );
    }

    // ------------------------------------ 扩展 String --------------------------------------
    setupStringExtension(){
        // 判断是否为空字符串
        Object.freezeProp(String, "isNullOrEmpty",
            function isNullOrEmpty(str){
                if (str === undefined || str === null || typeof str !== "string"){return true;}
                return str.length === 0;
            }
        );

        // 判断是否为空白字符串
        Object.freezeProp(String, "NON_WHITESPACE_REGEX", /\S/);                // 匹配时复用的正则对象
        Object.freezeProp(String, "isNullOrWhiteSpace",
            function isNullOrWhiteSpace(str){
                if (String.isNullOrEmpty(str)){return true;}
                return !String.NON_WHITESPACE_REGEX.test(str);
            }
        );

        // 判断是否为有效数字或非空字符（数字可以转换成字符串的应用场景中使用）
        Object.freezeProp(String, "isNumberOrString",
            function isNumberOrString(str){
                if (Number.isNumber(str) || !String.isNullOrEmpty(str)) {return true;}
                return false;
            }
        );
    }

    // ------------------------------------  扩展 Error --------------------------------------
    setupErrorExtension(){
        // 检查参数是否为Null
        Object.freezeProp(Error, "throwIfNull",
            function throwIfNull(target, name=null){
                if (target === undefined){
                    throw new TypeError(`${name || "Parameter"} is required.`);
                }
                if (target === null){
                    throw new TypeError(`${name || "Parameter"} cannot be null.`);
                }
                return true;
            }
        );


        // 检查参数是否为 String 类型
        Object.freezeProp(Error, "throwIfNotString",
            function throwIfNotString(target, name = null){
                Error.throwIfNull(target, name);
                if (typeof target !== "string"){
                    throw new TypeError(`${name || "Parameter"} must be of string type.`);
                }
                return true;
            }
        );

        // 检查参数是否为空字符
        Object.freezeProp(Error, "throwIfEmpty",
            function throwIfEmpty(target, name=null){
                Error.throwIfNotString(target, name);
                if (target.length === 0){
                    throw new TypeError(`${name || "Parameter"} cannot be empty.`);
                }
                return true;
            }
        );

        // 检查参数是否为空白字符
        Object.freezeProp(Error, "throwIfWhiteSpace",
            function throwIfWhiteSpace(target, name=null){
                Error.throwIfNotString(target, name);
                if (!String.NON_WHITESPACE_REGEX.test(target)){
                    throw new TypeError(`${name || "Parameter"} cannot be empty or whitespace.`);
                }
                return true;
            }
        );

        // 检查参数是否为普通对象
        Object.freezeProp(Error, "throwIfNotObject",
            function throwIfNotObject(target, name=null){
                if (!Object.isObject(target)){
                    throw new TypeError(`${name || "Parameter"} must be of object type.`);
                }
                return true;
            }
        );

        // 检查参数是否为函数
        Object.freezeProp(Error, "throwIfNotFunction",
            function throwIfNotFunction(target, name=null){
                if (typeof target !== "function"){
                    throw new TypeError(`${name || "Parameter"} must be of function type.`);
                }
                return true;
            }
        );

        // 检查参数是否为有效的数字
        Object.freezeProp(Error, "throwIfNotNumber",
            function throwIfNotNumber(target, name=null){
                if (typeof target !== "number" || !Number.isFinite(target)){
                    throw new TypeError(`${name || "Parameter"} must be of number type.`);
                }
                return true;
            }
        );

        // 检查参数是否为数组
        Object.freezeProp(Error, "throwIfNotArray",
            function throwIfNotArray(target, name=null){
                if (!Array.isArray(target)){
                    throw new TypeError(`${name || "Parameter"} must be of array type.`);
                }
                return true;
            }
        );

        // 检查参数是否为 HTML 元素
        Object.freezeProp(Error, "throwIfNotElement",
            function throwIfNotElement(target, name=null){
                if (typeof HTMLElement === 'undefined') {throw new Error("DOM API is not available in this environment.");}
                if (!(target instanceof HTMLElement)){
                    throw new TypeError(`${name || "Parameter"} must be a HTML element.`);
                }
                return true;
            }
        );

        // 检查参数是否为Null
        Object.freezeProp(Error, "throwIfNotHasOwn",
            function throwIfNotHasOwn(target, key, name){
                if (typeof target !== "object" && typeof target !== "function"){
                    throw new TypeError(`${name || key} must be of object type.`);
                }
                if (!Object.hasOwn(target, key)){
                    throw new TypeError(`${name || key} cannot be null or empty.`);
                }
                return true;
            }
        );
    }

    // ------------------------------------ 其他扩展 --------------------------------------
    setupOtherExtension(){
        // 去除字符串前后的空白，返回非空白字符串，或者返回提供的默认值（检查并抛出错误）
        Object.freezeProp(String, "toNotEmptyString",
            function toNotEmptyString(str, name=null, defaultValue=null){
                if (Number.isNumber(str)){str+="";}
                if (!String.isNumberOrString(defaultValue)){
                    Error.throwIfWhiteSpace(str, name);
                    return str.trim();
                } else if (String.isNullOrWhiteSpace(str)){
                    if (Number.isNumber(defaultValue)){defaultValue+="";}
                    Error.throwIfWhiteSpace(defaultValue, "Default value");
                    return defaultValue;
                } else {
                    Error.throwIfWhiteSpace(str, name);
                    return str.trim();
                }
            }
        );

        // 创建URL对象（检查并抛出错误）
        Object.freezeProp(URL, "create",
            function create(url, base = null){
                if (url instanceof URL){return url;}
                url = String.toNotEmptyString(url, "URL");
                if (base == null){
                    base = Object.hasOwn(self, "app") && self.app.configuration.has("base") ? self.app.configuration.get("base") : location.origin;
                } else {
                    Error.throwIfWhiteSpace(base, "baseUrl");
                }
                return new URL(url, base);
            }
        );

        // text 资源加载器
        Object.freezeProp(URL, "loader",
            async function loader(url){
                url = URL.create(url);
                try {
                    const res = await fetch(url);
                    if (!res.ok){return ""}
                    return await res.text();
                } catch {return "";}
            }
        );

        // 创建 Element 对象
        Object.freezeProp(Element, "create",
            function create(tag = "div", attrs = null, text = ""){
                tag = String.toNotEmptyString(tag, "Tag name", "div");
                const ele = document.createElement(tag);
                if (Object.isObject(attrs)){
                    for (const [key, value] of Object.entries(attrs)){
                        ele.setAttribute(key, value || "");
                    }
                    attrs = null;
                }
                if (text){ele.textContent = text;}
                return ele;
            }
        );

        // 深层批量创建 Element 对象
        Object.freezeProp(Element, "createAll",
            function createAll(config){
                if (Object.isObject(config)){
                    const parent = Element.create(config.tag, config.attrs, config.text);
                    if (Array.isArray(config.children) && config.children.length > 0){
                        for (const child of config.children){
                            if (Object.isObject(child)){parent.append(Element.createAll(child))}
                        }
                    }
                    return parent;
                }
                return document.createElement("div");
            }
        );
    }
}
