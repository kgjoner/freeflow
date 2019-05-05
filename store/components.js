export const state = () => ({
    quantity: 0,
    _nextId: 0,
    selected: '',
    makingArrow: false,
    arrowFrom: null,
    arrowTo: null,
    arrowLib: [],
    aligning: false,
    alignWith: null,
})

export const getters = {
    nextId: (state) => {
        return state._nextId + 1
    }
}

export const mutations = {
    minus: state => {
        if(state.quantity > 0) {
            state.quantity -= 1
        }
    },
    plus: state => {
        state._nextId +=1
        state.quantity += 1
    },
    toggleMakingArrow: state => {
        state.makingArrow = !state.makingArrow;
    },
    toggleAligning: state => {
        state.aligning = !state.aligning;
    },
    resetArrowSelection: state => {
        state.arrowTo = null;
        state.arrowFrom = null;
        state.makingArrow = false;
    },
    resetAlignSelection: state => {
        state.alignWith = null;
    },
    changeSelection: (state, el) => {
        if(state.makingArrow && el) {
            if(state.arrowFrom && state.arrowFrom !== el) {
                state.arrowTo = el;
                state.makingArrow = false;
            } else {
                state.arrowFrom = el;
            }
        } else if(state.aligning && el) {
            state.alignWith = el;
            state.aligning = false;
        } else {
            state.selected = el;
        }
    },
    pushArrowLib: (state, arrow) => {
        arrow.push('off')
        arrow.push(false)
        state.arrowLib.push(arrow)
    },
    deleteArrow: (state, arrowId) => {
        const arrow = arrowId.split('to')
        state.arrowLib = state.arrowLib.map((ar, index) => {
            if(ar[0] == arrow[0] && ar[1] == arrow[1]) {
                return [ar[0], ar[1], 'deleted', ar[3]]
            } else {
                return ar
            }
        })
    },
    emmitEventToArrow: (state, [arrowId, ev]) => {
        state.arrowLib = state.arrowLib.map((arrow) => {
            const id = arrow[0] + 'to' + arrow[1]
            if(id === arrowId || arrowId == 'any') {
                return [arrow[0], arrow[1], ev, arrow[3]]
            } else {
                return arrow
            }
        })
    },
    recreateArrow: (state, arrowId) => {
        const arrow = arrowId.split('to')
        state.arrowLib = state.arrowLib.map((ar, index) => {
            if(ar[0] == arrow[0] && ar[1] == arrow[1]) {
                return [ar[0], ar[1], 'recreated', ar[3]]
            } else {
                return ar
            }
        })
    }
}