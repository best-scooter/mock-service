import EnvVars from "../constants/EnvVars";

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
        return response.json();
    }).then((result) => {
        return result;
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
        `${EnvVars.ApiHost}scooter/${scooterId}`,
        data,
        token
    )
}

// **** Exports **** //

export default {
    putScooter
}
