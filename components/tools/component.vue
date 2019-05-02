<template>
    <div class="component" :class="[shape, {'selected': isSelected}, {'from': isFrom}]" ref="component" :id="id"
        @mousedown="select" 
        @mousemove="e => drag(e)"
        @mouseup="checkPosition"
        @dblclick="type"
        @keypress.enter="type(false)">
        <div class="reference">
            <div class="shape" :class="shape" ref="shape"></div>
            <div class="inside-text" unselectable="on" onselectstart="return false;" >
                <p v-show="!isTyping">{{text}}</p>
                <textarea v-show="isTyping" class="type-box" type="text" ref="typeBox" v-model="text" rows="3">
                </textarea>
            </div>
            <button v-show="isSelected" class="align-button" @click="setAlignment()">
                <fa :icon="fas.faAlignCenter"/>
            </button>
            <div v-show="isSelected" class="resizer top-left" @mousemove="e => resize(e, 'left', 'top')"></div>        
            <div v-show="isSelected" class="resizer top-right" @mousemove="e => resize(e, 'right', 'top')"></div>        
            <div v-show="isSelected" class="resizer bottom-right" @mousemove="e => resize(e, 'right', 'bottom')"></div>        
            <div v-show="isSelected" class="resizer bottom-left" @mousemove="e => resize(e, 'left', 'bottom')"></div>        
        </div>
    </div>
</template>

<script>
import {buildArrow} from "../../global"
import { fas } from '@fortawesome/free-solid-svg-icons'

export default {
    name: "BlockComponent",
    props: ['id', 'shape', 'Xpos', 'Ypos', 'props', '$store'],
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
                this.$refs.component.style.left = `${e.clientX - this.$refs.component.offsetWidth/2 - this.toolsPanelWidth}px`
                this.emmitEventToLinkedArrows('drag')
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

                if(dirX === 'right') {
                    this.$refs.component.style.width = `${Math.max(e.pageX - this.$refs.component.getBoundingClientRect().left, 30)}px`
                } else {
                    this.$refs.component.style.width = `${Math.max(this.$refs.component.getBoundingClientRect().right - e.pageX, 30)}px`
                    if(parseInt(elStyle.getPropertyValue('width')) > 30) this.$refs.component.style.left = `${e.pageX - this.toolsPanelWidth}px`
                }
                if(dirY === 'bottom') {
                    this.$refs.component.style.height = `${Math.max(e.pageY - this.$refs.component.getBoundingClientRect().top + window.scrollY, 30)}px`
                } else {
                    this.$refs.component.style.height = `${Math.max(this.$refs.component.getBoundingClientRect().bottom - e.pageY, 30)}px`
                    if(parseInt(elStyle.getPropertyValue('height')) > 30) this.$refs.component.style.top = `${e.pageY - 65}px`
                }
                if(this.shape === 'data') {
                    const width = parseInt(elStyle.getPropertyValue('width'));
                    const height = parseInt(elStyle.getPropertyValue('height'));
                    const angularBase = width*0.17;
                    const angularHeight = height - 10;
                    const ang = Math.atan(angularBase/angularHeight)*180/Math.PI
                    this.$refs.shape.style.transform = `skewX(-${ang}deg)`;
                }
                this.emmitEventToLinkedArrows('resize')
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
        }
    },
    mounted() {
        this.$refs.component.style.top = `${this.Ypos}px`
        this.$refs.component.style.left = `${this.Xpos}px`
        this.$refs.shape.style.backgroundColor = this.props.bgColor
        this.$refs.shape.style.border = `${this.props.borderWidth} ${this.props.borderStyle} ${this.props.borderColor}`;
        this.$refs.component.querySelector('p').style.color = this.props.fontColor;
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

.component.conector, .component.delay {
    width: 80px;
}

.shape.conector {
    border-radius: 50%;
}

.shape.delay {
    border-top-right-radius: 50%;
    border-bottom-right-radius: 50%;
}

.inside-text {
    padding: 5px;
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: absolute;
    z-index: 1;
    user-select: none;

    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.inside-text p {
    font-family: 'Arial';
    font-size: 1.1rem;
    letter-spacing: 0.4px;
    margin-bottom: 0;
    line-height: 150%;
    color: #fcfcfc;
}

.type-box {
    width: 100%;
    height: 100%;
    text-align: center;
    vertical-align: center;
    background-color: transparent;
    border: none;
    outline: none;

    font-family: 'Arial';
    font-size: 1.1rem;
    letter-spacing: 0.4px;
    margin-bottom: 0;
    line-height: 150%;
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

button.align-button {
    width: 25px;
    height: 25px;
    background-color: var(--theme-color-1);
    border: none;
    border-radius: 5px;
    position: absolute;
    outline: none;
    left: calc(100% + 5px);
    padding: 1 0;
    animation-name: buttonshowff;
    animation-duration: 30s;
}

button.align-button svg {
    color: #fcfcfc;
}

@keyframes buttonshowoff {
    0% { left: calc(100% - 25px);}
    100% { left: calc(100%);}
}
</style>
