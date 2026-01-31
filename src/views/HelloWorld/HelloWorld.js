export default class HelloWorld extends webcore.component.builder {

    static tag = 'hello-world';

    // static observedAttributes = ['content'];

    // 创建组件
    create(){
        this.template(
            `<p> Hello World </p>`
        )
        .styles(
            `.root {
                display:flex;
                height: 100%;
                align-items: center;
                justify-content: center;
                color: red;
                font-size: 5rem;
                font-weight: bold;
            }
            p {
                margin-top: -5em;
                cursor: pointer;
            }`
        )
        .mode('closed')
        .inject(['event'])
        .configuration({
            framework: "webcore",
            version: "1.0.0",
            author: "HUACHEN"
        })
    }

    // 生命周期钩子
    onCreated(){
        const event = this.service('event');
        const p = this.querySelector('p');

        event.select(p).click(
            ()=>{p.textContent = "Webcore"}
        ).bind();
    }

    onBeforeMount(){

    }

    onConnected(){

    }

    onMounted(){

    }

    onDisconnected(){

    }


    // 其他原生组件钩子
    onAttributeChanged(attr, value, old){

    }

    onAdopted(){

    }


    // 路由钩子
    onBeforeRoute(route){
        return true;
    }

    onRouted(route){

    }
}
