import Orientation from "./Orientation.js";

export default class LayoutService {
    static #instance = null;
    constructor(){
        if (LayoutService.#instance){return LayoutService.#instance}
        Object.freezeProp(this, "orientation", new Orientation());
        Object.sealProp(LayoutService, "executed", false);
        this.start();
        LayoutService.executed = true;
        LayoutService.#instance = this;
        Object.freeze(LayoutService);
    }

    get landscape(){return this.orientation.landscape;}
    get portrait(){return this.orientation.portrait;}
    get fontSize(){return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("font-size"));}

    start(){
        if (LayoutService.executed){return false;}
        const root = document.documentElement;
        this.setupFontScaling(root);
        this.setupUserExperience(root);
        console.log("4. 页面基本布局已完成");
        return true;
    }

    // 桌面端与移动端横竖屏字体优化
    setupFontScaling(root){
        if (root.classList.contains("dync")){return false;}
        root.style.fontSize = "11.55pt";
        const orient = screen.orientation;
        const font = {base: 28.57, initial: parseFloat(getComputedStyle(root).getPropertyValue("font-size")) || 15.4}
        root.removeAttribute("style");
        const angle = ()=>{
            if (orient.angle == 0 || orient.angle == 180) {
                root.classList.add("portrait");
            } else {
                root.classList.remove("portrait");
            }
        };

        const desktop = ()=>{
            if (orient.angle == 0 || orient.angle == 180){
                root.style.fontSize = font.portrait;
                root.classList.add("portrait");
            } else {
                root.style.fontSize = font.landscape;
                root.classList.remove("portrait");
            }
        };

        const min = (screen.width /  font.initial) <  font.base || (screen.height /  font.initial) <  font.base;
        if (orient.type.startsWith("p") && (orient.angle == 0 || orient.angle == 180)) {
            root.classList.add("portrait");
            if (min) {
                font.portrait = (top.innerWidth / font.base) + "px";
                root.style.fontSize = font.portrait;
                if (top.innerWidth > screen.width) {
                    font.landscape = (top.innerWidth / screen.height * (screen.width / font.base)) + "px";
                    orient.onchange = desktop;
                } else {
                    orient.onchange = angle;
                }
            } else {
                orient.onchange = angle;
            }
        } else if (orient.type.startsWith("l") && (orient.angle == 90 || orient.angle == 270)) {
            if (min) {
                if (top.innerWidth > screen.width){
                    font.portrait = (top.innerWidth / font.base) + "px";
                    font.landscape = (top.innerWidth / screen.width * (screen.height / font.base)) + "px";
                    root.style.fontSize = font.landscape;
                    orient.onchange = desktop;
                } else {
                    font.portrait = (screen.height / font.base) + "px";
                    root.style.fontSize = font.portrait;
                    orient.onchange = angle;
                }
            } else {
                orient.onchange = angle;
            }
        }
        return true;
    }

    // 其他用户界面优化
    setupUserExperience(root) {
        if (root.classList.contains("ban")){
            root.oncontextmenu = (event)=>{
                event.preventDefault();
                event.stopPropagation();
                return false;
            };
        };
        const empty = function(){};
        document.addEventListener("touchstart", empty, {passive: true});
        window.onbeforeunload = ()=>{document.removeEventListener("touchstart", empty);}
        return true;
    }
}
