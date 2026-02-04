import ComponentService from "./ComponentService.js";

export default class ComponentStyles {

    constructor(){
        this.created = false;
        this.styles = [];
        this.styleSheet = null;
    }

    get has(){return this.styles.length > 0;}

    set style(value){
        if (!this.created){
            Error.throwIfNotString(value, "Component style");
            this.styles.push(ComponentStyles.compress(value));
        }
    }

    async getStyleSheet(){
        if (this.styleSheet === null){
            const sheet = new CSSStyleSheet();

            if (this.styles.length > 0){
                try {
                    for (let i = 0;i < this.styles.length;i ++){
                        const item = this.styles[i];
                        if (item.endsWith(".css") || (!item.includes("{") && !item.includes("}"))){
                            this.styles[i] = ComponentStyles.compress(
                                await URL.loader(URL.create(item, ComponentService.instance.base))
                            );
                        }
                    }
                    sheet.replaceSync([...ComponentStyles.base, ...this.styles].join(""));
                } catch  {
                    throw new TypeError("Component style loading failed.");
                }
            } else {
                sheet.replaceSync(ComponentStyles.base.join(""))
            }

            this.styleSheet = [sheet];
            this.created = true;
        }
        return this.styleSheet;
    }

    static compress(style){
        return style.replace(/\n\s*/g, "")
        .replace(/\s*{\s*/g, "{")
        .replace(/\s*}\s*/g, "}")
        .replace(/\s*:\s*/g, ":")
        .replace(/\s*;\s*/g, ";")
        .replace(/;\s*}/g, "}")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .trim();
    }
}
