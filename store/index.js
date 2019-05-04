export const state = () => ({
    isAnyTyping: false,
    wasThereAnEvent: false
})

export const mutations = {
    changeTyping: (state, value) => {
        state.isAnyTyping = value;
    },
    emmitEventToIndex: (state, value) => {
        state.wasThereAnEvent = value
    },
    clearEvent: state => {
        state.wasThereAnEvent = false
    }
}