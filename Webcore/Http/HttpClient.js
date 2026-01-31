export default class HttpClient {

    constructor(config=null){
        this.url = "";
        this.baseUrl = location.origin;
        Object.freezeProp(this, "headers", Object.pure());
        Object.freezeProp(this, "payload", Object.pure());
        Object.freezeProp(this, "expand", Object.pure());
        Object.sealProp(this, "cache", 0);
        Object.sealProp(this, "timeout", 0);
        Object.sealProp(this, "abort", false);
        Object.sealProp(this, "parse", "json");
        Object.sealProp(this, "encoding", "utf-8");
        Object.sealProp(this, "timeoutId", null);
        Object.sealProp(this, "abortController", null);
        Object.sealProp(this, "ontimeout", (message)=>{console.info(message || "Request timeout.")});
        Object.sealProp(this, "onabort", (message)=>{console.info(message || "Request aborted.")});

        if (!HttpClient.isKeyValuePair(config)){return this;}

        // 检查参数类型
        for (const [key, prop] of Object.entries(HttpClient.config)){
            if (Object.hasOwn(config, key)){
                if (typeof config[key] !== prop.type){throw new TypeError(`The ${key} must be of ${prop.type} type.`)}
                if (Object.hasOwn(prop, "valid") && !prop.valid.includes(config[key])){throw new TypeError(`The ${key} is invalid.`)}
                this[key] = config[key];
            }
        }

        // 检查URL
        if (Object.hasOwn(config, "url")){
            if (typeof config.url !== "string" && !(config.url instanceof URL)){
                throw new URIError("URL invalid.")
            }
            const url = typeof config.url === "string" ? new URL(config.url, location.origin) : config.url;
            this.url = url.href;
            this.baseUrl = url.origin;
        }

        // 处理缓存
        if (typeof config.cache === "number"){
            if (Number.isNumber(config.cache)){this.cache = config.cache;} delete config.cache;
        }

        // 检查 headers、payload
        for (const key of ["headers", "payload"]){
            if (Object.hasOwn(config, key)) {
                if (!HttpClient.isKeyValuePair(config[key])){throw new TypeError(`The ${key} must be of object type.`)}
                for (const prop of Object.keys(config[key])){this[key][prop] = config[key][prop];}
            }
        }

        // 检查 expand
        for (const [key, prop] of Object.entries(HttpClient.expand)){
            if (Object.hasOwn(config, key)){
                if (typeof config[key] !== prop.type) {throw new TypeError(`The ${key} must be of ${prop.type} type.`);}
                if (!prop.valid.includes(config[key])) {throw new TypeError(`The ${key} is invalid.`);}
                this.expand[key] = config[key];
            }
        }

        // 添加字符集
        for (const header of ["Content-Type", "Accept"]){
            if (Object.hasOwn(this.headers, header)) {
                for (const type of HttpClient.format){
                    if (this.headers[header].includes(type)){
                        this.headers[header] = `${this.headers[header]}; charset=${this.encoding}`;
                        break;
                    }
                }
            }
        }
    }

    get authorization(){
        if (this.headers && Object.hasOwn(this.headers,"Authorization")){
            return this.headers["Authorization"];
        }
        return "";
    }
    set authorization(value){
        if (typeof value === "string"){
            this.headers["Authorization"] = value;
        }
    }
    get contentType(){
        if (this.headers && Object.hasOwn(this.headers,"Content-Type")){
            return this.headers["Content-Type"];
        }
        return "";
    }
    set contentType(value){
        if (typeof value === "string"){
            for (const format of HttpClient.format){
                if (value.includes(format)){
                    this.headers["Content-Type"] = `${value}; charset=${this.encoding}`;
                    break;
                }
            }
        }
    }

    async get(payload=null, timeout=0){
        return await this.send(this.getUrl(payload), "GET", null, timeout);
    }

    async post(payload, timeout=0){
        return await this.send(this.getUrl(), "POST", payload, timeout);
    }

    async put(payload, timeout=0){
        return await this.send(this.getUrl(), "PUT", payload, timeout);
    }

    async delete(payload, timeout=0){
        return await this.send(this.getUrl(), "DELETE", payload, timeout);
    }


    getUrl(payload=null){
        const url = this.url instanceof URL ? this.url : new URL(this.url, this.baseUrl);
        payload = payload || this.payload;
        if (HttpClient.isKeyValuePair(payload)){
            for (const key of Object.keys(payload)){
                url.searchParams.set(key, payload[key])
            }
        }
        return url;
    }

    // 核心请求方法
    async send(url=null, method="GET", payload=null, timeout=0){
        // ------------------------------- 检查 URL ---------------------------------
        if (typeof url === "string"){
            url = URL.create(url, this.baseUrl)
        } else if (!(url instanceof URL)){
            throw new URIError("URL invalid.");
        }
        // ------------------------------- 检查缓存 ---------------------------------
        if (this.cache > 0 && HttpClient.cache.has(url.href)){
            return Promise.resolve(HttpClient.cache.get(url.href));
        }
        // ------------------------------- 创建请求配置 ---------------------------------
        const options = Object.pure();
        // 检查 method
        if (typeof method !== "string"){throw new TypeError("The method is invalid.")}
        options.method = method.trim().toUpperCase();
        if (!HttpClient.method.includes(options.method)){throw new TypeError("The method is invalid.")}
        // 添加 headers 请求头
        if (Object.keys(this.headers).length > 0){options.headers = new Headers(this.headers);}
        // 添加扩展配置
        Object.assign(options, this.expand);

        // 添加负载信息
        if (payload !== undefined && payload !== null){
            // 如果是 Object或 Map，则转换为JSON字符串
            if (HttpClient.isKeyValuePair(payload)){
                payload = JSON.stringify(payload);
                // 自动添加 JSON 类型的 Content-Type
                if (Object.hasOwn(options, "headers")){
                    options.headers.set("Content-Type",`application/json; charset=${this.encoding}`);
                }
            } else if (Object.hasOwn(options, "headers")) {
                // 否则删除 Content-Type (浏览器会自动判断)
                options.headers.delete("Content-Type");
            }
            options.body = payload;
        }

        // 控制器
        this.abortController = new AbortController();
        options.signal = this.abortController.signal;

        // 请求前钩子函数
        if (typeof this.onrequest === "function"){this.onrequest(options)}

        timeout = Number(timeout) || Number(this.timeout) || 0;
        if (timeout > 0){
            this.timeoutId = setTimeout(()=>{
                this.abortController.abort();
                if (typeof this.ontimeout === "function"){this.ontimeout();}
            }, timeout);
        }

        try {
            const response = await fetch(url, options);
            if (this.timeoutId){clearTimeout(this.timeoutId)}
            if (!response.ok){
                if (typeof this.validateStatus === "function") {
                    return this.validateStatus(response);
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }
            const responseData = await HttpClient.parse(this.parse, response);
            if (this.cache > 0){HttpClient.cache.set(url.href, responseData, {absolute: this.cache})}
            if (typeof this.onresponse === "function"){return this.onresponse(responseData)}
            return responseData;
        } catch (error) {
            if (this.timeoutId){clearTimeout(this.timeoutId)}
            if (error.name === "AbortError"){
                if (typeof this.onabort === "function"){return this.onabort()}
            }
            throw error;
        } finally {
            if (this.timeoutId){
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
            this.abortController = null;
        }
    }

    cancel(){
        if (this.abortController){
            this.abortController.abort();
            return true;
        }
        return false;
    }
}
