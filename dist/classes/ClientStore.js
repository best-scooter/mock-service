"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ClientStore {
    constructor() {
        this._all = [];
        this._subscribed = {
            customer: [],
            scooter: [],
            scooterLimited: [],
            trip: []
        };
    }
    get all() {
        return this._all;
    }
    get subscribed() {
        return this._subscribed;
    }
    add(client) {
        if (this._all.indexOf(client) === -1) {
            this._all.push(client);
        }
    }
    remove(client) {
        for (let i = 0; i < this._all.length; i++) {
            if (this._all[i] === client) {
                this._all.splice(i, 1);
            }
        }
        for (const list of Object.keys(this._subscribed)) {
            this.removeSubscribed(client, list);
        }
    }
    addSubscribed(client, list) {
        if (list in this._subscribed) {
            const subscribedArr = this._subscribed[list];
            if (subscribedArr.indexOf(client) === -1) {
                subscribedArr.push(client);
            }
        }
    }
    removeSubscribed(client, list) {
        if (list in this._subscribed) {
            const subscribers = this._subscribed[list];
            for (let i = 0; i < subscribers.length; i++) {
                if (client === subscribers[i]) {
                    subscribers.splice(i, 1);
                }
            }
        }
    }
}
exports.default = ClientStore;
