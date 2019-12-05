export const state = () => ({
    builder: null,
    canvas: null,
})

export const mutations = {
    sendMail: (state, { to, content }) => {
        state[to] = content
    },
    clearBox: (state, whichBox) => {
        state[whichBox] = null
    }
}

export const actions = {
    sendMail: ({ commit, state }, { to, content }) => {
        if(state[to]) return
        commit('sendMail', { to, content })
    },
    clearEvent: ({ commit }, whichBox) => {
        commit('clearBox', whichBox)
    }
}