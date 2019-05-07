<template>
    <section class="build" :style="`width: ${canvas.width}px;`">
        <div class="canvas-size">
                <span>canvas</span>
                <b-form-input type="number" id="canvas-width" v-model="canvas.width" :formatter="checkCanvasSize" lazy-formatter></b-form-input> x
                <b-form-input type="number" id="canvas-height" v-model="canvas.height" :formatter="checkCanvasSize" lazy-formatter></b-form-input>
        </div>
        <div class="build-site" ref="buildSite" :style="`height: ${canvas.height}px; width: ${canvas.width}px;`">
            <div v-show="$store.state.components.makingArrow" class="making-info" style="left: calc(50vw + 170px - 20px);">From?</div>
            <div v-show="$store.state.components.makingArrow && $store.state.components.arrowFrom" class="making-info"
                style="left: calc(50vw + 170px - 10.7px);">To?</div>
            <div v-show="$store.state.components.aligning" class="making-info" style="left: calc(50vw + 170px - 35.8px);">Align with?</div>
            <h2 v-show="$store.state.components.quantity == 0">Drag and drop a shape here!</h2>
        </div>
        <aside class="tools">
            <b-tabs class="shapes mb-4" v-model="tabIndex">
                <b-tab title="Build" class="mt-3 ml-3" @click="tabIndex = 0">
                    <div class="shape-tools mt-4 ml-1 mr-4">
                        <div>
                            <button class="terminator-tool" @mousedown="e => addComponent(e, 'terminator')"
                                :disabled="isMakingArrow"></button>
                            <p>Terminator</p>
                        </div>
                        <div>
                            <button class="data-tool mr-2" @mousedown="e => addComponent(e, 'data')"
                                :disabled="isMakingArrow"></button>
                            <p>Data</p>
                        </div>
                        <div>
                            <button class="process-tool" @mousedown="e => addComponent(e, 'process')"
                                :disabled="isMakingArrow"></button>
                            <p>Process</p>
                        </div>
                        <div>
                            <button class="decision-tool" @mousedown="e => addComponent(e, 'decision')"
                                :disabled="isMakingArrow"></button>
                            <p class="label-decision">Decision</p>
                        </div>
                        <div>
                            <button class="connector-tool mr-4" @mousedown="e => addComponent(e, 'connector')"
                                :disabled="isMakingArrow"></button>
                            <p class="label-connector">Connector</p>
                        </div>
                        <div>
                            <button class="delay-tool mr-3" @mousedown="e => addComponent(e, 'delay')"
                                :disabled="isMakingArrow"></button>
                            <p class="label-delay">Delay</p>
                        </div>
                    </div>
                    <div class="arrow-tool mb-5">
                        <h4 class="mt-4 ml-3">Arrow</h4>
                        <input type="text" class="arrow-label mt-2 ml-4 interactor" placeholder="No label" v-model="arrow.label" 
                            @focus="activateTyping" :disabled="isMakingArrow" @change="changeArrow(arrow.mode)">
                        <button v-if="isArrowSelected" class="make-arrow mt-2 ml-2 interactor" @click="changeArrow(arrow.mode)">Update</button>
                        <button v-else-if="isMakingArrow" class="make-arrow mt-2 ml-2 interactor" @click="cancelArrow(arrow.mode)">Cancel</button>
                        <b-button v-else class="make-arrow mt-2 ml-2 interactor" :class="{'making-arrow' : isMakingArrow, 'ghost': $store.state.components.quantity < 2}" 
                            :disabled="isMakingArrow || $store.state.components.quantity < 2" @click="setArrow()">Make</b-button>
                        <div v-show="isArrowSelected" class="arrow-mode interactor mt-3 ml-4">
                            <button v-show="!isArrowHorizontal" class="mode-option mode-1 interactor" 
                            :class="{'active-mode': arrow.mode === 1}" @click="changeArrow(1)">
                                <div class="build-block-1 interactor"></div>
                            </button>
                            <button v-show="!isArrowVertical" class="mode-option mode-4 interactor" 
                            :class="{'active-mode': arrow.mode === 4}" @click="changeArrow(4)">
                                <div class="build-block-1 interactor"></div>
                            </button>
                            <button v-show="!isArrowHorizontal && !isArrowVertical" class="mode-option mode-2 interactor" 
                            :class="{'active-mode': arrow.mode === 2}"  @click="changeArrow(2)">
                                <div class="build-block-1 interactor"></div>
                                <div class="build-block-2 interactor"></div>
                            </button>
                            <button v-show="!isArrowHorizontal && !isArrowVertical" class="mode-option mode-3 interactor" 
                            :class="{'active-mode': arrow.mode === 3}"  @click="changeArrow(3)">
                                <div class="build-block-1 interactor"></div>
                                <div class="build-block-2 interactor"></div>
                            </button>
                        </div>
                    </div>
                </b-tab>
                <b-tab title="Properties" class="mt-3 ml-3">
                    <div class="mt-4 ml-4 mb-3">
                        <div class="default-msg mb-4">
                            <p v-show="!selectedEl">Default Values</p>
                            <p v-show="selectedEl">Selection Values</p>
                        </div>
                        <div class="prop">
                            <p>Font: </p>
                            <select class="ml-3 interactor" v-model="props.fontSize" @change="changeStyle">
                                <option value="12px">12</option>
                                <option value="14px">14</option>
                                <option value="16px">16</option>
                                <option value="18px">18</option>
                                <option value="20px">20</option>
                                <option value="22px">22</option>
                            </select>
                            <input type="color" class="ml-3 interactor color-picker" v-model="props.fontColor" @change="changeStyle">
                        </div>
                    </div>
                    <div class="prop mt-2 ml-4 mb-3">
                        <p>Background: </p>
                        <input type="color" class="ml-3 interactor color-picker" v-model="props.bgColor" @change="changeStyle">
                    </div>
                    <div class="prop mt-2 ml-4 mb-3">
                        <p>Border: </p>
                         <select class="ml-3 interactor" v-model="props.borderWidth" @change="changeStyle">
                            <option value="0px">0</option>
                            <option value="1px">1</option>
                            <option value="2px">2</option>
                            <option value="3px">3</option>
                            <option value="4px">4</option>
                            <option value="5px">5</option>
                        </select>
                        <select class="ml-3 interactor" v-model="props.borderStyle" @change="changeStyle">
                            <option value="solid">Solid</option>
                            <option v-show="selectedShape != 'decision'" value="dashed">Dashed</option>
                            <option v-show="selectedShape != 'decision'" value="dotted">Dotted</option>
                        </select>
                        <input type="color" class="ml-3 interactor color-picker" v-model="props.borderColor" @change="changeStyle">
                    </div>
                    <div v-show="selectedEl" class="size-control">
                        <div>
                            <div class="prop mt-2 ml-4 mb-3">
                                <p>Height: </p>
                                <input @focus="activateTyping" type="number" class="ml-3 interactor size-picker" v-model="props.height" @change="changeStyle">
                            </div>
                            <div class="prop mt-2 ml-4 mb-3">
                                <p>Width: </p>
                                <input @focus="activateTyping" type="number" class="ml-3 interactor size-picker" v-model="props.width" @change="changeStyle">
                            </div>
                        </div>
                        <button @click="lockAspect()" class="locker ml-3 interactor" :class="{'locked': props.isLocked}">
                            <fa v-if="!props.isLocked" class="interactor" :icon="fas.faUnlock"/>
                            <fa v-else class="interactor" :icon="fas.faLock"/>
                        </button>
                    </div>
                </b-tab>
            </b-tabs>
            <button class="to-canvas" @click="saveCanvas()" :disabled="isMakingArrow">Download as Image</button>
        </aside>
    </section>
</template>

<script>
import Constructor from '@/components/tools/component'
import ArrowModel from '@/components/tools/arrow'
import domtoimage from 'dom-to-image'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { centralizeTextVertically } from '../global'

import Vue from 'vue'

export default {
    name: "Build",
    data: function() {
        return {
            currentEl: null,
            props: {
                bgColor: '#6ecbdb',
                borderColor: '#5ec4d1',
                borderStyle: 'solid',
                borderWidth: '1px',
                fontSize: '14px',
                fontColor: '#fcfcfc',
                height: '80',
                width: '150',
                isLocked: false,
                aspect: 0.47
            },
            propsDefault: {
                bgColor: '#6ecbdb',
                borderColor: '#5ec4d1',
                borderStyle: 'solid',
                borderWidth: '1px',
                fontSize: '14px',
                fontColor: '#fcfcfc',
                height: '80',
                width: '150',
                isLocked: false,
                aspect: 0.47
            },
            arrow: {
                mode: 1,
                label: '',
                color: '#000000aa',
                default: 1,
            },
            tabIndex: 0,
            canvas: {
                height: 0,
                width: 0,
            }
        }
    },
    computed: {
        selectedEl() {
            return this.$store.state.components.selected
        },
        isArrowSelected() {
            if(this.currentEl) {
                return this.currentEl.id.toString().includes('to')
            } else {
                return false
            }
        },
        isMakingArrow() {
            return this.$store.state.components.makingArrow
        },
        isAnyTyping() {
            return this.$store.state.isAnyTyping
        },
        wasThereAnEvent() {
            return this.$store.state.wasThereAnEvent
        },
        fas() {
            return fas
        },
        isArrowHorizontal() {
            if(this.currentEl) {
                if(this.currentEl.id.toString().includes('to')) {
                    const toElId = this.currentEl.id.split('to')[1]
                    const toEl = document.getElementById(toElId)
                    return (this.currentEl.getBoundingClientRect().height - 40 < toEl.getBoundingClientRect().height/2)
                        && (this.arrow.mode != '3')
                }
            }
        },
        isArrowVertical() {
            if(this.currentEl) {
                if(this.currentEl.id.toString().includes('to')) {
                    const toElId = this.currentEl.id.split('to')[1]
                    const toEl = document.getElementById(toElId)
                    return (this.currentEl.getBoundingClientRect().width - 40 < toEl.getBoundingClientRect().width/2)
                        && (this.arrow.mode != '2')
                }
            }
        },
        selectedShape() {
            if(this.currentEl) {
                if(!this.currentEl.id.includes('to')) {
                    return this.currentEl.classList[1]
                }
            }
            return 'none'
        }
    },
    methods: {
        addComponent(e, shape, isCopy = false) {
            const el = document.createElement('div')
            el.id = 'addHere';
            this.$refs.buildSite.appendChild(el);
            const Component = Vue.extend(Constructor)
            if(shape == 'connector' || shape == 'delay') this.props.width = 80;
            const instance = new Component({
                propsData: {
                    id: this.$store.getters['components/nextId'],
                    shape,
                    Xpos: e.pageX - this.props.width/2 - 340,
                    Ypos: e.pageY - this.props.height/2 - 65,
                    props: this.props,
                    isCopy,
                    $store: this.$store
                }
            })
            instance.$mount('#addHere')
            this.currentEl = instance.$el
            this.$store.commit('components/changeSelection', this.currentEl.id)
            this.$store.commit('components/plus')
        },
        changeStyle() {
            if(this.currentEl) {
                const shapeDiv = this.currentEl.querySelector('.shape')
                if(this.props.isLocked) {
                    if(this.props.height != this.currentEl.getBoundingClientRect().height) {
                        this.props.width = this.props.height/this.props.aspect;
                    } else {
                        this.props.height = this.props.width*this.props.aspect;
                    }
                }
                this.currentEl.style.height = this.props.height + 'px';
                this.currentEl.style.width = this.props.width + 'px';
                shapeDiv.style.backgroundColor = this.props.bgColor;
                shapeDiv.style.borderColor = this.props.borderColor;
                shapeDiv.style.borderStyle = this.props.borderStyle;
                shapeDiv.style.borderWidth = this.props.borderWidth;
                if(shapeDiv.classList.contains('decision')) {
                    shapeDiv.style.borderWidth = '0';
                    const cropLeft = shapeDiv.querySelector('.crop-left')
                    const cropRight = shapeDiv.querySelector('.crop-right')
                    cropLeft.setAttribute('kg-border', this.props.borderWidth);
                    cropLeft.style.backgroundColor = this.props.borderWidth != '0px' ? this.props.borderColor : 'transparent'
                    cropRight.style.backgroundColor = this.props.borderWidth != '0px' ? this.props.borderColor : 'transparent'
                    this.correctDecisionBorder(shapeDiv)
                }
                this.currentEl.querySelector('p').style.fontSize = `${this.props.fontSize}`;
                this.currentEl.querySelector('p').style.color = this.props.fontColor;
                centralizeTextVertically(this.currentEl)
            } else {
                this.propsDefault = this.props
            }
        },
        deleteComponent(press) {
            if(press.key === 'Delete' && this.currentEl && !this.isAnyTyping) {
                if(this.isArrowSelected) {
                    this.$store.commit('components/deleteArrow', this.currentEl.id)
                } else {
                    const id = Number(this.currentEl.id)
                    this.deleteLinkedArrows(id)
                    document.querySelector(`.build-site`).removeChild(this.currentEl);
                    this.$store.commit('components/minus')
                }
                this.$store.commit('components/changeSelection', '')
            }
        },
        deleteLinkedArrows(id) {
            const linkedArrows = this.$store.state.components.arrowLib.filter(pair => pair.indexOf(id) !== -1)
            linkedArrows.forEach(arrow => {
                const arrowId = arrow[0] + 'to' + arrow[1]
                const arrowEl = document.getElementById(arrowId)
                this.$store.commit('components/deleteArrow', arrowId)
                this.$store.commit('components/changeSelection', '')
            })
        },
        setArrow(isFromAlready = false) {
            if(!this.isMakingArrow) {
                const id = this.selectedEl;
                this.$store.commit('components/changeSelection', '')
                this.$store.commit('components/toggleMakingArrow')
                window.addEventListener('click', this.addArrow)
                if(isFromAlready) {
                    this.$store.commit('components/changeSelection', id)
                }
            }
        },
        addArrow() {
            const fromEl = this.$store.state.components.arrowFrom;
            const toEl = this.$store.state.components.arrowTo;
            if(!this.$store.state.components.makingArrow) {
                const arrowId = fromEl + 'to' + toEl;
                if(document.getElementById(arrowId)) {
                    this.currentEl = document.getElementById(arrowId)
                    if(window.getComputedStyle(document.getElementById(arrowId)).getPropertyValue('display') == 'none') {
                        this.changeArrow(this.arrow.mode)
                        this.$store.commit('components/recreateArrow', arrowId)
                    }
                } else {
                    const el = document.createElement('div')
                    el.id = 'addHere';
                    this.$refs.buildSite.appendChild(el);
                    const Component = Vue.extend(ArrowModel)
                    const instance = new Component({
                        propsData: {
                            id: fromEl + 'to' + toEl,
                            from: fromEl,
                            to: toEl,
                            label: this.arrow.label,
                            $store: this.$store
                        }
                    })
                    instance.$mount('#addHere')
                    this.currentEl = instance.$el
                    this.$store.commit('components/pushArrowLib', [fromEl, toEl])
                }
                this.$store.commit('components/changeSelection', this.currentEl.id)
                this.$store.commit('components/resetArrowSelection')
                window.removeEventListener('click', this.addArrow)
            }
        },
        cancelArrow() {
            this.$store.commit('components/resetArrowSelection')
            window.removeEventListener('click', this.addArrow)
        },
        changeArrow(mode) {
            if(this.isArrowSelected) {
                const arrowEl = this.currentEl.querySelector('.arrow-body')
                this.arrow.mode = mode;
                arrowEl.setAttribute('kg-mode', this.arrow.mode)
                arrowEl.querySelector('.arrow-label').innerHTML = this.arrow.label;
                this.$store.commit('components/emmitEventToArrow', [this.currentEl.id, 'updateMode'])
            } else {
                this.arrow.default = mode;
                this.arrow.mode = mode;
            }
        },
        lockAspect() {
            this.props.isLocked = !this.props.isLocked;
            this.props.aspect = this.currentEl.getBoundingClientRect().height/this.currentEl.getBoundingClientRect().width
            this.currentEl.setAttribute('kg-lock-aspect', this.props.isLocked)
        },
        activateTyping() {
            this.$store.commit('changeTyping', true)
        },
        saveCanvas() {
            this.$store.commit('components/changeSelection', '')
            const buildSite = document.querySelector('.build-site')
            domtoimage.toPng(buildSite).then(image => {
                var pom = document.createElement('a');
                pom.setAttribute('href', image);
                pom.setAttribute('download', 'myFlowchart');
                pom.style.display = 'none';
                document.body.appendChild(pom);
                pom.click();
                document.body.removeChild(pom);     
            })
        },
        checkCanvasSize(value, e) {
            const allComponents = document.querySelectorAll('.component')
            const highestVerticalPoint = [...allComponents].reduce((low, el) => {
                return Math.max(low, Math.ceil(el.getBoundingClientRect().bottom + scrollY) - 65)
            }, 0)
            const highestHorizontalPoint = [...allComponents].reduce((low, el) => {
                return Math.max(low, Math.ceil(el.getBoundingClientRect().right + scrollX) - 340)
            }, 0)
            if(e.target.id === 'canvas-width') {
                return Math.max(value, Math.max(window.innerWidth - 340, highestHorizontalPoint))
            } else {
                return Math.max(value, Math.max(window.innerHeight - 65, highestVerticalPoint))
            }
        },
        rgbToHex(rgb) {
            rgb = rgb.split('rgb(').join('').split(')').join('').split(', ')
            var hex = rgb.map(v => {
                let hv = Number(v).toString(16);
                if (hv.length < 2) {
                    hv = "0" + hv;
                }
                return hv
            })
            return "#" + hex.join('');
        },
        correctDecisionBorder(shapeDiv) {
            const cropLeft = shapeDiv.querySelector('.crop-left')
            const cropRight = shapeDiv.querySelector('.crop-right')

            const ang = Math.atan(shapeDiv.getBoundingClientRect().height/shapeDiv.getBoundingClientRect().width)
            const xMove = parseInt(this.props.borderWidth)*Math.sin(ang);
            const yMove = parseInt(this.props.borderWidth)*Math.cos(ang);
            const xMoveMiddle = yMove/Math.tan(ang);

            cropLeft.style.clipPath = `polygon(0% 0%, calc(100% + ${xMove}px) 0%, calc(100% + ${xMove}px) ${yMove}px,
                calc(0% + ${xMove + xMoveMiddle}px) 50%, calc(100% + ${xMove}px) calc(100% - ${yMove}px), calc(100% + ${xMove}px) 100%, 0% 100%)`
            cropLeft.style.shapeOutside = `polygon(-5px 0%, calc(100% + ${this.props.borderWidth} - 5px) 0%, 
                calc(0% + ${this.props.borderWidth} - 5px) 50%, calc(100% + ${this.props.borderWidth} - 5px) 100%, -5px 100%)`
            cropRight.style.clipPath = `polygon(100% 0%, calc(0% - ${xMove}px) 0%, calc(0% - ${xMove}px) ${yMove}px,
                calc(100% - ${xMove + xMoveMiddle}px) 50%, calc(0% - ${xMove}px) calc(100% - ${yMove}px), calc(0% - ${xMove}px) 100%, 100% 100%)`
            cropRight.style.shapeOutside = `polygon(calc(100% + 5px) 0%, calc(0% - ${this.props.borderWidth} + 5px) 0%, 
                calc(100% - ${this.props.borderWidth} + 5px) 50%, calc(0% - ${this.props.borderWidth} + 5px) 100%, calc(100% + 5px) 100%)`
        }
    },
    watch: {
        selectedEl(value) {
            this.currentEl = value? document.getElementById(value) : ''
            document.querySelector('.locker').querySelector('path').classList.add('interactor')
            if(value && !this.isArrowSelected) {
                const shapeStyle = window.getComputedStyle(this.currentEl.querySelector('.shape'), null)
                this.props = {
                    bgColor: this.rgbToHex(shapeStyle.getPropertyValue('background-color')),
                    borderColor: this.rgbToHex(shapeStyle.getPropertyValue('border-color')),
                    borderStyle: shapeStyle.getPropertyValue('border-style'),
                    borderWidth: shapeStyle.getPropertyValue('border-width'),
                    fontSize: window.getComputedStyle(this.currentEl.querySelector('p'), null).getPropertyValue('font-size'),
                    fontColor: this.rgbToHex(window.getComputedStyle(this.currentEl.querySelector('p'), null).getPropertyValue('color')),
                    height: Math.ceil(this.currentEl.getBoundingClientRect().height),
                    width: Math.ceil(this.currentEl.getBoundingClientRect().width),
                    isLocked: this.currentEl.getAttribute('kg-lock-aspect') === 'true'
                }
                if(this.currentEl.classList.contains('decision')) {
                    this.props.borderWidth = this.currentEl.querySelector('.crop-left').getAttribute('kg-border')
                }
                this.tabIndex = 1
            } else if(value && this.isArrowSelected) {
                const arrowStyle = window.getComputedStyle(this.currentEl.querySelector('.arrow-body'), null)
                this.arrow = {
                    mode: Number(this.currentEl.querySelector('.arrow-body').getAttribute('kg-mode')),
                    color: getComputedStyle(document.documentElement).getPropertyValue('--bd-color'),
                    label: this.currentEl.querySelector('.arrow-label').innerHTML || this.arrow.label,
                    default: this.arrow.default
                }
                this.tabIndex = 0
            } else {
                this.props = this.propsDefault
                this.arrow = {
                    mode: this.arrow.default,
                    color: this.arrow.color,
                    default: this.arrow.default,
                    label: ''
                }
                this.tabIndex = 0
            }

            if(document.activeElement !== document.querySelector('.arrow-label')[0]) {
                this.$store.commit('changeTyping', false)
            }
        },
        wasThereAnEvent(value) {
            if(value === 'resize') {
                this.props.height = Math.ceil(this.currentEl.getBoundingClientRect().height);
                this.props.width = Math.ceil(this.currentEl.getBoundingClientRect().width);

                centralizeTextVertically(this.currentEl);
                
                const shapeDiv = this.currentEl.querySelector('.shape')
                if(shapeDiv.classList.contains('decision')) this.correctDecisionBorder(shapeDiv)

                this.$store.commit('clearEvent');
            } else if (value === 'copy') {
                const shape = this.currentEl.classList[1]
                const e = {
                    clientX: this.currentEl.getBoundingClientRect().right,
                    clientY: this.currentEl.getBoundingClientRect().bottom
                }
                this.addComponent(e, shape, true)
                this.$store.commit('clearEvent');
            } else if (value === 'makeArrow') {
                this.setArrow(true)
                this.$store.commit('clearEvent');
            } else if (value === 'drag') {
                if(this.currentEl.getBoundingClientRect().right + scrollX - 340 > this.canvas.width) {
                    this.canvas.width = Math.ceil(this.currentEl.getBoundingClientRect().right + scrollX - 340);
                } else if (this.currentEl.getBoundingClientRect().bottom + scrollY - 65 > this.canvas.height) {
                    this.canvas.height = Math.ceil(this.currentEl.getBoundingClientRect().bottom + scrollY - 65);
                }

                if(this.currentEl.getBoundingClientRect().right > window.innerWidth) {
                    window.scrollTo(window.scrollX + 5, window.scrollY)
                } else if (this.currentEl.getBoundingClientRect().bottom > window.innerHeight) {
                    window.scrollTo(window.scrollX, window.scrollY + 5)
                } else if (this.currentEl.getBoundingClientRect().left < 340 &&
                    !this.currentEl.classList.contains('new-piece')) {
                    window.scrollTo(window.scrollX - 5, window.scrollY)
                } else if (this.currentEl.getBoundingClientRect().top < 65) {
                    window.scrollTo(window.scrollX, window.scrollY - 5)
                }
                this.$store.commit('clearEvent');
            }
        },
    },
    mounted() {
        this.canvas.width = window.innerWidth - 340;
        this.canvas.height = window.innerHeight - 65;
        window.addEventListener('keydown', this.deleteComponent)
    }
}
</script>

<style>

:root {
    --theme-color-1: rgb(4, 179, 179);
    --theme-color-2: orange;
    --bg-tools: rgb(17, 45, 68);
    --off-tools: rgb(25, 61, 90);
    --over-tools: rgb(8, 35, 56);
    --cancel-color: #ff5555;
}

.build {
    display: flex;
    justify-content: space-between;
    flex-direction: row-reverse;
    height: calc(100vh - 65px);
    padding-top: 65px;

    position: relative;
    left: 340px;
    user-select: none;
}

.build h2 {
    color: #aaa;
}

.build h4 {
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    color:#fcfcfc;
    font-size: 1.3rem;
    transform: scaleY(0.8);
}

.build-site {
    flex-grow: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 65px);
    width: calc(100vw - 340px);

    position: relative;
    /* left: 340px; */
    background: transparent;
}

.build-site h2 {
    position: fixed;
    width: 357px;
    left: calc(50vw + 170px - 178px);
    top: calc(50vh + 32px - 19px);
    user-select: none;
}

.build .canvas-size {
    position: fixed;
    top: 15px;
    left: calc(50vw + 20px);
    z-index: 91;

    display: flex;
    justify-content: space-between;
    align-items: center;
}

.build .canvas-size span {
    font-size: 0.9rem;
    font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
    letter-spacing: 0.5px;
    color: #fcfcfccc;
}

.build .canvas-size input.form-control {
    background-color: transparent;
    width: 90px;
    text-align: center;
    padding: 3px 0;
    border: 1px solid #fcfcfc55;
    border-radius: 5px;
    outline: none;
    margin: 0 5px;
    color: #fcfcfc;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button
{
  -webkit-appearance: none;
  margin: 0;
}

.build .canvas-size input:focus {
    border-color: var(--theme-color-2);
    border-width: 1.5px;
    box-shadow: 0 0 2px 0 var(--theme-color-2);
}

.build-site .making-info {
    background-color: var(--theme-color-1);
    color: #fcfcfc;
    padding: 5px 10px;
    border-radius: 4px;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    position: fixed;
    top: 75px;
    z-index: 50;
}

.tools {
    width: 340px;
    overflow: hidden;
    position: fixed;
    height: calc(100vh - 65px);
    left: 0;
    background-color:var(--bg-tools);
    z-index: 90;
}

ul.nav-tabs {
    border-bottom: none;
    background-color: var(--off-tools);
}

.tools .tabs .nav-item a {
    border-top-right-radius: 15px;
    border-top-left-radius: 5px;
    position: relative;
    padding-bottom: 15px;
    bottom: -4px;
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    color:#fcfcfc55;
    font-size: 1.3rem;
    transform: scaleY(0.8);
    background-color: var(--off-tools);
    border: none;
    border-right: 1px solid rgba(0,0,0,0.4)
}

.tools .tabs .nav-item [aria-selected=true] {
    background-color: var(--bg-tools);
    color:#fcfcfc;
}

.tools [role='tabpanel'] {
    outline: none;
}

.tools .shape-tools {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    max-width: 100%;
}

.tools .shape-tools button {
    border: 1px solid var(--theme-color-1);
    width: 70px;
    height: 35px;
    background-color: transparent;
    outline: none;
    cursor: grab;
    margin-bottom: 10px;
}

.tools .shape-tools button[disabled='disabled'] {
    border-color: #fcfcfc50;
    cursor: default;
}

.tools .shape-tools p {
    position: relative;
    text-align: center;
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    color:#fcfcfcaa;
}

.tools .shape-tools .label-decision {
    left: -7px;
}

.tools .shape-tools .label-connector {
    left: -10px;
}

.tools .shape-tools .label-delay {
    left: -7px;
}

.tools .shape-tools button.terminator-tool {
    border-radius: 20px;
    width: 80px;
}

.tools .shape-tools button.data-tool {
    margin-left: 6px;
    width: 65px;
    transform: skewX(-20deg);
}

.tools .shape-tools button.decision-tool {
    margin-left: 22px;
    margin-right: 35px;
    height: 40px;
    width: 40px;
    transform: rotate(-45deg) skew(20deg, 20deg);
}

.tools .shape-tools button.connector-tool {
    height: 40px;
    width: 40px;
    border-radius: 50%;
}

.tools .shape-tools button.delay-tool {
    height: 40px;
    width: 40px;
    border-top-right-radius: 50%;
    border-bottom-right-radius: 50%;
}

.tools .prop {
    display: flex;
}

.tools .prop p {
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    color: #fcfcfcaa;
    margin-top: 7px;
}

.tools select.interactor, .tools .color-picker,
.tools .size-picker {
    height: 36px;
    outline: none;
    background-color: var(--off-tools);
    border-radius: 5px;
    outline: none;
    border: 1px inset #fcfcfc44;
    padding: 2px;
}

.tools input.color-picker {
    padding: 5px;
}

.tools .size-picker {
    padding: 2px 10px;
    width: 80px;
}

.tools .size-control {
    display: flex;
    align-items: center;
}

.tools .locker:before {
    content: ' ';
    height: 25px;
    width: 25px;
    border-top: 1px solid var(--off-tools);
    border-right: 1px solid var(--off-tools);
    position: absolute;
    left: -10px;
    top: -12px;
}

.tools .locker:after {
    content: ' ';
    height: 25px;
    width: 25px;
    border-right: 1px solid var(--off-tools);
    border-bottom: 1px solid var(--off-tools);
    position: absolute;
    left: -10px;
    top: 32px;
}

.tools .locker {
    background-color: var(--bg-tools);
    border: none;
    height: 80%;
    position: relative;
    top: -8px;
    outline: none;
    padding: 10px 8px;
    border-radius: 4px;
}

.tools .locker [fill='currentColor'] {
    color: #fcfcfcaa;
}

.tools .locker.locked [fill='currentColor'] {
    color: #fcfcfccc;
}

.tools .locker.locked:after,
.tools .locker.locked:before {
    border-color: #fcfcfcaa;
}

.arrow-tool .arrow-label {
    padding-left: 10px;
    padding-right: 10px;
    width: 150px;
    background-color: transparent;
    border: none;
    border-bottom: 1px solid var(--theme-color-1);
    outline: none;
    color: #fcfcfcaa;
    font-size: 1.1rem;
}

.arrow-tool .arrow-label[disabled='disabled'] {
    border-color: #fcfcfc50;
}

.arrow-tool .make-arrow {
    height: 40px;
    width: 80px;
    border: 1px solid var(--theme-color-1);
    border-radius: 10px;
    background-color: transparent;
    color: var(--theme-color-1);
    text-transform: uppercase;
    font-family: 'Arial';
    outline: none;
    cursor: pointer;
}

.arrow-tool .cancel-arrow {
    border-color: var(--cancel-color);
    color: var(--cancel-color);
    outline: none;
}

.arrow-tool .make-arrow.ghost,
.arrow-tool .make-arrow.ghost:hover {
    border-color: #fcfcfc50;
    color: #fcfcfc50;
    background-color: transparent;
}

.arrow-tool .make-arrow:hover,
.arrow-tool .make-arrow.making-arrow {
    background-color: var(--theme-color-1);
    color: #f2f2f2;
    outline: none;
}

.arrow-tool .cancel-arrow:hover {
    background-color: var(--cancel-color);
    color: #f2f2f2;
}

.arrow-mode {
    display: flex;
    justify-content: space-between;
    width: 180px;
}

.arrow-mode .mode-option {
    width: 36px;
    height: 36px;
    background-color: var(--off-tools);
    border-radius: 5px;
    outline: none;
    border: 1px inset #fcfcfc44;
    padding: 8px;
}

.arrow-mode .mode-option.active-mode {
    background-color: var(--bg-tools);
    border-color: var(--theme-color-1);
    border-style: solid;
}

.arrow-mode .mode-3 {
    display: flex;
    justify-content: center;
    align-content: center;
}

.arrow-mode .mode-option.active-mode .build-block-1,
.arrow-mode .mode-option.active-mode .build-block-2 {
    border-color: #fcfcfc;
}

.arrow-mode .mode-4 .build-block-1 {
    width: 100%;
    height: 1px;
    border-top: 2px solid #fcfcfcaa;
}

.arrow-mode .mode-1 .build-block-1 {
    width: 1px;
    margin-left: 8px;
    height: 100%;
    border-left: 2px solid #fcfcfcaa;
}

.arrow-mode .mode-2 .build-block-1 {
    width: 100%;
    height: 50%;
    border-bottom: 1px solid #fcfcfcaa;
    border-left: 2px solid #fcfcfcaa;
}

.arrow-mode .mode-2 .build-block-2 {
    width: 100%;
    height: 50%;
    border-top: 1px solid #fcfcfcaa;
    border-right: 2px solid #fcfcfcaa;
}

.arrow-mode .mode-3 .build-block-1 {
    width: 10px;
    height: 20px;
    border-top: 2px solid #fcfcfcaa;
    border-right: 1px solid #fcfcfcaa;
}

.arrow-mode .mode-3 .build-block-2 {
    width: 10px;
    height: 20px;
    border-bottom: 2px solid #fcfcfcaa;
    border-left: 1px solid #fcfcfcaa;
}

.build button.to-canvas {
    color: var(--theme-color-1);
    border: 1px solid var(--theme-color-1);
    background-color: transparent;
    border-radius: 10px;
    padding: 4px 0;
    width: 300px;
    text-transform: uppercase;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    outline: none;
    position: absolute;
    bottom: 20px;
    left: 20px;
}

.build button.to-canvas:hover {
    background-color: var(--theme-color-1);
    color: #fff;
    border-color: var(--theme-color-1);
}

.build button.to-canvas[disabled = "disabled"] {
    border-color: #fcfcfc50;
    color: #fcfcfc50;
}

.build button.to-canvas[disabled = "disabled"]:hover {
    background-color: transparent;
}

.default-msg {
    margin-top: 0px;
    margin-right: 16px;
}

.default-msg p {
    color: #fcfcfc55;
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
    font-size: 1.4rem;
    margin-bottom: 5px;
}
</style>
