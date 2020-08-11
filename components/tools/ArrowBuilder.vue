<template>
    <div class="arrow-builder">
        <div class="default-msg mb-2 mt-4 ml-3">
            <p>Arrow</p>
        </div>
        <input type="text" class="arrow-label mt-2 ml-4 interactor" placeholder="No label" v-model="arrow.label" 
            @focus="activateTyping" :disabled="isMakingArrow">
        <button v-if="arrowEl" class="make-arrow mt-2 ml-2 interactor" @click="updateArrowLabel()">Update</button>
        <button v-else-if="isMakingArrow" class="make-arrow mt-2 ml-2 interactor" @click="cancelArrow()">Cancel</button>
        <button v-else class="make-arrow mt-2 ml-2 interactor" :class="{'making-arrow' : isMakingArrow, 'ghost': numberOfBlocks < 2}" 
            :disabled="isMakingArrow || numberOfBlocks < 2" @click="triggetArrowCreatingEvents()">Make</button>
    </div>
</template>

<script>
export default {
    name: 'ArrowBuilder',
    data: function() {
        return {
            arrow: {
                label: '',
            },
        }
    },
    computed: {
        arrowEl() {
            const selected = this.$store.state.selected
            if(selected.toString().includes('to') && document) {
                return document.getElementById(selected)
            } else {
                return ''
            }
        },
        isMakingArrow() {
            return this.$store.state.arrow.arrowMakerMode.on
        },
        numberOfBlocks() {
            return this.$store.getters['block/quantity']
        },
    },
    methods: {
        triggetArrowCreatingEvents() {
            const label = this.arrow.label
            this.$store.dispatch('arrow/setArrowMakerMode', {label, isFromAlreadySet: false})
        },
        cancelArrow() {
            this.$store.dispatch('arrow/updateArrowMakerMode', 'cancel')
        },
        updateArrowLabel() {
            const label = this.arrow.label
            this.$store.dispatch('arrow/alterArrow', { id: this.arrowEl.id, alterations: { label }})
        },
        activateTyping() {
            this.$store.commit('changeTyping', true)
        },
    },
    watch: {
        arrowEl(el) {
            this.arrow.label = el ? el.querySelector('.arrow__label').innerHTML : ''
        }
    }
}
</script>

<style>
.arrow-builder .arrow-label {
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

.arrow-builder .arrow-label[disabled='disabled'] {
    border-color: #fcfcfc50;
}

.arrow-builder .make-arrow {
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

.arrow-builder .cancel-arrow {
    border-color: var(--cancel-color);
    color: var(--cancel-color);
    outline: none;
}

.arrow-builder .make-arrow.ghost,
.arrow-builder .make-arrow.ghost:hover {
    border-color: #fcfcfc50;
    color: #fcfcfc50;
    background-color: transparent;
}

.arrow-builder .make-arrow:hover,
.arrow-builder .make-arrow.making-arrow {
    background-color: var(--theme-color-1);
    color: #f2f2f2;
    outline: none;
}

.arrow-builder .cancel-arrow:hover {
    background-color: var(--cancel-color);
    color: #f2f2f2;
}
</style>