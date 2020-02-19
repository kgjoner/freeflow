export const state = () => ({
    arrows: [],
    arrowMakerMode: {
        on: false,
        from: null,
        to: null,
        label: null
    },
    variants: [],
    missRange: 20,
    reverseDirection: {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left'
    },
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
        const arrow = {
            id,
            from: state.arrowMakerMode.from,
            to: state.arrowMakerMode.to,
            label: state.arrowMakerMode.label,
            variant: '',
            variantMode: 0,
            status: 'none' 
        }
        commit('addArrow', arrow)
        dispatch('updateArrowVariant', id)
    },
    calculateArrowVariants: ({ commit, rootState }, {id, mode}) => {
        const [from, to] = id.split('to')
        const fromPoint = rootState.block.blocks[from].centerPos
        const toPoint = rootState.block.blocks[to].centerPos

        const isFromLeftToRight = fromPoint.x <= toPoint.x
        const isFromTopToBottom = fromPoint.y <= toPoint.y

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
    updateArrowVariant: ({ commit, state, dispatch }, id) => {
        state.arrows.some((arrow, index) => {
            if(id === arrow.id) {
                checkWhetherVariantIsStraightAndReturnIt(arrow.variantMode)
                .then(arrowStraightMode => {
                    const mode = arrowStraightMode || arrow.variantMode
                    dispatch('calculateArrowVariants', {id, mode: Number(mode)})
                    .then(variant => {
                        if(arrowStraightMode) {
                            variant += `!straight${arrowStraightMode == '0' ? 'vertical' : 'horizontal'}`
                        }
                        commit('alterArrow', { index, alterations: { variant } }) 
                    })
                })
                return true
            }
        })
        
        async function checkWhetherVariantIsStraightAndReturnIt(mode) {
            const {from, to} = await dispatch('getPropertiesOfRelatedBlocks', id)

            const isVerticalStraight = {
                0: Math.abs(from.point.x - to.point.x) < (from.width)/2,
                1: Math.abs(from.point.x - to.point.x) - to.width/2 < 15,
                2: Math.abs(from.point.x - to.point.x) < 10,
                3: Math.abs(from.point.x - to.point.x) - (from.width + to.width)/2 < 40,
            }
            const isHorizontalStraight = {
                0: Math.abs(from.point.y - to.point.y) - to.height/2 < 15,
                1: Math.abs(from.point.y - to.point.y) < (from.height)/2,
                2: Math.abs(from.point.y - to.point.y) - (from.height + to.height)/2 < 40,
                3: Math.abs(from.point.y - to.point.y) < 10
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
    },


    /* ---------------------------------------------------------------------
    /  The actions below do not mutate the state, only serve as business logic
    /  to the arrow component
    --------------------------------------------------------------------- */ 

    checkWhetherClickWasOnArrow: ({ state }, {e, arrowElement, variant}) => {

        //Checking if the click was on the arrow label,
        //which can be outside the arrow box
        var validClick = e.target === arrowElement.querySelector('.arrow-label')
        if(validClick) return true


        //Checking if the click was inside the arrow box limits
        //(it could come here from a propagated click)
        const limits = {
            top: arrowElement.getBoundingClientRect().top,
            right: arrowElement.getBoundingClientRect().right,
            bottom: arrowElement.getBoundingClientRect().bottom,
            left: arrowElement.getBoundingClientRect().left
        }

        validClick = limits.top - state.missRange < e.clientY 
            && limits.bottom + state.missRange > e.clientY
            && limits.left - state.missRange < e.clientX
            && limits.right + state.missRange > e.clientX      
        if(!validClick) return false
        
        
        //Checking if the click was on the borders forming the arrow
        const [xDirection, yDirection] = [...variant.split(/[|_!]/)[0].split('-')]
        const arrowBodyStyle = window.getComputedStyle(arrowElement, null)
        
        if(!variant.match(/[|_]/)) {
            validClick = ( limits[xDirection] - state.missRange < e.clientX && e.clientX < limits[xDirection] + state.missRange )
                || ( limits[yDirection] - state.missRange < e.clientY && e.clientY < limits[yDirection] + state.missRange )
        } else if (variant.includes('_')) {
            const height = parseInt(arrowBodyStyle.getPropertyValue('height')) - parseInt(arrowBodyStyle.getPropertyValue('padding-bottom'))
                - parseInt(arrowBodyStyle.getPropertyValue('padding-top'))
            const horizontalLineYPos = limits.top + height/2 + parseInt(arrowBodyStyle.getPropertyValue('padding-top'))
            const reverseXDirection = state.reverseDirection[xDirection]
            const upperXLimitClick = ( limits[xDirection] - state.missRange < e.clientX && e.clientX < limits[xDirection] + state.missRange )
                && e.clientY < horizontalLineYPos + state.missRange
            const middleClick =  ( horizontalLineYPos - state.missRange < e.clientY && e.clientY < horizontalLineYPos + state.missRange )
            const lowerXLimitClick =  ( limits[reverseXDirection] - state.missRange < e.clientX && e.clientX < limits[reverseXDirection] + state.missRange )
                && e.clientY > horizontalLineYPos - state.missRange
            validClick = upperXLimitClick || middleClick ||lowerXLimitClick
        } else if (variant.includes('|')) {
            const width = parseInt(arrowBodyStyle.getPropertyValue('width')) - parseInt(arrowBodyStyle.getPropertyValue('padding-right'))
                - parseInt(arrowBodyStyle.getPropertyValue('padding-left'))
            const verticalLineXPos = limits.left + width/2 + parseInt(arrowBodyStyle.getPropertyValue('padding-left'))
            const reverseYDirection = state.reverseDirection[yDirection]
            const upperYLimitClick = ( limits[yDirection] - state.missRange < e.clientY && e.clientY < limits[yDirection] + state.missRange )
                && e.clientX < verticalLineXPos + state.missRange
            const middleClick =  ( verticalLineXPos - state.missRange < e.clientX && e.clientX < verticalLineXPos + state.missRange )
            const lowerYLimitClick =  ( limits[reverseYDirection] - state.missRange < e.clientY && e.clientY < limits[reverseYDirection] + state.missRange )
                && e.clientX > verticalLineXPos - state.missRange
            validClick = upperYLimitClick || middleClick ||lowerYLimitClick
        }

        return validClick
    },

    getPropertiesOfRelatedBlocks({ rootState }, id) {
        const [from, to] = id.split('to')
        return {
            from: {
                point: rootState.block.blocks[from].centerPos,
                width: Number(rootState.block.blocks[from].style.width) - 14,
                height: Number(rootState.block.blocks[from].style.height) - 14
            },
            to: {
                point: rootState.block.blocks[to].centerPos,
                width: Number(rootState.block.blocks[to].style.width) - 14,
                height: Number(rootState.block.blocks[to].style.height) - 14
            },
        }
    },

    calculateSize: async ({ state, dispatch }, id) => {
        const arrow = state.arrows.find(a => a.id === id)
        const straightMode = arrow.variant.split('!straight')[1]

        const {from, to} = await dispatch('getPropertiesOfRelatedBlocks', id)
        let width = 2*state.missRange + Math.max(Math.abs(to.point.x - from.point.x), 2)
        let height = 2*state.missRange + Math.max(Math.abs(to.point.y - from.point.y), 2)
        if(straightMode === 'vertical') {
            const tolerance = arrow.variantMode == 3 ? 40 : 0
            width = Math.min(width, 2*state.missRange + from.width/2 + tolerance)
        } else if (straightMode === 'horizontal') {
            const tolerance = arrow.variantMode == 2 ? 40 : 0
            height = Math.min(height, 2*state.missRange + from.height/2 + tolerance)
        }
        return {width, height}
    },

    calculatePadding: async({ state, dispatch }, id) => {
        const arrow = state.arrows.find(a => a.id === id)

        const blocks = await dispatch('getPropertiesOfRelatedBlocks', id)
        let padding = '0'
        if(arrow.variant.includes('_')) {
            const order = blocks.from.point.y < blocks.to.point.y ? ['from', 'to'] : ['to', 'from']
            const top = blocks[order[0]].height/2
            const bottom = blocks[order[1]].height/2
            padding = `${top}px 0 ${bottom}px 0`
        } else if(arrow.variant.includes('|')) {
            const order = blocks.from.point.x < blocks.to.point.x ? ['from', 'to'] : ['to', 'from']
            const left = blocks[order[0]].width/2
            const right = blocks[order[1]].width/2
            padding = `0 ${right}px 0 ${left}px`
        }
        return padding
    },

    calculatePosition: async ({ state, dispatch, rootState}, id) => {
        const arrow = state.arrows.find(a => a.id === id)
        const straightMode = arrow.variant.split('!straight')[1]

        const {from, to} = await dispatch('getPropertiesOfRelatedBlocks', id)
        let left = Math.min(to.point.x, from.point.x)
        let top = Math.min(to.point.y, from.point.y)
        if(straightMode === 'vertical' && to.point.x < from.point.x - from.width/2) {
            const correction = arrow.variantMode == 3 ? 40 : 0
            left = Math.max(from.point.x - from.width/2 - correction, to.point.x)
        } else if(straightMode === 'horizontal' && to.y < from.y - from.height/2) {
            const correction = arrow.variantMode == 2 ? 40 : 0
            top = Math.max(from.y - from.height/2 - correction, to.y)
        }
        return {
            left: left - state.missRange - rootState.toolsPanelWidth,
            top: top - state.missRange - rootState.headerHeight
        }
    },

    calculateHeadPosition: async ({ state, dispatch }, id) => {
        const arrow = state.arrows.find(a => a.id === id)
        const straightMode = arrow.variant.split('!straight')[1]

        const {from, to} = await dispatch('getPropertiesOfRelatedBlocks', id)
        const yDirection = from.point.y < to.point.y ? 'bottom' : 'top'
        const xDirection = from.point.x < to.point.x ? 'right' : 'left'

        const style = {}
        if(((arrow.variantMode == 0 || arrow.variantMode == 2) && !straightMode) 
        || straightMode === 'vertical') {
            style.rotate = from.point.y < to.point.y ? '180' : '0';
            style[yDirection] = `${to.height/2 - 3}px`;
            style[xDirection] = '-4px';
        } else if(((arrow.variantMode == 1 || arrow.variantMode == 3) && !straightMode) 
        || straightMode=='horizontal') {
            style.rotate = from.point.x < to.point.x ? '90' : '270';
            style[yDirection] = `-7px`;
            style[xDirection] = `${to.width/2}px`;
        }
        style[state.reverseDirection[yDirection]] = 'auto';
        style[state.reverseDirection[xDirection]] = 'auto';

        return style
    },

    calculateLabelPosition: async ({ state, dispatch }, {id, labelElement, width, height, Xperc, Yperc}) => {
        const arrow = state.arrows.find(a => a.id === id)
        const straightMode = arrow.variant.split('!straight')[1]
        const [xDirection, yDirection] = [...arrow.variant.split(/[|_!]/)[0].split('-')]

        const {from, to} = await dispatch('getPropertiesOfRelatedBlocks', id)
        let Xpos = Xperc*width
        let Ypos = Yperc*height
        let Xset = '';
        let Yset = '';

        if(width < from.width/2 && (straightMode === 'vertical' || arrow.variantMode != 1)) {
            Ypos = yDirection == 'top' ? Math.max(from.height/2, Ypos) 
            : Math.min(height - from.height/2, Ypos)
            if(yDirection != 'top' && (height - from.height/2) == Ypos) {
                Ypos -= labelElement.offsetHeight
            }
        } else if (width < to.width/2 && (straightMode === 'horizontal' || arrow.variantMode == 1)) {
            Ypos = yDirection == 'top' ? Math.max(to.height/2, Ypos) 
            : Math.min(height - to.height/2, Ypos)
            if(yDirection != 'top' && (height - to.height/2) == Ypos) {
                Ypos -= labelElement.offsetHeight
            }
        } else if (height < to.height/2 && (straightMode === 'vertical' || arrow.variantMode != 1)) {
            Xpos = xDirection == 'left' ? Math.max(to.width/2, Xpos)
            : Math.min(width - to.width/2, Xpos)
            if(xDirection != 'left' && (width - to.width/2) == Xpos) {
                Xpos -= labelElement.offsetWidth + 10
            }
        } else if (height < from.height/2 && (straightMode === 'horizontal' || arrow.variantMode == 1)) {
            Xpos = xDirection == 'left' ? Math.max(from.width/2, Xpos)
            : Math.min(width - from.width/2, Xpos)
            if(xDirection != 'left' && (width - from.width/2) == Xpos) {
                Xpos -= labelElement.offsetWidth + 10
            }
        }

        if(arrow.variantMode == 0 || straightMode === 'vertical') {
            const Ylim = yDirection == 'top' ? 10 : height - 40
            if(Ypos < Ylim) {
                Xset = yDirection == 'top' ? (xDirection == 'right' ? Math.max(Xpos, from.width/2 + 10) 
                    : Math.max(width - Xpos - labelElement.offsetWidth, from.width/2 + 10)) : width + 10
                Yset = yDirection == 'top' ? -26 : Math.min(height - Ypos - labelElement.offsetHeight, height - to.height/2 - 30)
            } else {
                Xset = yDirection == 'top' ? width + 10 : (xDirection == 'right' ? Math.max(Xpos, from.width/2 + 10) 
                    : Math.max(width - Xpos - labelElement.offsetWidth, from.width/2 + 10))
                Yset = yDirection == 'top' ? Math.min(Ypos, height - to.height/2 - 30) : 0
            }
        } else if (arrow.variantMode == 1 || straightMode === 'horizontal') {
            const Ylim = yDirection == 'top' ? 10 : height - 40
            if(Ypos < Ylim) {
                Xset = yDirection == 'top' ? (xDirection == 'right' ? Math.max(Xpos, to.width/2 + 10) 
                    : Math.max(width - Xpos - labelElement.offsetWidth, to.width/2 + 10)) : width + 10
                Yset = yDirection == 'top' ? -26 : Math.min(height - Ypos - labelElement.offsetHeight, height - from.height/2 - 30)
            } else {
                Xset = yDirection == 'top' ? width + 10 : (xDirection == 'right' ? Math.max(Xpos, to.width/2 + 10) 
                    : Math.max(width - Xpos - labelElement.offsetWidth, to.width/2 + 10))
                Yset = yDirection == 'top' ? Math.min(Ypos, height - from.height/2 - 30) : 0
            }
        } else if (arrow.variantMode == 2) {
            const Ylim = [height/2 - labelElement.offsetHeight - 10, height/2 + 10]
            if(Ypos > Ylim[0] && Ypos< Ylim[1]) {
                Xset = xDirection == "right" ? Xpos : width - Xpos - labelElement.offsetWidth
                Yset = yDirection == 'top' ? height/2 - labelElement.offsetHeight : height/2
            } else if(Ypos < Ylim[0]) {
                Xset = yDirection == 'top' ? - 10 - labelElement.offsetWidth : width + 10
                Yset = yDirection == 'top' ? Math.max(Ypos, from.height/2) 
                    : Math.min(height - Ypos - labelElement.offsetHeight, height - to.height/2 - labelElement.offsetHeight)
            } else {
                Xset = yDirection == 'top' ? width + 10 : -10 - labelElement.offsetWidth 
                Yset = yDirection == 'top' ? Math.min(Ypos, height - to.height/2 - labelElement.offsetHeight) 
                    : Math.max(height - Ypos - labelElement.offsetHeight, from.height/2)
            }
        } else if (arrow.variantMode == 3) {
            const Xlim = xDirection == 'right' ? [width/2 - 10, width/2 + labelElement.offsetWidth] : [width/2 - labelElement.offsetWidth - 10, width/2 + 10]
            if(Xpos > Xlim[0] && Xpos < Xlim[1]) {
                Xset = width/2 + 10
                Yset = yDirection == 'top' ? Math.min(Ypos, height - labelElement.offsetHeight) : height - Ypos - labelElement.offsetHeight
            } else if(Xpos < Xlim[0]) {
                Xset = xDirection == 'right' ? Math.max(Xpos, from.width/2 + 10) 
                    : Math.min(width - Xpos - labelElement.offsetWidth, width - to.width/2 - labelElement.offsetWidth - 10) 
                Yset = xDirection == 'right' ? (yDirection == 'top' ? -26 : 0) : height - labelElement.offsetHeight
            } else {
                Xset = xDirection == 'right' ? Math.min(Xpos, width - to.width/2 - labelElement.offsetWidth - 10) 
                    : Math.max(width - Xpos - labelElement.offsetWidth, from.width/2 + 10)
                Yset = xDirection == 'right' ? height - labelElement.offsetHeight : (yDirection == 'top' ? -26 : 0)
            }
        }

        return {Xset, Yset}
    }
}