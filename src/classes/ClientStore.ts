import Client from "./Client";

class ClientStore {
    _all: Array<Client> = [];
    _subscribed: {
        [subscription: string]: Array<Client>
    } = {
        customer: [],
        scooter: [],
        scooterLimited: [],
        trip: []
    }

    get all(): Array<Client> {
        return this._all;
    }

    get subscribed(): {
        [subscription: string]: Array<Client>
    } {
        return this._subscribed;
    }

    add(client: Client): void {
        if (this._all.indexOf(client) === -1) {
            this._all.push(client);
        }
    }

    remove(client: Client): void {
        // remove all entries in the all array
        for (let i = 0; i < this._all.length; i++) {
            if (this._all[i] === client) {
                this._all.splice(i, 1);
            }
        }

        // remove all entries in all subscriptions
        for (const list of Object.keys(this._subscribed)) {
            this.removeSubscribed(client, list);
        }
    }

    addSubscribed(client: Client, list: string): void {
        if (list in this._subscribed) {
            const subscribedArr = this._subscribed[list]

            if (subscribedArr.indexOf(client) === -1) {
                subscribedArr.push(client);
            }
        }
    }

    removeSubscribed(client: Client, list: string): void {
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

export default ClientStore;