import {Unit} from "./unit.js";

export class Player extends Unit {
    constructor(id, position) {
        super(position)
        this.id = id
    }
}
