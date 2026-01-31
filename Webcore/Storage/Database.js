export default class Database {
    static #instance = null;

    #db = null;
    #dbName = 'AppStorage';
    #version = 1;
    #storeName = 'System';

    constructor(){
        if (Database.#instance){
            return Database.#instance;
        }
        this.#initializeDB();
        Database.#instance = this;
    }

    async #initializeDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.#dbName, this.#version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.#db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.#storeName)) {
                    db.createObjectStore(this.#storeName);
                }
            };
        });
    }

    #getStore(mode = 'readonly') {
        if (!this.#db) {
            throw new Error('Database not initialized');
        }
        const transaction = this.#db.transaction([this.#storeName], mode);
        return transaction.objectStore(this.#storeName);
    }

    // 存储数据
    async set(key, value) {
        return new Promise((resolve, reject) => {
            try {
                const store = this.#getStore('readwrite');
                const request = store.put(value, key);

                request.onsuccess = () => {
                    // 触发存储事件
                    if (this.services) {
                        const eventService = this.services.get('event');
                        if (eventService) {
                            eventService.emit('storage:set', { key, value, success: true });
                        }
                    }
                    resolve(true);
                };

                request.onerror = () => reject(request.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    // 获取数据
    async get(key) {
        return new Promise((resolve, reject) => {
            try {
                const store = this.#getStore();
                const request = store.get(key);

                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => reject(request.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    // 删除数据
    async remove(key) {
        return new Promise((resolve, reject) => {
            try {
                const store = this.#getStore('readwrite');
                const request = store.delete(key);

                request.onsuccess = () => {
                    // 触发存储事件
                    if (this.services) {
                        const eventService = this.services.get('event');
                        if (eventService) {
                            eventService.emit('storage:remove', { key, success: true });
                        }
                    }
                    resolve(true);
                };

                request.onerror = () => reject(request.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    // 清空所有数据
    async clear() {
        return new Promise((resolve, reject) => {
            try {
                const store = this.#getStore('readwrite');
                const request = store.clear();

                request.onsuccess = () => {
                    // 触发存储事件
                    if (this.services) {
                        const eventService = this.services.get('event');
                        if (eventService) {
                            eventService.emit('storage:clear', { success: true });
                        }
                    }
                    resolve(true);
                };

                request.onerror = () => reject(request.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    // 获取所有键
    async keys() {
        return new Promise((resolve, reject) => {
            try {
                const store = this.#getStore();
                const request = store.getAllKeys();

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    // 检查键是否存在
    async has(key) {
        const value = await this.get(key);
        return value !== null && value !== undefined;
    }

    // 获取数据数量
    async count() {
        return new Promise((resolve, reject) => {
            try {
                const store = this.#getStore();
                const request = store.count();

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    // 批量设置多个值
    async setMultiple(items) {
        const results = {};
        for (const [key, value] of Object.entries(items)) {
            results[key] = await this.set(key, value);
        }
        return results;
    }

    // 批量获取多个值
    async getMultiple(keys) {
        const results = {};
        for (const key of keys) {
            results[key] = await this.get(key);
        }
        return results;
    }

    // 批量删除多个值
    async removeMultiple(keys) {
        const results = {};
        for (const key of keys) {
            results[key] = await this.remove(key);
        }
        return results;
    }

    // 导出所有数据
    async export() {
        const keys = await this.keys();
        const data = {};
        for (const key of keys) {
            data[key] = await this.get(key);
        }
        return data;
    }

    // 导入数据
    async import(data) {
        const results = {};
        for (const [key, value] of Object.entries(data)) {
            results[key] = await this.set(key, value);
        }
        return results;
    }

    // 获取数据库信息
    async getStats() {
        const keys = await this.keys();
        const count = await this.count();

        return {
            totalItems: count,
            keys: keys,
            dbName: this.#dbName,
            version: this.#version
        };
    }

    // 删除整个数据库
    async deleteDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(this.#dbName);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
}
