<template>
    <div class="block-properties">
        <div class="mt-4 ml-4 mb-3">
            <div class="default-msg mb-4">
                <p v-show="!selectedEl">Default Values</p>
                <p v-show="selectedEl">Selection Values</p>
            </div>
            <div class="prop">
                <p>Font: </p>
                <select class="ml-3 interactor" v-model="props.fontSize" @change="changeStyle('fontSize')">
                    <option value="12px">12</option>
                    <option value="14px">14</option>
                    <option value="16px">16</option>
                    <option value="18px">18</option>
                    <option value="20px">20</option>
                    <option value="22px">22</option>
                </select>
                <input type="color" class="ml-3 interactor color-picker" v-model="props.color" @change="changeStyle('color')">
            </div>
        </div>
        <div class="prop mt-2 ml-4 mb-3">
            <p>Background: </p>
            <input type="color" class="ml-3 interactor color-picker" v-model="props.backgroundColor" @change="changeStyle('backgroundColor')">
        </div>
        <div class="prop mt-2 ml-4 mb-3">
            <p>Border: </p>
                <select class="ml-3 interactor" v-model="props.borderWidth" @change="changeStyle('borderWidth')">
                <option value="0px">0</option>
                <option value="1px">1</option>
                <option value="2px">2</option>
                <option value="3px">3</option>
                <option value="4px">4</option>
                <option value="5px">5</option>
            </select>
            <select class="ml-3 interactor" v-model="props.borderStyle" @change="changeStyle('borderStyle')">
                <option value="solid">Solid</option>
                <option v-show="selectedShape != 'decision'" value="dashed">Dashed</option>
                <option v-show="selectedShape != 'decision'" value="dotted">Dotted</option>
            </select>
            <input type="color" class="ml-3 interactor color-picker" v-model="props.borderColor" @change="changeStyle('borderColor')">
        </div>
        <div v-show="selectedEl" class="size-control">
            <div>
                <div class="prop mt-2 ml-4 mb-3">
                    <p>Height: </p>
                    <input @focus="activateTyping" type="number" class="ml-3 interactor size-picker" v-model="props.height" @change="changeStyle('height')">
                </div>
                <div class="prop mt-2 ml-4 mb-3">
                    <p>Width: </p>
                    <input @focus="activateTyping" type="number" class="ml-3 interactor size-picker" v-model="props.width" @change="changeStyle('width')">
                </div>
            </div>
            <button @click="lockAspect()" class="locker ml-3 interactor" :class="{'locked': props.isLocked}">
                <fa v-if="!props.isLocked" class="interactor" :icon="fas.faUnlock"/>
                <fa v-else class="interactor" :icon="fas.faLock"/>
            </button>
        </div>
    </div>
</template>

<script>
import { fas } from '@fortawesome/free-solid-svg-icons'
import { centralizeTextVertically } from '@/global'

export default {
    name: "BlockPropertiesSetup",
    data: function() {
        return {
            props: {
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
        }
    },
    computed: {
        selectedEl() {
            return this.$store.state.selected
        },
        blockEl() {
            const selected = this.$store.state.selected
            if(selected && !selected.toString().includes('to')) {
                return document.getElementById(selected)
            } else {
                return ''
            }
        },
        propsDefault() {
            return this.$store.state.block.defaultStyle
        },
        fas() {
            return fas
        },
        selectedShape() {
            if(this.blockEl) {
                return this.blockEl.classList[1]
            }
            return 'none'
        },
        builderEvent() {
            return this.$store.state.mailer.builder
        },
    }, 
    methods: {
        changeStyle(whichStyle) {
            this.$store.dispatch('block/assignStyleChange', {
                id: this.selectedEl,
                whichStyle,
                value: this.props[whichStyle]
            })
            if(this.blockEl) centralizeTextVertically(this.blockEl)
        },
        lockAspect() {
            this.props.isLocked = !this.props.isLocked;
            this.props.aspect = this.blockEl.getBoundingClientRect().height/this.blockEl.getBoundingClientRect().width
            this.changeStyle('aspect')
        },
        activateTyping() {
            this.$store.commit('changeTyping', true)
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
        blockEl(el) {
            document.querySelector('.locker').querySelector('path').classList.add('interactor')
            if(el) {
                this.props = {...this.$store.state.block.blocks[el.id].style}
            } else {
                this.props = {...this.propsDefault}
            }
        },
        builderEvent(value) {
            if(value === 'resize') {
                this.props.height = Math.ceil(this.blockEl.getBoundingClientRect().height);
                this.props.width = Math.ceil(this.blockEl.getBoundingClientRect().width);

                centralizeTextVertically(this.blockEl);
                
                const shapeDiv = this.blockEl.querySelector('.shape')
                if(shapeDiv.classList.contains('decision')) this.correctDecisionBorder(shapeDiv)
            }
            this.$store.dispatch('mailer/clearEvent', 'builder');
        },
    }
}
</script>

<style>
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
</style>