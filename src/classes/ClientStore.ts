import Scooter from "./Scooter";
import Customer from "./Customer";
import type Client from "./Client";

class ClientStore {
    _scooters: Array<Scooter> = [];
    _customers: Array<Customer> = [];

    get all(): Array<Client> {
        const all: Array<Client> = [];
        return all.concat(this._customers).concat(this._scooters);
    }

    get scooters() {
        return this._scooters;
    }

    get customers() {
        return this._customers;
    }

    addScooter(scooter: Scooter) {
        if (this._scooters.indexOf(scooter) === -1) {
            this._scooters.push(scooter);
        }
    }

    removeScooter(scooter: Scooter) {
        for (let i = 0; i < this._scooters.length; i++) {
            if (this._scooters[i] === scooter) {
                this._scooters.splice(i, 1);
            }
        }
    }

    addCustomer(customer: Customer) {
        if (this._customers.indexOf(customer) === -1) {
            this._customers.push(customer);
        }
    }

    removeCustomer(customer: Customer) {
        for (let i = 0; i < this._customers.length; i++) {
            if (this._customers[i] === customer) {
                this._customers.splice(i, 1);
            }
        }
    }
}

export default ClientStore;