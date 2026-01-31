export default class HomeView extends webcore.component.builder {
    static tag = 'view-home';

    create(){
        this.styles('/src/views/Home/Home.css')
        .template('/src/views/Home/Home.html')
        .mode('closed')
        .inject(['event'])
    }

    // 生命周期
    onCreated(){
        // console.log("onCreated")
    }

    onBeforeMount(){
        // console.log("onBeforeMount")
    }

    onMounted(){
        // console.log("onMounted")
    }

    onConnected(){
        // console.log("Home 组件已经挂载到页面")
    }

    onDisconnected(){
        // console.log("Home 组件已经卸载")
    }

    // 路由触发事件
    onBeforeRoute(route){
        // console.log("onBeforeRoute")
        // console.log(route)
        return true;
    }

    onRouted(route){

    }
}
