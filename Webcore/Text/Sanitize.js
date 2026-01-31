import Purify from "./lib/purify.mjs";

export default class Sanitize {
    static #instance = null;
    #purify = null;

    constructor(){
        if (Sanitize.#instance) {
            return Sanitize.#instance;
        }
        this.#purify = Purify;
        this.configureDefault();
        Object.freeze(this);
        Sanitize.#instance = this;
    }

    // 默认安全配置
    configureDefault() {
        this.#purify.setConfig({
            ALLOWED_TAGS: [
                "div", "header", "footer", "nav", "aside", "article", "section",
                "figure", "figcaption", "fieldset", "summary",
                "time", "mark", "small", "p", "br", "strong", "em", "u", "b", "i",
                "ul", "ol", "li", "dl", "dt", "dd", "a", "img", "span",
                "h1", "h2", "h3", "h4", "h5", "h6", "blockquote",
                "table", "thead", "tbody", "tfoot", "tr", "th", "td","label",
            ],
            ALLOWED_ATTR: [
                "href", "target", "rel", "src", "alt", "title",
                "class", "style", "width", "height", "colspan", "rowspan",
            ],
            ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-]|$))/i,
            ALLOW_DATA_ATTR: false,
            ALLOW_UNKNOWN_PROTOCOLS: false,
            SAFE_FOR_JQUERY: false,
            SANITIZE_DOM: true,
            KEEP_CONTENT: true
        });
    }

    // 主要消毒方法
    clean(html) {
        if (html === undefined || html == null) {return "";}
        Error.throwIfNotString(html);
        try {
            const clean = this.#purify.sanitize(html);
            return clean.replace(/>\s+</g, "><").replace(/^\s+</, "<").replace(/>\s+$/, ">").trim();
        } catch {
            console.error("HTML string sanitization failed.");
            return this.escapeHtml(html);
        }
    }

    // 安全地插入 HTML 到 DOM
    safeInsert(element, html) {
        if (!element || !html) return;
        const cleanHtml = this.clean(html);
        element.innerHTML = cleanHtml;
    }

    // 降级方案
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}
