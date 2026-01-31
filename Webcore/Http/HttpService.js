import HttpClient from "./HttpClient.js";

export default class HttpService {
    static #instance = null;

    static singleton = true;
    static system = true;
    static serviceName = "http";

    constructor(cache){
        if (HttpService.#instance){return HttpService.#instance;}
        Object.freezeProp(HttpClient,"cache", cache);
        HttpClient.method = ["GET", "POST", "PUT", "DELETE", "HEAD", "PATCH", "OPTIONS"];
        HttpClient.config = {
            baseUrl: {type: "string"},
            parse: {type: "string", valid: ["text", "json", "blob", "formData", "arrayBuffer"]},
            encoding: {type: "string"},
            onrequest: {type: "function"},
            onresponse: {type: "function"},
            timeout: {type: "number"},
            ontimeout: {type: "function"},
            abort: {type: "boolean"},
            onabort: {type: "function"},
            validateStatus: {type: "function"},
        }
        HttpClient.expand = {
            mode: {type: "string",valid: ["cors", "same-origin", "no-cors"]},
            credentials: {type: "string",valid: ["omit", "same-origin", "include"]},
            cache: {type: "string",valid: ["default", "no-cache", "no-store", "reload", "force-cache"]},
            redirect: {type: "string",valid: ["follow", "error", "manual"]}
        }
        HttpClient.format = ["text","json","css","script","htm","xml"];
        HttpClient.isKeyValuePair = function isKeyValuePair(target){return ["object", "map"].includes(Object.typeOf(target));};
        HttpClient.parse = async function parse(type, response){
            switch (type) {
                case "json": return await response.json();
                case "text": return await response.text();
                case "blob": return await response.blob();
                case "formData": return await response.formData();
                case "arrayBuffer": return await response.arrayBuffer();
                default: return await response.text();
            }
        };
        Object.freeze(HttpClient);
        Object.freezeProp(this, "default", new HttpClient());
        Object.freeze(this);
        HttpService.#instance = this;
        Object.freeze(HttpService);
    }

    create(config=null){return new HttpClient(config);}

    async get(url, query, timeout){
        this.default.url = url;
        return this.default.get(query,timeout)
    }
    async post(url, params, timeout){
        this.default.url = url;
        return this.default.post(params,timeout)
    }
    async put(url, params, timeout){
        this.default.url = url;
        return this.default.put(params,timeout)
    }
    async delete(url, params, timeout){
        this.default.url = url;
        return this.default.delete(params,timeout)
    }
}
