import Axios from "./Axios";

import { API } from "../config";

export const getTokenInfo = async (id, callback) => {
    const response = await Axios({
        endpoint: `${API.ENDPOINT}/coins/${id}`,
        method: "GET",
    });
    if (response.status === 200) {
        if (callback) {
            callback(response.data);
        } else {
            return response.data;
        }
    } else {
        throw response;
    }
};

export const getTokenMarket = async (ids, callback) => {
    const response = await Axios({
        endpoint: `${API.ENDPOINT}/coins/${ids}/market_chart?vs_currency=usd&days=0`,
        method: "GET",
    });
    if (response.status === 200) {
        if (callback) {
            callback(response.data);
        } else {
            return response.data;
        }
    } else {
        throw response;
    }
};

export const approvePendingRecord = async (user, callback) => {
    const response = await Axios({
        endpoint: `${API.SERVER}approvePendingRecord`,
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            walletAddress: user
        })
    });
    if (response.status === 200) {
        if (callback) {
            callback(response.data);
        } else {
            return response.data;
        }
    } else {
        throw response;
    }
};

export const getPendingRecord = async (callback) => {
    const response = await Axios({
        endpoint: `${API.SERVER}getPendingRecord`,
        method: "GET",
    });
    if (response.status === 200) {
        if (callback) {
            callback(response.data);
        } else {
            return response.data;
        }
    } else {
        throw response;
    }
};