<template>
    <div class="block" :class="[shape, {'selected': isSelected}, {'from': isFrom}, {'new-piece': newPiece}]" 
        ref="block" :id="id"
        @mousedown="select" 
        @mouseup="checkPosition">
        <div class="reference">
            <div class="shape" :class="shape" ref="shape"
            @mousemove="e => drag(e)"
            @dblclick="type"
            @keypress.enter="type(false)">
                <div class="inside-text" unselectable="on" onselectstart="return false;" >
                    <div class="crop-left" kg-border="1px"></div>
                    <div class="crop-right"></div>
                    <div class="real-text">
                        <p v-show="!isTyping">
                            {{text}}
                        </p>
                        <textarea v-show="isTyping" class="type-box" type="text" ref="typeBox" 
                            v-model="text" rows="1">
                        </textarea>
                    </div>
                </div>
            </div>
            <div v-if="isSelected" class="options-buttons bottom">
                <button class="copy-button mr-1" @click="copyElement()">
                    <fa :icon="fas.faCopy"/>
                </button>
               <button v-show="$store.getters['block/quantity'] > 1" class="align-button mr-1" @click="triggerAlignment()">
                    <fa :icon="fas.faAlignCenter"/>
                </button>
                <button v-show="$store.getters['block/quantity'] > 1" class="arrow-button" @click="setArrow()">
                    <fa :icon="fas.faLongArrowAltUp" style="transform: rotate(45deg);"/>
                </button>
            </div>
            <div v-show="isSelected" class="resizer top-left" @mousemove="e => resize(e, 'left', 'top')"></div>        
            <div v-show="isSelected" class="resizer top-right" @mousemove="e => resize(e, 'right', 'top')"></div>        
            <div v-show="isSelected" class="resizer bottom-right" @mousemove="e => resize(e, 'right', 'bottom')"></div>        
            <div v-show="isSelected" class="resizer bottom-left" @mousemove="e => resize(e, 'left', 'bottom')"></div>        
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { centralizeTextVertically } from "../../global"
import { fas } from '@fortawesome/free-solid-svg-icons'

export default {
    name: "Blockblock",
    props: ['index', '$store'],
    data: function() {
        return {
            newPiece: true,
            text: 'Text here',
            resizing: {
                active: false,
                dirX: '',
                dirY: ''
            },
            isTyping: false,
            isDragging: false,
            dragOrigins: {
                X: 0,
                Y: 0
            },
            isWaitingToAlign: false
        }
    },
    computed: {
        id() {
            return this.$store.state.block.blocks[this.index].id
        },
        shape() {
            return this.$store.state.block.blocks[this.index].shape
        },
        styleProps() {
            return this.$store.state.block.blocks[this.index].style
        },
        event() {
            return this.$store.state.block.blocks[this.index].event
        },
        Xpos() {
            return this.$store.state.block.blocks[this.index].centerPos.x
        },
        Ypos() {
            return this.$store.state.block.blocks[this.index].centerPos.y
        },
        isSelected() {
            return this.$store.state.selected === this.id && !this.newPiece
        },
        isFrom() {
            return this.$store.state.arrow.arrowMakerMode.from === this.id
        },
        isAspectLocked() {
            return this.$store.state.block.blocks[this.index].style.isLocked
        },
        alignWith() {
            return this.$store.state.block.alignmentMode.alignWith
        },
        fas() {
            return fas
        },
        ...mapState({
            toolsPanelWidth: state => state.toolsPanelWidth,
            headerHeight: state => state.headerHeight,
            isLoadingState: state => state.isLoadingState
        })
    },
    methods: {
        select() {
            this.$refs.block.style.cursor = 'grabbing';
            this.$store.dispatch('avaliateSelection', this.id)
        },
        updateStyle(whichStyle) {
            if(whichStyle === 'height' || whichStyle === 'width') {
                this.$refs.block.style[whichStyle] = this.styleProps[whichStyle] + 'px'
            } else if(whichStyle === 'fontSize' || whichStyle === 'color') {
                this.$refs.shape.querySelector('p').style[whichStyle] = this.styleProps[whichStyle]
            } else {
                this.$refs.shape.style[whichStyle] = this.styleProps[whichStyle]
            }

            if(this.shape === 'decision') {
                this.correctDecisionBorder(this.$refs.shape)
            }

            this.centralizeText()
        },
        updateCenterPos() {
            const canvas = document.querySelector('.canvas-box')
            const newCenterPos = {
                x: this.$refs.block.getBoundingClientRect().left + this.styleProps.width/2 + canvas.scrollLeft,
                y: this.$refs.block.getBoundingClientRect().top + this.styleProps.height/2 + canvas.scrollTop
            }
            this.$store.dispatch('block/changeCenterPos', {id: this.id, newCenterPos})
        },
        type(value = true) {
            this.isTyping = value;
            this.$store.commit('changeTyping', value)
            setTimeout(() => {
                this.$refs.typeBox.focus()
                this.$refs.typeBox.select()
            }, 100)
        },
        drag(e) {
            if(e.buttons && !this.resizing.active && !this.isTyping && (this.isSelected || this.newPiece)) {
                if(!this.isDragging) {
                    this.isDragging = true
                    window.addEventListener('mouseup', this.checkPosition)
                    this.dragOrigins.Y = e.clientY - this.$refs.block.getBoundingClientRect().top
                    this.dragOrigins.X = e.clientX - this.$refs.block.getBoundingClientRect().left
                }
                const correction = this.newPiece ? 0 : this.toolsPanelWidth
                const limitedClientX = Math.min(Math.max(e.clientX, correction), window.innerWidth - 15)
                const limitedClientY = Math.min(Math.max(e.clientY, this.headerHeight), window.innerHeight - 15)
                const canvas = this.newPiece ? document.querySelector('.build') : document.querySelector('.canvas-box')
                this.$refs.block.style.top = `${limitedClientY - this.dragOrigins.Y - this.headerHeight + canvas.scrollTop}px`
                this.$refs.block.style.left = `${limitedClientX - this.dragOrigins.X - correction + canvas.scrollLeft}px`
                this.updateCenterPos()

                if(!this.newPiece) {
                    const movementOutCanvas = {
                        x: Math.sign(e.clientX - limitedClientX),
                        y: Math.sign(e.clientY - limitedClientY)
                    }
                    const movement = {
                        x: movementOutCanvas.x || e.movementX,
                        y: movementOutCanvas.y || e.movementY
                    }
                    const json = JSON.stringify(movement)
                    this.$store.dispatch('mailer/sendMail', { to: 'canvas', content: `drag(${json})`})
                    this.updateLinkedArrowsStatus('drag')
                }
            }
        },
        resize(e, dirX, dirY) {
            if(e.buttons && !this.isDragging) {
                this.resizing = {
                    active: true,
                    dirX,
                    dirY
                }
                if (window.getSelection) {window.getSelection().removeAllRanges();}
                else if (document.selection) {document.selection.empty();}

                const elStyle = window.getComputedStyle(this.$refs.block, null)
                var width = 0;
                var height = 0;

                const previousWidth = this.$refs.block.getBoundingClientRect().width
                const previousHeight = this.$refs.block.getBoundingClientRect().height
                const aspect = previousHeight/previousWidth

                if(dirX === 'right') {
                    width = Math.max(e.clientX - this.$refs.block.getBoundingClientRect().left, 30)
                } else {
                    width = Math.max(this.$refs.block.getBoundingClientRect().right - e.clientX, 30)
                }
                if(dirY === 'bottom') {
                    height = Math.max(e.clientY - this.$refs.block.getBoundingClientRect().top, 30)
                } else {
                    height = Math.max(this.$refs.block.getBoundingClientRect().bottom - e.clientY, 30)
                }

                if(this.isAspectLocked) {
                    if(Math.abs(previousWidth - width) <= Math.abs(previousHeight - height)) {
                        height = width*aspect
                    } else {
                        width = height/aspect
                    }
                }

                const canvas = document.querySelector('.canvas-box')
                this.$refs.block.style.width = width + 'px';
                this.$store.dispatch('block/assignStyleChange', {
                    id: this.id,
                    whichStyle: 'width',
                    value: width
                })
                if(dirX == 'left' && parseInt(elStyle.getPropertyValue('width')) > 30) {
                    const left = this.$refs.block.getBoundingClientRect().left + window.scrollX
                    const truePageX = left + (previousWidth - width)
                    this.$refs.block.style.left = `${truePageX - this.toolsPanelWidth + canvas.scrollLeft}px`
                }

                this.$refs.block.style.height = height + 'px';
                this.$store.dispatch('block/assignStyleChange', {
                    id: this.id,
                    whichStyle: 'height',
                    value: height
                })
                if(dirY == 'top' && parseInt(elStyle.getPropertyValue('height')) > 30) {
                    const top = this.$refs.block.getBoundingClientRect().top + window.scrollY
                    const truePageY = top + (previousHeight - height)
                    this.$refs.block.style.top = `${truePageY - this.headerHeight + canvas.scrollTop}px`
                }

                if(this.shape === 'data') {
                    const width = parseInt(elStyle.getPropertyValue('width'));
                    const height = parseInt(elStyle.getPropertyValue('height'));
                    const angularBase = width*0.17;
                    const angularHeight = height - 10;
                    const ang = Math.atan(angularBase/angularHeight)*180/Math.PI
                    this.$refs.shape.style.transform = `skewX(-${ang}deg)`;
                    this.$refs.shape.querySelector('.inside-text').style.transform = `skewX(${ang}deg)`;
                }
                this.updateCenterPos()
                this.centralizeText()
                this.updateLinkedArrowsStatus('resize')
                this.$store.dispatch('mailer/sendMail', {to: 'builder', content: 'resize' })
            }
        },
        migrateToWindow(e) {
            if(this.resizing.active) {
                this.resize(e, this.resizing.dirX, this.resizing.dirY)
            } else if(this.isDragging) {
                this.drag(e)
            }
        },
        checkPosition() {
            this.isDragging = false;
            this.resizing.active = false;
            this.$refs.block.style.cursor = 'grab'
            if(this.newPiece) {
                this.$refs.block.style.left = `${this.Xpos - this.$refs.block.offsetWidth/2 - this.toolsPanelWidth}px`
                setTimeout(() => {
                    this.$store.dispatch('mailer/sendMail', { to: 'canvas', content: 'drag'})
                    .then(_ => {
                        this.$store.commit('changeSelection', '')
                        this.newPiece = false
                        this.updateCenterPos()
                    })
                }, 0)
            }
            window.removeEventListener('mouseup', this.checkPosition)
        },
        checkSelection(e) {
            const interactors = Array.from(document.getElementsByClassName('interactor'))
            if((this.isSelected || this.newPiece) && interactors.indexOf(e.target) === -1) {
                if((e.clientX > this.$refs.block.getBoundingClientRect().right + 20) ||
                (e.clientX < this.$refs.block.getBoundingClientRect().left - 20) ||
                (e.clientY > this.$refs.block.getBoundingClientRect().bottom + 20) ||
                (e.clientY < this.$refs.block.getBoundingClientRect().top - 20)) {
                    this.$store.commit('changeSelection', '')
                }
            }
            if(this.alignWith && this.isWaitingToAlign) this.alignElement()
            this.isTyping = this.isSelected? this.isTyping : false
            this.resizing.active = false;
        },
        updateLinkedArrowsStatus(ev) {
            this.$store.dispatch('arrow/alterArrowsLinkedToBlock', {blockId: this.id, status: ev})
        },
        deleteLinkedArrows(id) {
            this.$store.dispatch('arrow/deleteArrowsLinkedToBlock', this.id)
        },
        copyElement() {
            const centerPos = {
                x: this.$refs.block.getBoundingClientRect().right + window.scrollX,
                y: this.$refs.block.getBoundingClientRect().bottom + window.scrollY
            }
            this.$store.dispatch('block/prepBlockToAdd', {shape: this.shape, copyId: this.id, centerPos})
        },
        setArrow() {
            this.$store.dispatch('arrow/setArrowMakerMode', {label: '', isFromAlreadySet: true})
        },
        triggerAlignment() {
            this.isWaitingToAlign = true
            this.$store.dispatch('block/toggleAlignmentMode')
        },
        alignElement() {
            this.$store.dispatch('block/alignBlocks', {thisId: this.id, targetId: this.alignWith})
                .then(_ => {
                    this.updateLinkedArrowsStatus('drag')
                    this.$store.dispatch('block/toggleAlignmentMode')
                    this.isWaitingToAlign = false
                })
        },
        centralizeText(wait = null) {
            if(wait) {
                setTimeout(() => centralizeTextVertically(this.$refs.block, 'p'), 100)
            } else {
                centralizeTextVertically(this.$refs.block, 'p')
            }
        },
        correctDecisionBorder(shapeDiv) {
            shapeDiv.style.borderWidth = '0'
            const cropLeft = shapeDiv.querySelector('.crop-left')
            const cropRight = shapeDiv.querySelector('.crop-right')
            cropLeft.setAttribute('kg-border', this.styleProps.borderWidth);
            cropLeft.style.backgroundColor = this.styleProps.borderWidth != '0px' ? this.styleProps.borderColor : 'transparent'
            cropRight.style.backgroundColor = this.styleProps.borderWidth != '0px' ? this.styleProps.borderColor : 'transparent'

            const ang = Math.atan(shapeDiv.getBoundingClientRect().height/shapeDiv.getBoundingClientRect().width)
            const xMove = parseInt(this.styleProps.borderWidth)*Math.sin(ang);
            const yMove = parseInt(this.styleProps.borderWidth)*Math.cos(ang);
            const xMoveMiddle = yMove/Math.tan(ang);

            cropLeft.style.clipPath = `polygon(0% 0%, calc(100% + ${xMove}px) 0%, calc(100% + ${xMove}px) ${yMove}px,
                calc(0% + ${xMove + xMoveMiddle}px) 50%, calc(100% + ${xMove}px) calc(100% - ${yMove}px), calc(100% + ${xMove}px) 100%, 0% 100%)`
            cropLeft.style.shapeOutside = `polygon(-5px 0%, calc(100% + ${this.styleProps.borderWidth} - 5px) 0%, 
                calc(0% + ${this.styleProps.borderWidth} - 5px) 50%, calc(100% + ${this.styleProps.borderWidth} - 5px) 100%, -5px 100%)`
            cropRight.style.clipPath = `polygon(100% 0%, calc(0% - ${xMove}px) 0%, calc(0% - ${xMove}px) ${yMove}px,
                calc(100% - ${xMove + xMoveMiddle}px) 50%, calc(0% - ${xMove}px) calc(100% - ${yMove}px), calc(0% - ${xMove}px) 100%, 100% 100%)`
            cropRight.style.shapeOutside = `polygon(calc(100% + 5px) 0%, calc(0% - ${this.styleProps.borderWidth} + 5px) 0%, 
                calc(100% - ${this.styleProps.borderWidth} + 5px) 50%, calc(0% - ${this.styleProps.borderWidth} + 5px) 100%, calc(100% + 5px) 100%)`
        }
    },
    watch: {
        event(value) {
            if(value.includes('style')) {
                const whichStyle = value.split(':')[1]
                this.updateStyle(whichStyle)
                this.$store.dispatch('block/clearEvent', this.id)
            } else if(value === 'destruction') {
                this.$destroy()
            }
        },
        Xpos(value) {
            if(this.isDragging) return
            this.$refs.block.style.left = `${value - this.$refs.block.offsetWidth/2 - this.toolsPanelWidth}px`
        },
        Ypos(value) {
            if(this.isDragging) return
            this.$refs.block.style.top = `${value - this.$refs.block.offsetHeight/2 - this.headerHeight}px`
        },
        isTyping(value) {
            if(!value) {
                this.centralizeText('wait')
                this.$store.dispatch('block/updateStoredText', {id: this.id, text: this.text})
            }
        }
    },
    mounted() {
        this.newPiece = !this.isLoadingState && !this.$store.state.block.blocks[this.id].isCopy
        const correction = this.newPiece ? 0 : this.toolsPanelWidth
        this.$refs.block.style.top = `${this.Ypos - this.styleProps.height/2 - this.headerHeight}px`;
        this.$refs.block.style.left = `${this.Xpos - this.styleProps.width/2 - correction}px`;
        this.$refs.shape.style.backgroundColor = this.styleProps.backgroundColor
        this.$refs.shape.style.border = `${this.styleProps.borderWidth} ${this.styleProps.borderStyle} ${this.styleProps.borderColor}`;
        this.$refs.block.querySelector('p').style.color = this.styleProps.color;
        this.$refs.block.querySelector('p').style.fontSize = this.styleProps.fontSize;
        this.$refs.block.style.height = `${this.styleProps.height}px`;
        this.$refs.block.style.width = `${this.styleProps.width}px`;
        if(this.isLoadingState) {
            this.text = this.$store.state.block.blocks[this.index].text || this.text
            this.centralizeText('wait')
        } else {
            this.centralizeText()
        }
        if(this.shape === 'decision') {
            this.centralizeText()
            this.correctDecisionBorder(this.$refs.shape)
        }
        window.addEventListener('mousemove', this.migrateToWindow)
        window.addEventListener('click', this.checkSelection)
        this.$store.dispatch('avaliateSelection', this.id)
    }
}
</script>

<style>
.block {
    width: 150px;
    height: 80px;
    border: 2px solid transparent;

    position: absolute;
    cursor: grab;
    z-index: 2;
}

.block.grabbing {
    cursor: grabbing;
}

.block.selected {
    z-index: 91;
    border: 2px dotted #333;
}

.block.from {
    border: 2px solid var(--theme-color-1) !important;
    border-radius: 5px;
}

.block .reference {
    width: 100%;
    height: 100%;
    position: relative;
}

.shape {
    height: calc(100% - 10px);
    width: calc(100% - 10px);
    background-color:#6ecbdb;
    border: 1px solid #5ec4d1;

    position: absolute;
    top: 5px;
    left: 5px;
}

.shape.terminator {
    border-radius: 1000px;
}

.shape.data {
    width: calc(80% - 10px);
    left: calc(10% + 5px);
    transform: skewX(-20deg);
}

.shape.decision {
    height: calc(100% - 5px);
    width: calc(100% - 5px);
    top: 2.5px;
    left: 2.5px;
    -webkit-clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}
/* .shape.decision:before {
    content: '';
    position: absolute;
    background-color: var(--theme-color-1);
    height: calc(100% - 4px);
    width: calc(50% - 2px);
    top: 2px;
    left: 2px;
    -webkit-clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
} */

.block.connector, .block.delay {
    width: 80px;
}

.shape.connector {
    border-radius: 50%;
}

.shape.delay {
    border-top-right-radius: 50%;
    border-bottom-right-radius: 50%;
}

.shape.data .inside-text {
    transform: skew(20deg);
}

.inside-text {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: absolute;
    z-index: 1;
    user-select: none;
    vertical-align: center;
}

.inside-text p {
    font-family: 'Arial';
    font-size: 1.1rem;
    letter-spacing: 0.4px;
    margin-bottom: 0;
    line-height: 150%;
    color: #fcfcfc;
    text-align: center;
}

.type-box {
    width: 100%;
    text-align: center;
    background-color: transparent;
    border: none;
    outline: none;

    font-family: 'Arial';
    font-size: 1.1rem;
    letter-spacing: 0.4px;
    margin-bottom: 0;
    line-height: 150%;
    font-size: 12px;

    position: absolute;
}

.shape.decision .type-box {
    left: 0;
}

.shape.decision .crop-left {
    content: ' ';
    display: block;
    float: left;
    height: 100%;
    width: 50%;
    background-color: #5ec4d1;
    clip-path: polygon(0% 0%, calc(100% + 2px) 0%, calc(0% + 2px) 50%, calc(100% + 2px) 100%, 0% 100%);
    shape-outside: polygon(-10% 0%, 90% 0%, -10% 50%, 90% 100%, -10% 100%);
}
.shape.decision .crop-right {
    content: ' ';
    display: block;
    float: right;
    height: 100%;
    width: 50%;
    background-color: #5ec4d1;
    clip-path: polygon(100% 0%, calc(0% - 2px) 0%, calc(100% - 2px) 50%, calc(0% - 2px) 100%, 100% 100%);
    shape-outside: polygon(110% 0%, 10% 0%, 110% 50%, 10% 100%, 110% 100%);
}

.resizers {
    width: 100%;
    height: 100%;
    position: absolute;
}

.resizer {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid #333;
    background-color: #fff;
}

.resizer.top-left {
    top: -5px;
    left: -5PX;
    cursor: nw-resize;
}

.resizer.top-right {
    top: -5px;
    right: -5px;
    cursor: ne-resize;
}

.resizer.bottom-right {
    bottom: -5px;
    right: -5px;
    cursor: se-resize;
}

.resizer.bottom-left {
    bottom: -5px;
    left: -5px;
    cursor: sw-resize;
}

.options-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: calc(100% + 5px);
    top: -30px;
}

.options-buttons.bottom {
    flex-direction: row;
    left: auto;
    top: auto;
    right: auto;
    bottom: -30px;
}

button.align-button,
button.copy-button,
button.arrow-button {
    width: 25px;
    height: 25px;
    background-color: var(--theme-color-1);
    border: none;
    border-radius: 5px;
    outline: none;
    padding: 1 0;
    animation-name: buttonshowff;
    animation-duration: 30s;
}

button.align-button svg {
    color: #fcfcfc;
}

.new-piece {
    z-index: 91;
}

@keyframes buttonshowoff {
    0% { left: calc(100% - 25px);}
    100% { left: calc(100%);}
}
</style>
