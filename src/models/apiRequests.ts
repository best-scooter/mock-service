import EnvVars from "../constants/EnvVars";
import { adminToken } from "../server";

// **** Variables **** //

// **** Helper functions **** //

async function _httpPut(url: string, data: any, token: string) {
    return fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Access-Token": token
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response;
    })
}

async function _httpPost(url: string, data: any, token: string) {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Access-Token": token
        },
        body: JSON.stringify(data)
    }).then((response) => {
        return response.json();
    }).then((result) => {
        return result;
    })
}

async function _httpGet(url: string, token: string) {
    return fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-Access-Token": token
        }
    }).then((response) => {
        return response.json();
    }).then((result) => {
        return result;
    });
}

// **** Functions **** //

async function putScooter(scooterId: number, data: any, token: string) {
    return await _httpPut(
        `${EnvVars.ApiHost}v1/scooter/${scooterId}`,
        data,
        token
    )
}

async function putCustomer(customerId: number, data: any, token: string) {
    return await _httpPut(
        `${EnvVars.ApiHost}v1/customer/${customerId}`,
        data,
        token
    )
}

async function getZone(zoneId: number) {
    return await fetch(EnvVars.ApiHost + 'v1/zone/' + zoneId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-Access-Token": await adminToken
        }
    }).then((response) => {
        return response.json();
    }).then((result) => {
        return result.data;
    })
}

// **** Exports **** //

export default {
    putScooter,
    putCustomer,
    getZone
}
