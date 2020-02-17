export const state = () => ({
    arrows: [],
    arrowMakerMode: {
        on: false,
        from: null,
        to: null,
        label: null
    },
    variants: [],
})

export const getters = {
    latestIndex: (state) => {
        return state.arrows.length - 1
    }
}

export const mutations = {
    activateArrowMakerMode: (state, label) => {
        state.arrowMakerMode.on = true
        state.arrowMakerMode.label = label
    },
    setArrowPoint: (state, {point, el}) => {
        state.arrowMakerMode[point] = el
    },
    resetArrowMakerMode: state => {
        state.arrowMakerMode.to = null;
        state.arrowMakerMode.from = null;
        state.arrowMakerMode.label = null;
        state.arrowMakerMode.on = false;
    },
    addArrow: (state, arrow) => {
        state.arrows.push(arrow)
    },
    recreateArrow: (state, index) => {
        state.arrows[index].status = 'recreated'
    },
    deleteArrow: (state, index) => {
        state.arrows[index].status = 'deleted'
    },
    alterArrow: (state, { index, alterations }) => {
        Object.entries(alterations).forEach(([prop, value]) => {
            state.arrows[index][prop] = value
        })
    },
    updateVariants: (state, variants) => {
        state.variants = [...variants]
    }
}

export const actions = {
    setArrowMakerMode: ({ commit, rootState }, { label, isFromAlreadySet }) => {
        commit('activateArrowMakerMode', label)
        if(isFromAlreadySet) commit('setArrowPoint', { point: 'from', el: rootState.selected })
        commit('changeSelection', '', { root: true })
    },
    updateArrowMakerMode: ({ commit, state, dispatch }, el) => {
        if(el === 'cancel') {
            commit('resetArrowMakerMode')
        } else if(state.arrowMakerMode.from && state.arrowMakerMode.from !== el) {
            commit('setArrowPoint', {point: 'to', el})
            dispatch('avaliateArrowBeforeCreating')
        } else {
            commit('setArrowPoint', {point: 'from', el})
            commit('changeSelection', '', { root: true })
        }
    },
    avaliateArrowBeforeCreating: ({ commit, state, getters, dispatch }) => {
        const id = state.arrowMakerMode.from + 'to' + state.arrowMakerMode.to
        const isIdNew = state.arrows.every((arrow, index) => {
            if(arrow.id === id) {
                commit('recreateArrow', index)
                commit('resetArrowMakerMode')
                return false
            }
            return true
        })
        if(isIdNew) {   
            dispatch('prepArrowToAdd', id).then(_ => {
                    dispatch('mailer/sendMail', {to: 'canvas', content: `create:arrow(${getters.latestIndex})` }, {root: true})
                    commit('resetArrowMakerMode')
                })
        }
    },
    prepArrowToAdd: ({ commit, state, dispatch }, id) => {
        dispatch('calculateArrowVariants', {id})
            .then(_ => {
                const arrow = {
                    id,
                    from: state.arrowMakerMode.from,
                    to: state.arrowMakerMode.to,
                    label: state.arrowMakerMode.label,
                    variant: state.variants[0],
                    variantMode: 0,
                    status: 'none' 
                }
                commit('addArrow', arrow)
            })
    },
    calculateArrowVariants: ({ commit, rootState }, {id, mode}) => {
        const [from, to] = id.split('to')
        const fromPoint = rootState.block.blocks[from].centerPos
        const toPoint = rootState.block.blocks[to].centerPos

        const isFromLeftToRight = fromPoint.x < toPoint.x
        const isFromTopToBottom = fromPoint.y < toPoint.y

        const buildVariant = {
            0: () => `${isFromLeftToRight ? 'right' : 'left'}-${isFromTopToBottom ? 'top' : 'bottom'}`,
            1: () => `${isFromLeftToRight ? 'left' : 'right'}-${isFromTopToBottom ? 'bottom' : 'top'}`,
            2: () => `${isFromTopToBottom ? (isFromLeftToRight ? 'left' : 'right') 
                : (isFromLeftToRight ? 'right' : 'left')}-bottom_
                ${fromPoint.y > toPoint.y ? (isFromLeftToRight ? 'left' : 'right') 
                : (isFromLeftToRight ? 'right' : 'left')}`,
            3: () => `right-${isFromTopToBottom ? (isFromLeftToRight ? 'top' : 'bottom') 
                : (isFromLeftToRight ? 'bottom' : 'top')}|
                ${fromPoint.y > toPoint.y ? (isFromLeftToRight ? 'top' : 'bottom') 
                : (isFromLeftToRight ? 'bottom' : 'top')}`
        }

        if(typeof mode == 'number') {
            return buildVariant[mode]()
        } else {
            const variants = Object.values(buildVariant).map(f => f())
            commit('updateVariants', variants)
            return variants
        }

    },
    updateArrowVariant: ({ commit, state, rootState, dispatch }, id) => {
        state.arrows.some((arrow, index) => {
            if(id === arrow.id) {
                const arrowStraightMode = checkWhetherVariantIsStraightAndReturnIt(arrow.variantMode)
                const mode = arrowStraightMode || arrow.variantMode
                dispatch('calculateArrowVariants', {id, mode: Number(mode)})
                    .then(variant => {
                        if(arrowStraightMode) {
                            variant += `!straight${arrowStraightMode == '0' ? 'vertical' : 'horizontal'}`
                        }
                        commit('alterArrow', { index, alterations: { variant } }) 
                    })
                return true
            }
        })
        
        function checkWhetherVariantIsStraightAndReturnIt(mode) {
            const [from, to] = id.split('to')
            const fromPoint = rootState.block.blocks[from].centerPos
            const toPoint = rootState.block.blocks[to].centerPos
            const fromWidth = Number(rootState.block.blocks[from].style.width) - 14
            const fromHeight = Number(rootState.block.blocks[from].style.height) - 14
            const toWidth = Number(rootState.block.blocks[to].style.width) - 14
            const toHeight = Number(rootState.block.blocks[to].style.height) - 14

            const isVerticalStraight = {
                0: Math.abs(fromPoint.x - toPoint.x) < (fromWidth)/2,
                1: Math.abs(fromPoint.x - toPoint.x) - toWidth/2 < 15,
                2: Math.abs(fromPoint.x - toPoint.x) < 10,
                3: Math.abs(fromPoint.x - toPoint.x) - (fromWidth + toWidth)/2 < 40,
            }
            const isHorizontalStraight = {
                0: Math.abs(fromPoint.y - toPoint.y) - toHeight/2 < 15,
                1: Math.abs(fromPoint.y - toPoint.y) < (fromHeight)/2,
                2: Math.abs(fromPoint.y - toPoint.y) - (fromHeight + toHeight)/2 < 40,
                3: Math.abs(fromPoint.y - toPoint.y) < 10
            }

            if(isVerticalStraight[mode]) {
                return '0'
            } else if(isHorizontalStraight[mode]) {
                return '1'
            } else {
                return ''
            }
        }
    },
    deleteArrow: ({ commit, state }, id) => {
        state.arrows.some((arrow, index) => {
            if(arrow.id == id) {
                commit('alterArrow', { index, alterations: { label: '', variantMode: 0 }})
                commit('deleteArrow', index)
                return true
            }
        })
    },
    alterArrow: ({ commit, state }, { id, alterations }) => {
        state.arrows.some((arrow, index) => {
            if((arrow.id === id || id === 'any') 
                && arrow.status !== 'deleted') {
                commit('alterArrow', { index, alterations })
                if(id !== 'any') return true
            }
        })
    },
    deleteArrowsLinkedToBlock: ({ commit, state }, blockId) => {
        state.arrows.forEach((arrow, index) => {
            if(arrow.from == blockId || arrow.to == blockId) {
                commit('deleteArrow', index)
            }
        })
    },
    alterArrowsLinkedToBlock: ({ commit, state }, {blockId, status}) => {
        state.arrows.forEach((arrow, index) => {
            if((arrow.from == blockId || arrow.to == blockId)
                && arrow.status !== 'deleted') {
                commit('alterArrow', { index, alterations: { status } })
            }
        })
    }
}