export const state = () => ({
    isAnyTyping: false
})

export const mutations = {
    changeTyping: (state, value) => {
        state.isAnyTyping = value;
    },
}