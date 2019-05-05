<template>
    <div class="component" :class="[shape, {'selected': isSelected}, {'from': isFrom}, {'new-piece': newPiece}]" 
        ref="component" :id="id" kg-lock-aspect="false"
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
                        <textarea v-show="isTyping" class="type-box" type="text" ref="typeBox" v-model="text" 
                            @focusout="centralizeText()" rows="1">
                        </textarea>
                    </div>
                </div>
            </div>
            <div v-if="isSelected" class="options-buttons bottom">
                <button class="copy-button mr-1" @click="copyElement()">
                    <fa :icon="fas.faCopy"/>
                </button>
               <button v-show="$store.state.components.quantity > 1" class="align-button mr-1" @click="setAlignment()">
                    <fa :icon="fas.faAlignCenter"/>
                </button>
                <button v-show="$store.state.components.quantity > 1" class="arrow-button" @click="setArrow()">
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
import {buildArrow, centralizeTextVertically} from "../../global"
import { fas } from '@fortawesome/free-solid-svg-icons'

export default {
    name: "BlockComponent",
    props: ['id', 'shape', 'Xpos', 'Ypos', 'props', 'isCopy', '$store'],
    data: function() {
        return {
            newPiece: true,
            text: 'Text here',
            resizing: {
                active: false,
                dirX: '',
                dirY: ''
            },
            isDragging: false,
            isTyping: false,
            isAligning: false
        }
    },
    computed: {
        isSelected() {
            return this.$store.state.components.selected === this.id
        },
        isFrom() {
            return this.$store.state.components.arrowFrom === this.id
        },
        alignWith() {
            return this.$store.state.components.alignWith
        },
        fas() {
            return fas
        },
        toolsPanelWidth() {
            const toolsPanel = document.getElementsByClassName('tools')[0]
            return toolsPanel.getBoundingClientRect().width
        }
    },
    methods: {
        select() {
            this.$refs.component.style.cursor = 'grabbing';
            this.$store.commit('components/changeSelection', this.id)
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
                this.isDragging = true
                this.$refs.component.style.top = `${e.clientY - this.$refs.component.offsetHeight/2 - 65 + window.scrollY}px`
                this.$refs.component.style.left = `${e.clientX - this.$refs.component.offsetWidth/2 - this.toolsPanelWidth + window.scrollX}px`
                this.emmitEventToLinkedArrows('drag')
                this.$store.commit('emmitEventToIndex', 'drag')
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

                const elStyle = window.getComputedStyle(this.$refs.component, null)
                var width = 0;
                var height = 0;

                const originalWidth = this.$refs.component.getBoundingClientRect().width
                const originalHeight = this.$refs.component.getBoundingClientRect().height
                const aspect = originalHeight/originalWidth
                const isLocked = this.$refs.component.getAttribute('kg-lock-aspect')

                if(dirX === 'right') {
                    width = Math.max(e.pageX - this.$refs.component.getBoundingClientRect().left, 30)
                } else {
                    width = Math.max(this.$refs.component.getBoundingClientRect().right - e.pageX, 30)
                }
                if(dirY === 'bottom') {
                    height = Math.max(e.pageY - this.$refs.component.getBoundingClientRect().top + window.scrollY, 30)
                } else {
                    height = Math.max(this.$refs.component.getBoundingClientRect().bottom - e.pageY, 30)
                }

                if(isLocked !== 'false') {
                    if(Math.abs(originalWidth - width) <= Math.abs(originalHeight - height)) {
                        height = width*aspect
                    } else {
                        width = height/aspect
                    }
                }

                this.$refs.component.style.width = width + 'px';
                if(dirX == 'left' && parseInt(elStyle.getPropertyValue('width')) > 30) {
                    const left = this.$refs.component.getBoundingClientRect().left
                    const truePageX = left + (originalWidth - width)
                    this.$refs.component.style.left = `${truePageX - this.toolsPanelWidth}px`
                }

                this.$refs.component.style.height = height + 'px';
                if(dirY == 'top' && parseInt(elStyle.getPropertyValue('height')) > 30) {
                    const top = this.$refs.component.getBoundingClientRect().top
                    const truePageY = top + (originalHeight - height)
                    this.$refs.component.style.top = `${truePageY - 65}px`
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
                this.emmitEventToLinkedArrows('resize')
                this.$store.commit('emmitEventToIndex', 'resize')
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
            this.$refs.component.style.cursor = 'grab'
            if((parseInt(this.$refs.component.style.top) < 0) || 
                (parseInt(this.$refs.component.style.left) < 0)) {
                this.deleteLinkedArrows(this.id)
                document.querySelector('.build-site').removeChild(this.$refs.component);
                this.$store.commit('components/minus')
                this.$store.commit('components/changeSelection', '')
            }
            if(this.newPiece) {
                this.$store.commit('components/changeSelection', '')
                this.newPiece = false
            }
        },
        checkSelection(e) {
            const interactors = Array.from(document.getElementsByClassName('interactor'))
            if((this.isSelected || this.newPiece) && interactors.indexOf(e.target) === -1) {
                if((e.clientX > this.$refs.component.getBoundingClientRect().right + 20) ||
                (e.clientX < this.$refs.component.getBoundingClientRect().left - 20) ||
                (e.clientY > this.$refs.component.getBoundingClientRect().bottom + 20) ||
                (e.clientY < this.$refs.component.getBoundingClientRect().top - 20)) {
                    this.$store.commit('components/changeSelection', '')
                    if(this.newPiece) this.newPiece = false
                }
            }
            if (this.isAligning && this.alignWith) {
                this.alignElement()
                this.$store.commit('components/resetAlignSelection')
                this.isAligning = false
            }
            this.isTyping = this.isSelected? this.isTyping : false
            this.resizing.active = false;
        },
        emmitEventToLinkedArrows(ev) {
            const linkedArrows = this.$store.state.components.arrowLib.filter(pair => pair.indexOf(this.id) !== -1)
            linkedArrows.forEach(arrow => {
                const id = arrow[0] + 'to' + arrow[1]
                buildArrow(id, arrow[0], arrow[1])
                this.$store.commit('components/emmitEventToArrow', [id, ev])
            })
        },
        deleteLinkedArrows(id) {
            const linkedArrows = this.$store.state.components.arrowLib.filter(pair => pair.indexOf(id) !== -1)
            linkedArrows.forEach(arrow => {
                const arrowId = arrow[0] + 'to' + arrow[1]
                const arrowEl = document.getElementById(arrowId)
                this.$store.commit('components/deleteArrow', arrowId)
                document.querySelector('.build-site').removeChild(arrowEl);
                this.$store.commit('components/minus')
                this.$store.commit('components/changeSelection', '')
            })
        },
        copyElement() {
            this.$store.commit('emmitEventToIndex', 'copy')
        },
        setArrow() {
            this.$store.commit('emmitEventToIndex', 'makeArrow')
        },
        setAlignment() {
            this.$store.commit('components/toggleAligning')
            this.isAligning = true;
        },
        alignElement() {
            const targetEl = document.getElementById(this.alignWith)
            const targetPosition = this.getMiddlePoint(targetEl)
            const thisPosition = this.getMiddlePoint(this.$refs.component)

            if(Math.abs(targetPosition.xPos - thisPosition.xPos) < Math.abs(targetPosition.yPos - thisPosition.yPos)) {
                this.$refs.component.style.left = `${targetPosition.xPos - this.$refs.component.offsetWidth/2 - this.toolsPanelWidth}px`
            } else {
                this.$refs.component.style.top = `${targetPosition.yPos - this.$refs.component.offsetHeight/2 - 65}px`
            }

            this.emmitEventToLinkedArrows('drag')
        },
        getMiddlePoint(el) {
            const left = el.getBoundingClientRect().left
            const top = el.getBoundingClientRect().top
            const width = parseInt(window.getComputedStyle(el, null).getPropertyValue('width'));
            const height = parseInt(window.getComputedStyle(el, null).getPropertyValue('height'));
        
            return {
                xPos: left + width/2,
                yPos: top + height/2
            }
        },
        centralizeText() {
            setTimeout(() => centralizeTextVertically(this.$refs.component, 'p'), 100)
        },
    },
    mounted() {
        this.$refs.component.style.top = `${this.Ypos}px`;
        this.$refs.component.style.left = `${this.Xpos}px`;
        this.$refs.shape.style.backgroundColor = this.props.bgColor
        this.$refs.shape.style.border = `${this.props.borderWidth} ${this.props.borderStyle} ${this.props.borderColor}`;
        this.$refs.component.querySelector('p').style.color = this.props.fontColor;
        this.$refs.component.querySelector('p').style.fontSize = `${this.props.fontSize}`;
        if(this.shape === 'connector') {
            this.$refs.component.setAttribute('kg-lock-aspect', 'true')
        }
        if(this.isCopy) {
            this.$refs.component.style.height = `${this.props.height}px`;
            this.$refs.component.style.width = `${this.props.width}px`;
        }
        centralizeTextVertically(this.$refs.component)
        if(this.shape === 'decision') centralizeTextVertically(this.$refs.component)
        window.addEventListener('mousemove', this.migrateToWindow)
        window.addEventListener('click', this.checkSelection)
    }
}
</script>

<style>
.component {
    width: 150px;
    height: 80px;
    border: 2px solid transparent;

    position: absolute;
    cursor: grab;
    z-index: 1;
}

.component.grabbing {
    cursor: grabbing;
}

.component.selected {
    z-index: 10;
    border: 2px dotted #333;
}

.component.from {
    border: 2px solid var(--theme-color-1) !important;
    border-radius: 5px;
}

.component .reference {
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

.component.connector, .component.delay {
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
