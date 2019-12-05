<template>
    <div v-show="!isDeleted" class="arrow" :class="{'selected' : isSelected}" ref="outerBox" :id="id"
    @mousedown="e => select(e)">
        <div class="arrow-body" ref="arrowBody"
            :class="[{'horizontal-split': variant.match(/_/)}, {'vertical-split': variant.match(/\|/) && !straightMode}]">
            <div class="main-body" :class="[...variant.split(/[|_!]/)[0].split('-')]" ref="mainBody"></div>
            <div v-show="variant.match(/[|_]/)" 
                class="aditional-body" :class="variant.split(/[|_]/)[1]"></div>
            <div class="arrow-head" ref="head"></div>
            <div class="arrow-label" ref="label"
            @mousemove="e => dragLabel(e)" @mousedown="selectByLabel()">{{label}}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Arrow",
    props: ['index', '$store'],
    data: function() {
        return {
            direction: {
                horizontal: '',
                vertical: ''
            },
            reverseDirection: {
                top: 'bottom',
                bottom: 'top',
                left: 'right',
                right: 'left'
            },
            labelPos: {
                x: 0,
                y: 0,
            },
            missRange: 20,
            isDragging: false,
            isDeleted: false,
            trueMode: '1',
        }
    },
    computed: {
        id() {
            return this.$store.state.arrow.arrows[this.index].id
        },
        from() {
            return this.$store.state.arrow.arrows[this.index].from
        },
        to() {
            return this.$store.state.arrow.arrows[this.index].to
        },
        label() {
            return this.$store.state.arrow.arrows[this.index].label
        },
        variant() {
            return this.$store.state.arrow.arrows[this.index].variant.trim()
        },
        straightMode() {
            return this.variant.split('!straight')[1]
        },
        variantMode() {
            return this.$store.state.arrow.arrows[this.index].variantMode
        },
        status() {
            return this.$store.state.arrow.arrows[this.index].status
        },
        isSelected() {
            return this.$store.state.selected === this.id
        },
        sizes() {
            return {
                fromEl: {
                    height: this.$store.state.block.blocks[this.from].style.height,
                    width: this.$store.state.block.blocks[this.from].style.width
                },
                toEl: {
                    height: this.$store.state.block.blocks[this.to].style.height,
                    width: this.$store.state.block.blocks[this.to].style.width
                }
            }
        },
        toolsPanelWidth() {
            const toolsPanel = document.getElementsByClassName('tools')[0]
            return toolsPanel.getBoundingClientRect().width
        }
    },
    methods: {
        select(e) {
            var validClick = false;
            const limits = {
                top: this.$refs.arrowBody.getBoundingClientRect().top,
                right: this.$refs.arrowBody.getBoundingClientRect().right,
                bottom: this.$refs.arrowBody.getBoundingClientRect().bottom,
                left: this.$refs.arrowBody.getBoundingClientRect().left
            }
            const [xDirection, yDirection] = [...this.variant.split(/[|_!]/)[0].split('-')]
            const arrowBodyStyle = window.getComputedStyle(this.$refs.arrowBody, null)
            
            if(!this.variant.match(/[|_]/)) {
                validClick = ( limits[xDirection] - this.missRange < e.clientX && e.clientX < limits[xDirection] + this.missRange )
                    || ( limits[yDirection] - this.missRange < e.clientY && e.clientY < limits[yDirection] + this.missRange )
            } else if (this.variant.includes('_')) {
                const height = parseInt(arrowBodyStyle.getPropertyValue('height')) - parseInt(arrowBodyStyle.getPropertyValue('padding-bottom'))
                    - parseInt(arrowBodyStyle.getPropertyValue('padding-top'))
                const horizontalLineYPos = limits.top + height/2 + parseInt(arrowBodyStyle.getPropertyValue('padding-top'))
                const reverseXDirection = this.reverseDirection[xDirection]
                const upperXLimitClick = ( limits[xDirection] - this.missRange < e.clientX && e.clientX < limits[xDirection] + this.missRange )
                    && e.clientY < horizontalLineYPos + this.missRange
                const middleClick =  ( horizontalLineYPos - this.missRange < e.clientY && e.clientY < horizontalLineYPos + this.missRange )
                const lowerXLimitClick =  ( limits[reverseXDirection] - this.missRange < e.clientX && e.clientX < limits[reverseXDirection] + this.missRange )
                    && e.clientY > horizontalLineYPos - this.missRange
                validClick = upperXLimitClick || middleClick ||lowerXLimitClick
            } else if (this.variant.includes('|')) {
                const width = parseInt(arrowBodyStyle.getPropertyValue('width')) - parseInt(arrowBodyStyle.getPropertyValue('padding-right'))
                    - parseInt(arrowBodyStyle.getPropertyValue('padding-left'))
                const verticalLineXPos = limits.left + width/2 + parseInt(arrowBodyStyle.getPropertyValue('padding-left'))
                const reverseYDirection = this.reverseDirection[yDirection]
                const upperYLimitClick = ( limits[yDirection] - this.missRange < e.clientY && e.clientY < limits[yDirection] + this.missRange )
                    && e.clientX < verticalLineXPos + this.missRange
                const middleClick =  ( verticalLineXPos - this.missRange < e.clientX && e.clientX < verticalLineXPos + this.missRange )
                const lowerYLimitClick =  ( limits[reverseYDirection] - this.missRange < e.clientY && e.clientY < limits[reverseYDirection] + this.missRange )
                    && e.clientX > verticalLineXPos - this.missRange
                validClick = upperYLimitClick || middleClick ||lowerYLimitClick
            }

            if(validClick) {
                this.$store.dispatch('avaliateSelection', this.id)
                this.$store.dispatch('arrow/alterArrow', { id: 'any', alterations: { status: 'none' }})
            } else {
                this.$store.dispatch('avaliateSelection', '')
                if(typeof this.status === 'string' ) {
                    this.$store.dispatch('arrow/alterArrow',  { id: 'any', alterations: { status: e }})
                } else {
                    this.$store.dispatch('arrow/alterArrow', { id: this.id, alterations: { status: 'none' }})
                }
            }
        },
        selectByLabel() {
            this.$store.dispatch('avaliateSelection', this.id)
        },
        buildArrow() {
            const fromPoint = this.$store.state.block.blocks[this.from].centerPos
            const toPoint = this.$store.state.block.blocks[this.to].centerPos

            this.setSize(fromPoint, toPoint)
            this.setPosition(fromPoint, toPoint)

            this.$refs.label.style[this.reverseDirection.horizontal] = `${this.sizes.fromEl.width/2 + 10}px`

            this.checkHeadPosition(this.setLabelPosition(this.variantMode))
        },
        setSize(from, to) {
            let width = 2*this.missRange + Math.max(Math.abs(to.x - from.x), 2)
            let height = 2*this.missRange + Math.max(Math.abs(to.y - from.y), 2)
            if(this.straightMode === 'vertical') {
                const tolerance = this.variantMode == 3 ? 40 : 0
                width = Math.min(width, 2*this.missRange + this.sizes.fromEl.width/2 + tolerance)
            } else if (this.straightMode === 'horizontal') {
                const tolerance = this.variantMode == 2 ? 40 : 0
                height = Math.min(height, 2*this.missRange + this.sizes.fromEl.height/2 + tolerance)
            }
            this.$refs.outerBox.style.width = `${width}px`
            this.$refs.outerBox.style.height = `${height}px`
        },
        setPosition(from, to) {
            let left = Math.min(to.x, from.x)
            let top = Math.min(to.y, from.y)
            if(this.straightMode === 'vertical' && to.x < from.x - this.sizes.fromEl.width/2) {
                const correction = this.variantMode == 3 ? 40 : 0
                left = Math.max(from.x - this.sizes.fromEl.width/2 - correction, to.x)
            } else if(this.straightMode === 'horizontal' && to.y < from.y - this.sizes.fromEl.height/2) {
                const correction = this.variantMode == 2 ? 40 : 0
                top = Math.max(from.y - this.sizes.fromEl.height/2 - correction, to.y)
            }
            this.$refs.outerBox.style.left = `${left - this.missRange - this.toolsPanelWidth}px`
            this.$refs.outerBox.style.top = `${top - this.missRange - 65}px`
        },
        setLabelPosition(mode, Xperc = this.labelPos.x, Yperc = this.labelPos.y) {
            const height = parseInt(window.getComputedStyle(this.$refs.arrowBody, null).getPropertyValue('height'));
            const width = parseInt(window.getComputedStyle(this.$refs.arrowBody, null).getPropertyValue('width'));
            var Xpos = Xperc*width;
            var Ypos = Yperc*height;
            const [xDirection, yDirection] = [...this.variant.split(/[|_!]/)[0].split('-')]
            var Xset = '';
            var Yset = '';

            if(width < this.sizes.fromEl.width/2 && (this.straightMode === 'vertical' || mode != 1)) {
                Ypos = yDirection == 'top' ? Math.max(this.sizes.fromEl.height/2, Ypos) 
                : Math.min(height - this.sizes.fromEl.height/2, Ypos)
                if(yDirection != 'top' && (height - this.sizes.fromEl.height/2) == Ypos) {
                    Ypos -= this.$refs.label.offsetHeight
                }
            } else if (width < this.sizes.toEl.width/2 && (this.straightMode === 'horizontal' || mode == 1)) {
                Ypos = yDirection == 'top' ? Math.max(this.sizes.toEl.height/2, Ypos) 
                : Math.min(height - this.sizes.toEl.height/2, Ypos)
                if(yDirection != 'top' && (height - this.sizes.toEl.height/2) == Ypos) {
                    Ypos -= this.$refs.label.offsetHeight
                }
            } else if (height < this.sizes.toEl.height/2 && (this.straightMode === 'vertical' || mode != 1)) {
                Xpos = xDirection == 'left' ? Math.max(this.sizes.toEl.width/2, Xpos)
                : Math.min(width - this.sizes.toEl.width/2, Xpos)
                if(xDirection != 'left' && (width - this.sizes.toEl.width/2) == Xpos) {
                    Xpos -= this.$refs.label.offsetWidth + 10
                }
            } else if (height < this.sizes.fromEl.height/2 && (this.straightMode === 'horizontal' || mode == 1)) {
                Xpos = xDirection == 'left' ? Math.max(this.sizes.fromEl.width/2, Xpos)
                : Math.min(width - this.sizes.fromEl.width/2, Xpos)
                if(xDirection != 'left' && (width - this.sizes.fromEl.width/2) == Xpos) {
                    Xpos -= this.$refs.label.offsetWidth + 10
                }
            }

            if(mode == 0 || this.straightMode === 'vertical') {
                const Ylim = yDirection == 'top' ? 10 : height - 40
                if(Ypos < Ylim) {
                    Xset = yDirection == 'top' ? (xDirection == 'right' ? Math.max(Xpos, this.sizes.fromEl.width/2 + 10) 
                        : Math.max(width - Xpos - this.$refs.label.offsetWidth, this.sizes.fromEl.width/2 + 10)) : width + 10
                    Yset = yDirection == 'top' ? -26 : Math.min(height - Ypos - this.$refs.label.offsetHeight, height - this.sizes.toEl.height/2 - 30)
                } else {
                    Xset = yDirection == 'top' ? width + 10 : (xDirection == 'right' ? Math.max(Xpos, this.sizes.fromEl.width/2 + 10) 
                        : Math.max(width - Xpos - this.$refs.label.offsetWidth, this.sizes.fromEl.width/2 + 10))
                    Yset = yDirection == 'top' ? Math.min(Ypos, height - this.sizes.toEl.height/2 - 30) : 0
                }
            } else if (mode == 1 || this.straightMode === 'horizontal') {
                const Ylim = yDirection == 'top' ? 10 : height - 40
                if(Ypos < Ylim) {
                    Xset = yDirection == 'top' ? (xDirection == 'right' ? Math.max(Xpos, this.sizes.toEl.width/2 + 10) 
                        : Math.max(width - Xpos - this.$refs.label.offsetWidth, this.sizes.toEl.width/2 + 10)) : width + 10
                    Yset = yDirection == 'top' ? -26 : Math.min(height - Ypos - this.$refs.label.offsetHeight, height - this.sizes.fromEl.height/2 - 30)
                } else {
                    Xset = yDirection == 'top' ? width + 10 : (xDirection == 'right' ? Math.max(Xpos, this.sizes.toEl.width/2 + 10) 
                        : Math.max(width - Xpos - this.$refs.label.offsetWidth, this.sizes.toEl.width/2 + 10))
                    Yset = yDirection == 'top' ? Math.min(Ypos, height - this.sizes.fromEl.height/2 - 30) : 0
                }
            } else if (mode == 2) {
                const Ylim = [height/2 - this.$refs.label.offsetHeight - 10, height/2 + 10]
                if(Ypos > Ylim[0] && Ypos< Ylim[1]) {
                    Xset = xDirection == "right" ? Xpos : width - Xpos - this.$refs.label.offsetWidth
                    Yset = yDirection == 'top' ? height/2 - this.$refs.label.offsetHeight : height/2
                } else if(Ypos < Ylim[0]) {
                    Xset = yDirection == 'top' ? - 10 - this.$refs.label.offsetWidth : width + 10
                    Yset = yDirection == 'top' ? Math.max(Ypos, this.sizes.fromEl.height/2) 
                        : Math.min(height - Ypos - this.$refs.label.offsetHeight, height - this.sizes.toEl.height/2 - this.$refs.label.offsetHeight)
                } else {
                    Xset = yDirection == 'top' ? width + 10 : -10 - this.$refs.label.offsetWidth 
                    Yset = yDirection == 'top' ? Math.min(Ypos, height - this.sizes.toEl.height/2 - this.$refs.label.offsetHeight) 
                        : Math.max(height - Ypos - this.$refs.label.offsetHeight, this.sizes.fromEl.height/2)
                }
            } else if (mode == 3) {
                const Xlim = xDirection == 'right' ? [width/2 - 10, width/2 + this.$refs.label.offsetWidth] : [width/2 - this.$refs.label.offsetWidth - 10, width/2 + 10]
                if(Xpos > Xlim[0] && Xpos < Xlim[1]) {
                    Xset = width/2 + 10
                    Yset = yDirection == 'top' ? Math.min(Ypos, height - this.$refs.label.offsetHeight) : height - Ypos - this.$refs.label.offsetHeight
                } else if(Xpos < Xlim[0]) {
                    Xset = xDirection == 'right' ? Math.max(Xpos, this.sizes.fromEl.width/2 + 10) 
                        : Math.min(width - Xpos - this.$refs.label.offsetWidth, width - this.sizes.toEl.width/2 - this.$refs.label.offsetWidth - 10) 
                    Yset = xDirection == 'right' ? (yDirection == 'top' ? -26 : 0) : height - this.$refs.label.offsetHeight
                } else {
                    Xset = xDirection == 'right' ? Math.min(Xpos, width - this.sizes.toEl.width/2 - this.$refs.label.offsetWidth - 10) 
                        : Math.max(width - Xpos - this.$refs.label.offsetWidth, this.sizes.fromEl.width/2 + 10)
                    Yset = xDirection == 'right' ? height - this.$refs.label.offsetHeight : (yDirection == 'top' ? -26 : 0)
                }
            }

            this.$refs.label.style[yDirection] = `${Yset}px`;
            this.$refs.label.style[xDirection] = `auto`;
            this.$refs.label.style[this.reverseDirection[yDirection]] = `auto`
            this.$refs.label.style[this.reverseDirection[xDirection]] = `${Xset}px`

            return mode
        },
        dragLabel(e) {
            if(e.buttons && this.isSelected) {
                this.isDragging = true;
                const Ypos = `${e.clientY - this.$refs.label.offsetHeight/2 - this.$refs.arrowBody.getBoundingClientRect().top}px`
                const Xpos = `${e.clientX - this.$refs.label.offsetWidth/2  - this.$refs.arrowBody.getBoundingClientRect().left}px`
                this.labelPos.y = Math.min(Math.max(0, parseInt(Ypos)/this.$refs.arrowBody.offsetHeight), 1)
                this.labelPos.x = Math.min(Math.max(0, parseInt(Xpos)/this.$refs.arrowBody.offsetWidth), 1)
                this.setLabelPosition(this.variantMode)
            } else if(this.isDragging) {
                this.isDragging = false;
            }
        },
        migrateToWindow(e) {
            if(this.isDragging) {
                this.dragLabel(e)
            }
        },
        checkSelection(e) {
            const interactors = Array.from(document.getElementsByClassName('interactor'))
            if(this.isSelected && interactors.indexOf(e.target) === -1) {
                if((e.clientX > this.$refs.outerBox.getBoundingClientRect().right + this.missRange) ||
                (e.clientX < this.$refs.outerBox.getBoundingClientRect().left - this.missRange) ||
                (e.clientY > this.$refs.outerBox.getBoundingClientRect().bottom + this.missRange) ||
                (e.clientY < this.$refs.outerBox.getBoundingClientRect().top - this.missRange)) {
                    this.$store.dispatch('avaliateSelection', '')
                    this.$store.dispatch('arrow/alterArrow', { id: this.id, alterations: { status: 'none' }})
                } else {
                    this.select(e)
                }
            }
        },
        checkHeadPosition(mode) {
            const fromPoint = this.$store.state.block.blocks[this.from].centerPos
            const toPoint = this.$store.state.block.blocks[this.to].centerPos
            const height = parseInt(window.getComputedStyle(this.$refs.arrowBody, null).getPropertyValue('height'));
            const yDirection = fromPoint.y < toPoint.y ? 'bottom' : 'top'
            const xDirection = fromPoint.x < toPoint.x ? 'right' : 'left'

            let rotate = ''
            if(((mode == 0 || mode == 2) && !this.straightMode) || this.straightMode === 'vertical') {
                rotate = fromPoint.y < toPoint.y ? '180' : '0';
                this.$refs.head.style[yDirection] = `${this.sizes.toEl.height/2 - 10}px`;
                this.$refs.head.style[xDirection] = '-4px';
            } else if(((mode == 1 || mode == 3) && !this.straightMode) || this.straightMode=='horizontal') {
                rotate = fromPoint.x < toPoint.x ? '90' : '270';
                this.$refs.head.style[yDirection] = `-7px`;
                this.$refs.head.style[xDirection] = `${this.sizes.toEl.width/2 - 5}px`;
            }
            this.$refs.head.style.transform = `rotate(${rotate}deg)`;
            this.$refs.head.style[this.reverseDirection[yDirection]] = 'auto';
            this.$refs.head.style[this.reverseDirection[xDirection]] = 'auto';
        },
        definePadding() {
            const fromPos = this.$store.state.block.blocks[this.from].centerPos
            const toPos = this.$store.state.block.blocks[this.to].centerPos
            this.$refs.arrowBody.style.padding = '0'
            if(this.variant.includes('_')) {
                const order = fromPos.y < toPos.y ? ['fromEl', 'toEl'] : ['toEl', 'fromEl']
                this.$refs.arrowBody.style.paddingTop = `${this.sizes[order[0]].height/2 - 7}px`
                this.$refs.arrowBody.style.paddingBottom = `${this.sizes[order[1]].height/2 - 7}px`
            } else if(this.variant.includes('|')) {
                const order = fromPos.x < toPos.x ? ['fromEl', 'toEl'] : ['toEl', 'fromEl']
                this.$refs.arrowBody.style.paddingLeft = `${this.sizes[order[0]].width/2 - 7}px`
                this.$refs.arrowBody.style.paddingRight = `${this.sizes[order[1]].width/2 - 7}px`
            }
        }
    },
    watch: {
        status(value) {
            if(value !== 'none' && value !== 'deleted' && typeof value === 'string') {
                if (value === 'recreated') this.isDeleted = false;
                if (value === 'resize') this.definePadding()
                this.buildArrow()
                this.checkHeadPosition(this.setLabelPosition(this.variantMode))
                this.$store.dispatch('arrow/updateArrowVariant', this.id)
                this.$store.dispatch('arrow/alterArrow', {id: this.id, alterations: {status: 'none'}})
            } else if (typeof value === 'object' && value) {
                this.select(value)
            } else if ( value === 'deleted') {
                this.isDeleted = true;
                this.labelPos = {
                    x: 0,
                    y: 0,
                }
            }
        },
        variant(value) {
            this.definePadding()
            this.buildArrow()
            this.checkHeadPosition(this.variantMode)
            this.$store.dispatch('arrow/updateArrowVariant', this.id)
        }
    },
    mounted() {
        this.buildArrow()
        window.addEventListener('click', this.checkSelection)
        window.addEventListener('mousemove', this.migrateToWindow)
        this.$store.dispatch('avaliateSelection', this.id)
    }
}
</script>

<style>
:root {
    --border-color: rgba(27, 27, 27, 1);
    --selected-color: rgb(4, 179, 179);
}

.arrow {
    position: absolute;
    z-index: 0;
    padding: 20px;
}

.arrow.selected {
    z-index: 1;
}

.arrow-head {
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 15px solid rgba(27, 27, 27, 1);
    height: 0;
    width: 0;

    position: absolute;
    top: 0;
    right: 0;
}

.arrow-body, .main-body {
    width: 100%;
    height: 100%;
    position: relative;
}

.arrow-body.vertical-split {
    display: flex;
}

.selected .arrow-body, .selected .main-body, 
.selected .aditional-body {
    border-color: var(--selected-color) !important;
}

.selected .arrow-head {
    border-bottom-color: var(--selected-color) !important;
}

.selected .arrow-label {
    color: var(--selected-color) !important;
    z-index: 2
}

.horizontal-split .main-body {
    height: calc(50% + 1px);
}

.horizontal-split .aditional-body {
    height: calc(50% - 1px);
}

.vertical-split .main-body  {
    width: calc(50% + 1px);
    height: 100%;
}

.vertical-split .aditional-body {
    width: calc(50% - 1px);
    height: 100%;
}

.main-body.top,
.aditional-body.top {
    border-top: 1px solid var(--border-color);
}

.main-body.right,
.aditional-body.right {
    border-right: 1px solid var(--border-color);
}

.main-body.bottom,
.aditional-body.bottom {
    border-bottom: 1px solid var(--border-color);
}

.main-body.left,
.aditional-body.left {
    border-left: 1px solid var(--border-color);
}

.arrow .arrow-label {
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    color: rgba(0,0,0,0.6);
    font-size: 1.1rem;
    font-variant: small-caps;
    text-transform: lowercase;

    position: absolute;
    margin-bottom: 0;
    cursor: move;
    user-select: none;
    -moz-user-select:none;
    -webkit-user-select:none;
}

:not([kg-mode="2"]) .main-body.bd-top ~ .arrow-label {
    top: calc(-1.1rem - 8px);
}

:not([kg-mode="2"]) .main-body.bd-bottom ~ .arrow-label {
    bottom: 2px;
}
</style>
