import logger from 'jet-logger';

import EnvVars from "../constants/EnvVars";
import { adminToken } from "../server";
import ScooterType from '../types/ScooterType';

import type Trip from '../types/TripType';

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
    try {
        return fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        logger.err(error);
        return new Response();
    }
}

/**
 * A post http request
 * @param {string} url Endpoint URL
 * @param {*} data Any data to include in the body, will be stringified
 * @param {string} token JWT token to use
 * @returns {Response}
 */
function _httpPost(url: string, data: any, token: string) {
    try {
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        logger.err(error);
        return new Response();
    }
}

/**
 * A get http request
 * @param {string} url Endpoint URL
 * @param {string} token JWT token to use
 * @returns {Response}
 */
function _httpGet(url: string, token: string) {
    try {
        return fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token
            }
        });
    } catch (error) {
        logger.err(error);
        return new Response();
    }
}

/**
 * A delete http request
 * @param {string} url Endpoint URL
 * @param {string} token JWT token to use
 * @returns {Response}
 */
function _httpDelete(url: string, token: string) {
    try {
        return fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "X-Access-Token": token
            }
        });
    } catch (error) {
        logger.err(error);
        return new Response();
    }
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
 * Get request for a single scooter
 * @param {number} scooterId 
 * @param {string} token 
 * @returns {Object} Object with scooter data
 */
async function getScooter(scooterId: number, token: string): Promise<ScooterType> {
    const response = await _httpGet(EnvVars.ApiHost + "v1/scooter/" + scooterId, token)
    const result = await response.json()
    return await result.data
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
    const response = await _httpGet(EnvVars.ApiHost + 'v1/zone/' + zoneId, await adminToken)
    const result = await response.json();

    return await result.data;
}

/**
 * Get all zones
 * @returns {*} The zone data
 */
async function getZones() {
    const response = await _httpGet(EnvVars.ApiHost + 'v1/zone/', await adminToken);
    const result = await response.json();

    return result.data;
}

/**
 * Gets a customer JWT for authorisation
 * @param {string} customerEmail E-mail of customer
 * @returns {Promise<Object>}
 */
async function postCustomerToken(customerEmail: string) {
    const response = await _httpPost(
        EnvVars.ApiHost + "v1/customer/token",
        { email: customerEmail },
        ""
    );

    return await response.json();
}

/**
 * Gets a scooter JWT for authorisation
 * @param {number} scooterId Scooter ID
 * @param {string} password Password
 * @returns {Promise<Object>}
 */
async function postScooterToken(scooterId: number, password: string) {
    const response = await _httpPost(
        EnvVars.ApiHost + "v1/scooter/token",
        { scooterId, password },
        ""
    );

    return await response.json();
}

/**
 * Posts a new trip
 * @param {number} customerId Customer ID
 * @param {number} scooterId Scooter ID
 * @param {Array<number>} startPosition Start position of the trip expressed as [lon, lat]or [y, x]  coordinates
 * @returns {Promise<any>}
 */
async function postTrip(customerId: number, scooterId: number, startPosition: Array<number>, token: string): Promise<{ "data": Trip }> {
    const response = await _httpPost(
        EnvVars.ApiHost + "v1/trip/0",
        { customerId, scooterId, startPosition },
        token
    );

    return await response.json();
}

/**
 * Put trip update
 * @param {number} tripId Trip id
 * @param {any} data New trip data
 * @param {string} token JWT to use for the request
 * @returns {Promise<any>}
 */
async function putTrip(tripId: number, data: any, token: string): Promise<Response> {
    const response = await _httpPut(
        EnvVars.ApiHost + "v1/trip/" + tripId,
        data,
        token
    );

    return response;
}

/**
 * Parking post by scooter ID, should add a parking for every zone
 * the scooter is in (according to the database, so update position first)
 * @param {number} scooterId Scooter ID to add
 * @param {string} token JWT to use for the request
 * @returns {Promise<any>}
 */
async function postParking(scooterId: number, scooterPosition: [number, number], token: string): Promise<Response> {
    const response = await _httpPost(
        EnvVars.ApiHost + "v1/parking/by/scooter/" + scooterId,
        {scooterPosition},
        token
    );

    return response;
}

/**
 * Parking delete
 * @param {number} scooterId Scooter ID to add
 * @param {string} token JWT to use for the request
 * @returns {Promise<any>}
 */
async function delParking(scooterId: number, token: string): Promise<Response> {
    const response = await _httpDelete(
        EnvVars.ApiHost + "v1/parking/by/scooter/" + scooterId,
        token
    );

    return response;
}

// **** Exports **** //

export default {
    putScooter,
    getScooter,
    putCustomer,
    getZone,
    getZones,
    postCustomerToken,
    postScooterToken,
    postTrip,
    putTrip,
    postParking,
    delParking
}
