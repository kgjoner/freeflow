export const state = () => ({
    selected: "",
    isAnyTyping: false,
    aligning: false,
    alignWith: null,
})

export const mutations = {
    changeSelection: (state, selectedEl) => {
        state.selected = selectedEl
    },
    changeTyping: (state, value) => {
        state.isAnyTyping = value;
    },
    activateAligningMode: state => {
        state.aligning = true;
    },
    setAlignElement: (state, el) => {
        state.alignWith = el;
    },
    resetAligningMode: state => {
        state.alignWith = null;
        state.aligning = false;
    }
}

export const actions = {
    avaliateSelection: ({ commit, dispatch, rootState }, el) => {
        if(rootState.arrow.arrowMakerMode.on && el) {
            dispatch('arrow/updateArrowMakerMode', el)
        } else if(rootState.aligning && el) {
            commit('setAlignElement', el)
        } else {
            commit('changeSelection', el)
        }
    },
    toggleAligningMode:({ commit, state }) => {
        if(!state.aligning) {
            commit('activateAligningMode')
        } else {
            commit('resetAligningMode')
        }
    }
}