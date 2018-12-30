import * as types from './types';
import fetch from 'isomorphic-fetch';

const prod = (process.env.NODE_ENV === 'production');
// const API_BASE = prod ? 'http://venomkb.org/api/' : 'http://localhost:3001/';
const API_BASE = process.env.API_BASE;

// All data types merged
export function filterTable(filter) {
    return {
        type: types.FILTER,
        filter
    };
}

export function selectData(venomkb_id) {
    return {
        type: types.SELECT_DATA,
        venomkb_id
    };
}

function requestData(venomkb_id) {
    return {
        type: types.REQUEST_DATA,
        venomkb_id
    };
}

function receiveData(venomkb_id, json) {
    console.log("RECEIVE_DATA:", json);
    return {
        type: types.RECEIVE_DATA,
        venomkb_id,
        json,
        receivedAt: Date.now()
    };
}

export function fetchData(venomkb_id) {
    const dataType = venomkb_id.charAt(0);
    console.log("FETCHING VENOMKB ID:", venomkb_id);
    switch (dataType) {
        case 'P':
            return dispatch => {
                dispatch(requestData(venomkb_id));
                return fetch(`${API_BASE}proteins/${venomkb_id}`)
                    .then(response => response.json())
                    .then(json => dispatch(receiveData(venomkb_id, json)));
            };

        case 'S':
            return dispatch => {
                dispatch(requestData(venomkb_id));
                return fetch(`${API_BASE}species/${venomkb_id}`)
                    .then(response => response.json())
                    .then(json => dispatch(receiveData(venomkb_id, json)));
            };

        case 'G':
            return dispatch => {
                dispatch(requestData(venomkb_id));
                return fetch(`${API_BASE}genomes/${venomkb_id}`)
                    .then(response => response.json())
                    .then(json => dispatch(receiveData(venomkb_id, json)));
            };
        case 'E':
            return dispatch => {
                dispatch(requestData(venomkb_id));
                return fetch(`${API_BASE}systemic-effects/${venomkb_id}`)
                    .then(response => response.json())
                    .then(json => dispatch(receiveData(venomkb_id, json)));
            };
        default:
            return 'Error: Bad Venomkb ID passed to fetchData()';
    }
}
