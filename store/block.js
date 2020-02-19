export const state = () => ({
    _nextId: 0,
    blocks: [null],
    defaultStyle: {
        backgroundColor: '#6ecbdb',
        borderColor: '#5ec4d1',
        borderStyle: 'solid',
        borderWidth: '1px',
        fontSize: '14px',
        color: '#fcfcfc',
        height: '80',
        width: '150',
        isLocked: false,
        aspect: 0.47
    },
    alignmentMode: {
        on: false,
        alignWith: null,
    }
})

export const getters = {
    nextId: (state) => {
        return state._nextId + 1
    },
    quantity: (state) => {
        const existingBlocks = state.blocks.filter(b => b && b.event != 'destruction')
        return existingBlocks.length
    }
}

export const mutations = {
    add: (state, block) => {
        state._nextId += 1
        state.blocks.push(block)
    },
    nullify: (state, id) => {
        state.blocks[id].event = 'destruction'
    },
    changeBlockStyle: (state, { id, whichStyle, value }) => {
        state.blocks[id].style[whichStyle] = value
        state.blocks[id].event = `style:${whichStyle}`
    },
    changeDefaultStyle: (state, { whichStyle, value }) => {
        state.defaultStyle[whichStyle] = value
    },
    changeCenterPos: (state, {id, newCenterPos}) => {
        state.blocks[id].centerPos = {...newCenterPos}
    },
    setEvent: (state, {id, event}) => {
        state.blocks[id].event = event
    },
    activateAlignmentMode: state => {
        state.alignmentMode.on = true;
    },
    setAlignElement: (state, el) => {
        state.alignmentMode.alignWith = el;
    },
    resetAlignmentMode: state => {
        state.alignmentMode = {
            on: false,
            alignWith: null
        }
    }
}

export const actions = {
    prepBlockToAdd: ({ commit, state, getters, dispatch }, { shape, copyId = null, centerPos }) => {
        const id = getters['nextId']
        let style = {};
        if(copyId) {
            style = {...state.blocks[copyId].style}
        } else {
            style = {...state.defaultStyle}
            if(shape == 'connector' || shape == 'delay') {
                style.width = style.height;
                style.aspect = 1
            }
            if(shape == 'connector') style.isLocked = true
        }
        commit('add', {id, shape, style, event: 'none', centerPos, isCopy: !!copyId})
        dispatch('mailer/sendMail', {to: 'canvas', content: `create:block(${id})`}, {root: true})
    },

    deleteBlock: ({ commit }, id) => {
        commit('nullify', id)
    },

    assignStyleChange: ({ commit, state }, { id, whichStyle, value }) => {
        if(id) {
            commit('changeBlockStyle', { id, whichStyle, value })
            const block = state.blocks[id]
            if(whichStyle === 'height' && block.style.isLocked) {
                const newWidth = block.style.height/block.style.aspect
                commit('changeBlockStyle', { id, whichStyle: 'width', value: newWidth });
            } else if(whichStyle === 'width' && block.style.isLocked) {
                const newHeight = block.style.width*block.style.aspect;
                commit('changeBlockStyle', { id, whichStyle: 'height', value: newHeight });
            }
            if(whichStyle === 'aspect') { 
                //aspect is only updated when user wants to switch isLocked status; 
                //otherwise, it won't be used. So despite aspect had been chosen as
                //payload by the algorithm, user had actually aimed isLocked:
                commit('changeBlockStyle', { id, whichStyle: 'isLocked', value: !block.style.isLocked })
            }
        } else {
            commit('changeDefaultStyle', { whichStyle, value })
        }
    },

    changeCenterPos: ({ commit }, {id, newCenterPos}) => {
        commit('changeCenterPos', {id, newCenterPos})
    },

    alignBlocks: ({ commit, state }, {thisId, targetId}) => {
        const thisCenterPos = {...state.blocks[thisId].centerPos}
        const targetCenterPos = state.blocks[targetId].centerPos
        if(Math.abs(targetCenterPos.x - thisCenterPos.x) < Math.abs(targetCenterPos.y - thisCenterPos.y)) {
            thisCenterPos.x = targetCenterPos.x
        } else {
            thisCenterPos.y = targetCenterPos.y
        }
        commit('changeCenterPos', {id: thisId, newCenterPos: thisCenterPos})
    },

    toggleAlignmentMode:({ commit, state }) => {
        if(!state.alignmentMode.on) {
            commit('activateAlignmentMode')
        } else {
            commit('resetAlignmentMode')
        }
    },
    
    clearEvent: ({ commit }, id) => {
        commit('setEvent', {id, event: 'none'})
    }
}