export const state = () => ({
    selected: "",
    isAnyTyping: false,
    toolsPanelWidth: 340,
    headerHeight: 65,
})

export const mutations = {
    changeSelection: (state, selectedEl) => {
        state.selected = selectedEl
    },
    changeTyping: (state, value) => {
        state.isAnyTyping = value;
    }
}

export const actions = {
    avaliateSelection: ({ commit, dispatch, rootState }, el) => {
        if(rootState.arrow.arrowMakerMode.on && el) {
            dispatch('arrow/updateArrowMakerMode', el)
        } else if(rootState.block.alignmentMode.on && el) {
            commit('block/setAlignElement', el)
        } else {
            commit('changeSelection', el)
        }
    }
}