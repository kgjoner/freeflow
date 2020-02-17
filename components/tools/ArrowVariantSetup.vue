<template>    
    <div v-show="arrowEl" class="arrow-variant interactor mt-3 ml-4">
        <div v-for="(variant, index) in variants" :key="index">
        <button class="mode-option interactor" 
        :class="[{'active-mode': storedArrow.variantMode === index}, `mode-${index}`,
        {'restricted': checkWhetherVariantIsRestricted(index)}, straightMode]" 
        @click="alterArrowVariant(variant, index)">
            <div class="build-block-1 interactor" :class="[...variant.split(/[|_]/)[0].split('-')]"></div>
            <div v-if="index>=2 || straightMode" class="build-block-2 interactor" :class="variant.split(/[|_]/)[1]"></div>
        </button>
        <span v-show="checkWhetherVariantIsRestricted(index)">Restricted</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ArrowTools',
    data: function() {
        return {
            arrow: {
                variant: 'top-left',
            },
        }
    },
    computed: {
        arrowEl() {
            const selected = this.$store.state.selected
            if(selected.toString().includes('to')) {
                return document.getElementById(selected)
            } else {
                return ''
            }
        },
        storedArrow() {
            return this.$store.state.arrow.arrows.filter(a => a.id == this.arrowEl.id)[0] || {}
        },
        straightMode() {
            return this.arrowEl ? this.storedArrow.variant.split('!straight')[1] : ''
        },
        variants() {
            return this.$store.state.arrow.variants
        },
    },
    methods: {
        alterArrowVariant(variant, variantMode) {
            this.arrow.variant = variant;
            this.$store.dispatch('arrow/alterArrow', { id: this.arrowEl.id, alterations: { variant, variantMode }})
        },
        checkWhetherVariantIsRestricted(mode) {
            return mode === this.storedArrow.variantMode && this.variants[mode] !== this.storedArrow.variant
        }
    },
    watch: {
        arrowEl(value) {
            if(value) this.$store.dispatch('arrow/calculateArrowVariants', {id: this.arrowEl.id})
            this.arrow.variant = value ? this.storedArrow.variant : 1
        }
    }
}
</script>

<style>
.arrow-variant {
    display: flex;
    justify-content: space-between;
    width: 180px;
}

.arrow-variant > div {
    width: 36px;
}

.arrow-variant .mode-option {
    width: 36px;
    height: 36px;
    background-color: var(--off-tools);
    border-radius: 5px;
    outline: none;
    border: 1px inset #fcfcfc44;
    padding: 8px;
}

.arrow-variant .mode-option.active-mode {
    background-color: var(--bg-tools);
    border-color: var(--theme-color-1);
    border-style: solid;
}

.arrow-variant .mode-option.active-mode.restricted {
    border-color: #e83317;
}

.arrow-variant span {
    color: #e83317;
    font-size: 0.9em;
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    position: relative;
    left: -10px;
}

.arrow-variant .mode-3:not(.restricted),
.arrow-variant button.restricted.vertical {
    display: flex;
    justify-content: center;
    align-content: center;
}

.arrow-variant .mode-option.active-mode .build-block-1,
.arrow-variant .mode-option.active-mode .build-block-2 {
    border-color: #fcfcfc;
}

.arrow-variant .build-block-1,
.arrow-variant .build-block-2 {
    width: 100%;
    height: 18px;
}

.arrow-variant .mode-2:not(.restricted) .build-block-1,
.arrow-variant button.restricted.horizontal .build-block-1 {
    height: calc(50% + 1px);
}

.arrow-variant .mode-2:not(.restricted) .build-block-2,
.arrow-variant button.restricted.horizontal .build-block-2 {
    height: calc(50% - 1px);
}

.arrow-variant .mode-3:not(.restricted) .build-block-1,
.arrow-variant button.restricted.vertical .build-block-1 {
    width: calc(50% + 1px);
}

.arrow-variant .mode-3:not(.restricted) .build-block-2,
.arrow-variant button.restricted.vertical .build-block-2 {
    width: calc(50% - 1px);
}

.arrow-variant button:not(.restricted) .top {
    border-top: 2px solid #fcfcfcaa;
}

.arrow-variant button:not(.restricted) .bottom,
.restricted.horizontal .build-block-1 {
    border-bottom: 2px solid #fcfcfcaa;
}

.arrow-variant button:not(.restricted) .right,
.restricted.vertical .build-block-1 {
    border-right: 2px solid #fcfcfcaa;
}

.arrow-variant button:not(.restricted) .left {
    border-left: 2px solid #fcfcfcaa;
}
</style>