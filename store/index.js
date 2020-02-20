import { storeState, getState } from '../api/state.js'

export const state = () => ({
    selected: "",
    isAnyTyping: false,
    isLoadingState: false,
    toolsPanelWidth: 340,
    headerHeight: 65,
})

export const mutations = {
    changeSelection: (state, selectedEl) => {
        state.selected = selectedEl
    },
    changeTyping: (state, value) => {
        state.isAnyTyping = value;
    },
    setState: (state, loadedState) => {
        state.isLoadingState = true
        state.arrow = loadedState.arrow
        state.block = loadedState.block
        state.canvas = loadedState.canvas
    },
    turnOffLoadingState: state => {
        state.isLoadingState = false
    },
    reset: state => {
        state.selected = ""
        state.isAnyTyping = false
        state.isLoadingState = false
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
    },
    saveState: ({ state }) => {
        storeState(state)
    },
    loadState: ({ commit, dispatch }) => {
        const loadedState = getState()
        if(loadedState) {
            commit('setState', loadedState)
            commit('block/resetAlignmentMode')
            commit('arrow/resetArrowMakerMode')
            dispatch('mailer/sendMail', {to: 'canvas', content: `loadState` })
        }
    },
    finishLoadingState: ({ commit }) => {
        commit('turnOffLoadingState')
    },
    resetState: ({ commit, dispatch }) => {
        commit('reset')
        commit('block/resetBlocks')
        commit('block/resetAlignmentMode')
        commit('arrow/resetArrows')
        commit('arrow/resetArrowMakerMode')
        dispatch('canvas/defineInitialSize')
    }
}