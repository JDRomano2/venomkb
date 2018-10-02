import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';
import * as types from '../actions/types';

// reducer for handling actions on list of all proteins
const proteins = (state = [], action) => {
    switch (action.type) {
        case types.ADD_PROTEIN_SUCCESS:
            return [action.protein, ...state];

        case types.REMOVE_PROTEIN_SUCCESS:
            return state.filter((t) => t._id !== action.todo._id );

        case types.UPDATE_PROTEIN_SUCCESS:
            const { updates, protein } = action;
            return state.map(t => {
                if (t._id === protein._id) {
                    return Object.assign({}, protein, updates);
                }
                return t;
            });

        case types.MOVE_PROTEIN:
            const newState = [...state];
            newState.splice(action.dragIndex, 1);
            return [
                ...newState.slice(0, action.hoverIndex),
                action.protein,
                ...newState.slice(action.hoverIndex)
            ];

        default:
            return state;
    }
};

// same thing for species
const species = (state = [], action) => {
    switch (action.type) {
        case types.ADD_SPECIES_SUCCESS:
            return [action.species, ...state];

        case types.REMOVE_SPECIES_SUCCESS:
            return state.filter((t) => t._id !== action.todo._id );

        case types.UPDATE_SPECIES_SUCCESS:
            const { updates, spec} = action;
            return state.map(t => {
                if (t._id === spec._id) {
                    return Object.assign({}, spec, updates);
                }
                return t;
            });

        case types.MOVE_SPECIES:
            const newState = [...state];
            newState.splice(action.dragIndex, 1);
            return [
                ...newState.slice(0, action.hoverIndex),
                action.species,
                ...newState.slice(action.hoverIndex)
            ];

        default:
            return state;
    }
};

// and now for genomes
const genomes = (state = [], action) => {
    switch (action.type) {
        case types.ADD_GENOME_SUCCESS:
            return [action.genome, ...state];

        case types.REMOVE_GENOME_SUCCESS:
            return state.filter((t) => t._id !== action.todo._id );

        case types.UPDATE_GENOME_SUCCESS:
            const { updates, genome } = action;
            return state.map(t => {
                if (t._id === genome._id) {
                    return Object.assign({}, genome, updates);
                }
                return t;
            });

        case types.MOVE_GENOME:
            const newState = [...state];
            newState.splice(action.dragIndex, 1);
            return [
                ...newState.slice(0, action.hoverIndex),
                action.genome,
                ...newState.slice(action.hoverIndex)
            ];

        default:
            return state;
    }
};

// systemic effects
const systemiceffects = (state = [], action) => {
    switch (action.type) {
        case types.ADD_SYSTEMIC_EFFECT_SUCCESS:
            return [action.systemiceffect, ...state];

        case types.REMOVE_SYSTEMIC_EFFECT_SUCCESS:
            return state.filter((t) => t._id !== action.todo._id );

        case types.UPDATE_SYSTEMIC_EFFECT_SUCCESS:
            const { updates, systemiceffect } = action;
            return state.map(t => {
                if (t._id === systemiceffect._id) {
                    return Object.assign({}, systemiceffect, updates);
                }
                return t;
            });

        case types.MOVE_SYSTEMIC_EFFECT:
            const newState = [...state];
            newState.splice(action.dragIndex, 1);
            return [
                ...newState.slice(0, action.hoverIndex),
                action.systemiceffect,
                ...newState.slice(action.hoverIndex)
            ];

        default:
            return state;
    }
};

// Set venomkb_id to a new value
function selectedData(state = null, action) {
    switch (action.type) {
        case types.SELECT_DATA:
            return action.venomkb_id;
        default:
            return state;
    }
}

function dataDetail(state = {
    isFetching: false,
    json: {}
}, action) {
    switch (action.type) {
        case types.REQUEST_DATA:
            return Object.assign({}, state, {
                isFetching: true
            });
        case types.RECEIVE_DATA:
            return Object.assign({}, state, action.json);
        default:
            return {
                isFetching: false,
                // json: {'_id': '58feafa31e97c93b9878a6fd', 'description': null, 'out_links': {'CDD': {'db_obj': {'match status': '1', 'id': 'cd00190', 'entry name': 'Tryp_SPc'}, 'db_name': 'CDD', 'db_id': null}, 'Pfam': {'db_obj': {'match status': '1', 'id': 'PF00089', 'entry name': 'Trypsin'}, 'db_name': 'Pfam', 'db_id': null}, 'PRINTS': {'db_obj': {'id': 'PR00722', 'entry name': 'CHYMOTRYPSIN'}, 'db_name': 'PRINTS', 'db_id': null}, 'UniProtKB': {'db_obj': 'Q072L6', 'db_name': 'UniProtKB', 'db_id': null}, 'EMBL': {'db_obj': {'molecule type': 'mRNA', 'protein sequence ID': 'ABB76280.1', 'id': 'DQ247724'}, 'db_name': 'EMBL', 'db_id': null}, 'SUPFAM': {'db_obj': {'match status': '1', 'id': 'SSF50494', 'entry name': 'SSF50494'}, 'db_name': 'SUPFAM', 'db_id': null}, 'PROSITE': {'db_obj': {'match status': '1', 'id': 'PS00135', 'entry name': 'TRYPSIN_SER'}, 'db_name': 'PROSITE', 'db_id': null}, 'GO': {'db_obj': {'project': 'InterPro', 'term': 'F:serine-type endopeptidase activity', 'id': 'GO:0004252', 'evidence': 'ECO:0000501'}, 'db_name': 'GO', 'db_id': null}, 'SMART': {'db_obj': {'match status': '1', 'id': 'SM00020', 'entry name': 'Tryp_SPc'}, 'db_name': 'SMART', 'db_id': null}, 'InterPro': {'db_obj': {'id': 'IPR033116', 'entry name': 'TRYPSIN_SER'}, 'db_name': 'InterPro', 'db_id': null}}, 'aa_sequence': 'MVLIRVLANLLILQLSYAQKSSELVIGGDECNINEHRSLVVLFNSSGFLCAGTLVQDEWVLTAANCDSKNFQMQLGVHSKKVLNEDEQTRDPKEEASLCPNRKKDDEVDKDIMLIKLDSRVSNSEHIAPLSLPSSPPSVGSVCRIMGWGTISPTKETYPDVPHCANINILDHAVCRAAYPWQPVSSTTLCAGILQGGKDTCWGDSGGPLICNGEFQGIVSWGAHPCGQPHNPGVYTKVSDYTEWIKSIIAGNTAAACPP', 'venomkb_id': 'P5453929', 'venom_ref': 'V3691657', 'name': 'TEST PROTEIN'},
                json: null,
                lastUpdated: Date.now()
            };
    }
}

function currentData(state = { }, action) {
    switch (action.type) {
        case types.RECEIVE_DATA:
        case types.REQUEST_DATA:
            return Object.assign({}, state, dataDetail(state[action.json], action));
        default:
            return {
                isFetching: false,
                // json: {'_id': '58feafa31e97c93b9878a6fd', 'description': null, 'out_links': {'CDD': {'db_obj': {'match status': '1', 'id': 'cd00190', 'entry name': 'Tryp_SPc'}, 'db_name': 'CDD', 'db_id': null}, 'Pfam': {'db_obj': {'match status': '1', 'id': 'PF00089', 'entry name': 'Trypsin'}, 'db_name': 'Pfam', 'db_id': null}, 'PRINTS': {'db_obj': {'id': 'PR00722', 'entry name': 'CHYMOTRYPSIN'}, 'db_name': 'PRINTS', 'db_id': null}, 'UniProtKB': {'db_obj': 'Q072L6', 'db_name': 'UniProtKB', 'db_id': null}, 'EMBL': {'db_obj': {'molecule type': 'mRNA', 'protein sequence ID': 'ABB76280.1', 'id': 'DQ247724'}, 'db_name': 'EMBL', 'db_id': null}, 'SUPFAM': {'db_obj': {'match status': '1', 'id': 'SSF50494', 'entry name': 'SSF50494'}, 'db_name': 'SUPFAM', 'db_id': null}, 'PROSITE': {'db_obj': {'match status': '1', 'id': 'PS00135', 'entry name': 'TRYPSIN_SER'}, 'db_name': 'PROSITE', 'db_id': null}, 'GO': {'db_obj': {'project': 'InterPro', 'term': 'F:serine-type endopeptidase activity', 'id': 'GO:0004252', 'evidence': 'ECO:0000501'}, 'db_name': 'GO', 'db_id': null}, 'SMART': {'db_obj': {'match status': '1', 'id': 'SM00020', 'entry name': 'Tryp_SPc'}, 'db_name': 'SMART', 'db_id': null}, 'InterPro': {'db_obj': {'id': 'IPR033116', 'entry name': 'TRYPSIN_SER'}, 'db_name': 'InterPro', 'db_id': null}}, 'aa_sequence': 'MVLIRVLANLLILQLSYAQKSSELVIGGDECNINEHRSLVVLFNSSGFLCAGTLVQDEWVLTAANCDSKNFQMQLGVHSKKVLNEDEQTRDPKEEASLCPNRKKDDEVDKDIMLIKLDSRVSNSEHIAPLSLPSSPPSVGSVCRIMGWGTISPTKETYPDVPHCANINILDHAVCRAAYPWQPVSSTTLCAGILQGGKDTCWGDSGGPLICNGEFQGIVSWGAHPCGQPHNPGVYTKVSDYTEWIKSIIAGNTAAACPP', 'venomkb_id': 'P5453929', 'venom_ref': 'V3691657', 'name': 'TEST PROTEIN'},
                json: null,
                lastUpdated: Date.now()
            };
    }
}

const rootReducer = combineReducers({
    resources: combineReducers({
        proteins,
        species,
        genomes,
        systemiceffects
    }),
    inMemory: combineReducers({
        selectedData,
        currentData
    }),
    routing
});

export default rootReducer;
