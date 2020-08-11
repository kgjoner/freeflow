<template>
    <div v-show="!isDeleted" class="arrow" :class="{'selected' : isSelected}" ref="outerBox" :id="id"
    @mousedown="e => select(e)">
        <div class="arrow__container" ref="container"
            :class="[{'horizontal-split': variant.match(/_/)}, {'vertical-split': variant.match(/\|/) && !straightMode}]">
            <div class="arrow__main-body" :class="[...variant.split(/[|_!]/)[0].split('-')]" ref="mainBody"></div>
            <div v-show="variant.match(/[|_]/)" 
                class="arrow__aditional-body" :class="variant.split(/[|_]/)[1]">
            </div>
            <div class="arrow__head" ref="head"></div>
            <div class="arrow__label" ref="label" @mousemove="e => dragLabel(e)">{{label}}</div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: "Arrow",
    props: ['index', '$store'],
    data: function() {
        return {
            isDragging: false,
        }
    },
    computed: {
        id() {
            return this.$store.state.arrow.arrows[this.index].id
        },
        label() {
            return this.$store.state.arrow.arrows[this.index].label
        },
        labelPos() {
            return this.$store.state.arrow.arrows[this.index].labelPos
        },
        variant() {
            return this.$store.state.arrow.arrows[this.index].variant.trim()
        },
        straightMode() {
            return this.variant.split('!straight')[1]
        },
        status() {
            return this.$store.state.arrow.arrows[this.index].status
        },
        isSelected() {
            return this.$store.state.selected === this.id
        },
        isDeleted() {
            return this.status === 'deleted'
        },
        ...mapState({
            toolsPanelWidth: state => state.toolsPanelWidth,
            headerHeight: state => state.headerHeight,
            missRange: state => state.arrow.missRange,
            reverseDirection: state => state.arrow.reverseDirection
        })
    },
    methods: {
        select(e) {
            const arrowElement = this.$refs.container
            this.$store.dispatch('arrow/checkWhetherClickWasOnArrow', {e, arrowElement, variant: this.variant})
                .then(validClick => {
                    if(validClick) {
                        this.$store.dispatch('avaliateSelection', this.id)
                        this.$store.dispatch('arrow/alterArrow', { id: this.id, alterations: { status: 'none' }})
                    } else if(typeof this.status === 'string' ) {
                        this.$store.dispatch('avaliateSelection', '')
                        this.$store.dispatch('arrow/alterArrow',  { id: 'any', alterations: { status: e }})
                    } else {
                        this.$store.dispatch('arrow/alterArrow', { id: this.id, alterations: { status: 'none' }})
                    }
                })
        },
        checkSelection(e) {
            const interactors = Array.from(document.getElementsByClassName('interactor'))
            if(this.isSelected && interactors.indexOf(e.target) === -1 && e.target !== this.$refs.label) {
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
        buildArrow() {
            this.setSize()
            this.setPosition()
            this.setLabelPosition()
            this.setHeadPosition()
        },
        setSize() {
            this.$store.dispatch('arrow/calculateSize', this.id)
                .then(({width, height}) => {
                    this.$refs.outerBox.style.width = `${width}px`
                    this.$refs.outerBox.style.height = `${height}px`
                })
        },
        setPosition() {
            this.$store.dispatch('arrow/calculatePosition', this.id)
                .then(({top, left}) => {
                    this.$refs.outerBox.style.left = `${left}px`
                    this.$refs.outerBox.style.top = `${top}px`
                })
        },
        setHeadPosition() {
            this.$store.dispatch('arrow/calculateHeadPosition', this.id)
                .then(style => {
                    this.$refs.head.style.transform = `rotate(${style.rotate}deg)`;
                    this.$refs.head.style.top = `${style.top}`;
                    this.$refs.head.style.bottom = `${style.bottom}`;
                    this.$refs.head.style.left = `${style.left}`;
                    this.$refs.head.style.right = `${style.right}`;
                })
        },
        setLabelPosition(Xperc = this.labelPos.x, Yperc = this.labelPos.y) {
            const payload = {
                id: this.id,
                labelElement: this.$refs.label,
                height: parseInt(window.getComputedStyle(this.$refs.container, null).getPropertyValue('height')),
                width: parseInt(window.getComputedStyle(this.$refs.container, null).getPropertyValue('width')),
                Xperc,
                Yperc,
            }
            const [xDirection, yDirection] = [...this.variant.split(/[|_!]/)[0].split('-')]
            this.$store.dispatch('arrow/calculateLabelPosition', payload)
                .then(({Xset, Yset}) => {
                    this.$refs.label.style[yDirection] = `${Yset}px`;
                    this.$refs.label.style[xDirection] = `auto`;
                    this.$refs.label.style[this.reverseDirection[yDirection]] = `auto`
                    this.$refs.label.style[this.reverseDirection[xDirection]] = `${Xset}px`
                })
        },
        definePadding() {
            this.$store.dispatch('arrow/calculatePadding', this.id)
                .then(padding => {
                    this.$refs.container.style.padding = padding
                })
        },
        dragLabel(e) {
            if(e.buttons && this.isSelected) {
                this.isDragging = true;
                const Ypos = `${e.clientY - this.$refs.label.offsetHeight/2 - this.$refs.container.getBoundingClientRect().top}px`
                const Xpos = `${e.clientX - this.$refs.label.offsetWidth/2  - this.$refs.container.getBoundingClientRect().left}px`
                const labelPos = {
                    x: Math.min(Math.max(0, parseInt(Xpos)/this.$refs.container.offsetWidth), 1),
                    y: Math.min(Math.max(0, parseInt(Ypos)/this.$refs.container.offsetHeight), 1)
                }
                this.$store.dispatch('arrow/alterArrow', {id: this.id, alterations: { labelPos }})
                    .then(() => this.setLabelPosition())
            } else if(this.isDragging) {
                this.isDragging = false;
            }
        },
        migrateToWindow(e) {
            if(this.isDragging) {
                this.dragLabel(e)
            }
        },
    },
    watch: {
        status(value) {
            if(value === 'destruction') {
                this.$destroy()
            } else if(value !== 'none' && value !== 'deleted' && typeof value === 'string') {
                if (value === 'resize') this.definePadding()
                this.buildArrow()
                this.$store.dispatch('arrow/updateArrowVariant', this.id)
                this.$store.dispatch('arrow/alterArrow', {id: this.id, alterations: {status: 'none'}})
            } else if (typeof value === 'object' && value) {
                this.select(value)
            }
        },
        variant(value) {
            this.definePadding()
            this.buildArrow()
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

.arrow__head {
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 15px solid rgba(27, 27, 27, 1);
    height: 0;
    width: 0;

    position: absolute;
    top: 0;
    right: 0;
}

.arrow__container, .arrow__main-body {
    width: 100%;
    height: 100%;
    position: relative;
}

.arrow__container.vertical-split {
    display: flex;
}

.selected .arrow__container, 
.selected .arrow__main-body, 
.selected .arrow__aditional-body {
    border-color: var(--selected-color) !important;
}

.selected .arrow__head {
    border-bottom-color: var(--selected-color) !important;
}

.selected .arrow__label {
    color: var(--selected-color) !important;
    z-index: 2
}

.horizontal-split .arrow__main-body {
    height: calc(50% + 1px);
}

.horizontal-split .arrow__aditional-body {
    height: calc(50% - 1px);
}

.vertical-split .arrow__main-body  {
    width: calc(50% + 1px);
    height: 100%;
}

.vertical-split .arrow__aditional-body {
    width: calc(50% - 1px);
    height: 100%;
}

.arrow__main-body.top,
.arrow__aditional-body.top {
    border-top: 1px solid var(--border-color);
}

.arrow__main-body.right,
.arrow__aditional-body.right {
    border-right: 1px solid var(--border-color);
}

.arrow__main-body.bottom,
.arrow__aditional-body.bottom {
    border-bottom: 1px solid var(--border-color);
}

.arrow__main-body.left,
.arrow__aditional-body.left {
    border-left: 1px solid var(--border-color);
}

.arrow .arrow__label {
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

:not([kg-mode="2"]) .arrow__main-body.bd-top ~ .arrow__label {
    top: calc(-1.1rem - 8px);
}

:not([kg-mode="2"]) .arrow__main-body.bd-bottom ~ .arrow__label {
    bottom: 2px;
}
</style>
