export default class UtilityService {
    static #instance = null;

    constructor(){
        if (UtilityService.#instance){return UtilityService.#instance;}
        UtilityService.#instance = this;
    }

    getRandomInteger(max, current){
        Error.throwIfNull(max, "Max value");
        Error.throwIfNotNumber(max, "Max value");
        let randnum = Math.floor(Math.random()*max);
        if (typeof current === "number") {
            while (randnum == current) {randnum = Math.floor(Math.random()*max)}
        }
        return randnum;
    }
}
