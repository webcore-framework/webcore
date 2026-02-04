declare interface Webcore {
    getConfig(key: string): any;
    setConfig(key: string, value: any): this;
    hasService(name: string): boolean;
    getService(name: string): any;
    serviceNames(): string[];
    usePlugin(plugin: any, options?: object): this;
    useRouter(router: any): this;
    useComponent(components: any): this;
    resolve(names: string[]): Record<string, any>;
    loader(url: string): Promise<any>;
    run(): void;
}

// 全局声明
declare global {
    interface Window {webcore: Webcore;}
}

// 模块导入
export default global;
