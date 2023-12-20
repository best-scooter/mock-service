import EnvVars from "../constants/EnvVars";
import { adminToken } from "../server";

// **** Variables **** //

// **** Helper functions **** //

/**
 * A put http request
 * @param {string} url Endpoint URL
 * @param {*} data Any data to include in the body, will be stringified
 * @param {string} token JWT token to use
 * @returns {Response}
 */
function _httpPut(url: string, data: any, token: string) {
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

/**
 * A post http request
 * @param {string} url Endpoint URL
 * @param {*} data Any data to include in the body, will be stringified
 * @param {string} token JWT token to use
 * @returns {Response}
 */
function _httpPost(url: string, data: any, token: string) {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Access-Token": token
        },
        body: JSON.stringify(data)
    });
}

/**
 * A gett http request
 * @param {string} url Endpoint URL
 * @param {string} token JWT token to use
 * @returns {Response}
 */
function _httpGet(url: string, token: string) {
    return fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "X-Access-Token": token
        }
    });
}

// **** Functions **** //

/**
 * Put request for scooter data
 * @param {number} scooterId Id of scooter to update
 * @param {*} data New data
 * @param {string} token Token to use for the request
 * @returns {Response}
 */
async function putScooter(scooterId: number, data: any, token: string) {
    return await _httpPut(
        `${EnvVars.ApiHost}v1/scooter/${scooterId}`,
        data,
        token
    );
}

/**
 * Put request for customer data
 * @param {number} customerId Id of customer to update
 * @param {*} data New data
 * @param {string} token Token to use for the request
 * @returns {Response}
 */
async function putCustomer(customerId: number, data: any, token: string) {
    return await _httpPut(
        `${EnvVars.ApiHost}v1/customer/${customerId}`,
        data,
        token
    );
}

/**
 * Get a zone
 * @param {number} zoneId
 * @returns {*} The zone data
 */
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

/**
 * Gets a customer JWT for authorisation
 * @param {string} customerEmail E-mail of customer
 * @returns {Promise<Object>}
 */
async function postCustomerToken(customerEmail: string) {
    const response = await _httpPost(
        EnvVars.ApiHost + "v1/customer/token",
        {email: customerEmail},
        ""
    );

    return await response.json();
}

// **** Exports **** //

export default {
    putScooter,
    putCustomer,
    getZone,
    postCustomerToken
}
