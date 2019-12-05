<template>
    <section class="build">
        <CanvasSizeInput />
        <Canvas />
        <aside class="tools">
            <b-tabs class="shapes mb-4" v-model="tabIndex">
                <b-tab title="Build" class="mt-4 ml-3" @click="tabIndex = 0">
                    <BlockBuilder />
                    <ArrowBuilder />
                    <ArrowVariantSetup />
                </b-tab>
                <b-tab title="Properties" class="mt-3 ml-3">
                    <BlockPropertiesSetup />
                </b-tab>
            </b-tabs>
            <button class="to-canvas" @click="saveCanvas()" :disabled="isMakingArrow">Download as Image</button>
        </aside>
    </section>
</template>

<script>
import CanvasSizeInput from '@/components/canvas/CanvasSizeInput'
import Canvas from '@/components/canvas/Canvas'
import BlockBuilder from '@/components/tools/BlockBuilder'
import BlockPropertiesSetup from '@/components/tools/BlockPropertiesSetup'
import ArrowBuilder from '@/components/tools/ArrowBuilder'
import ArrowVariantSetup from '@/components/tools/ArrowVariantSetup'

import Constructor from '@/components/build/block'
import ArrowModel from '@/components/build/arrow'
import domtoimage from 'dom-to-image'
import { centralizeTextVertically } from '../global'

import Vue from 'vue'

export default {
    name: "Build",
    components: { Canvas, CanvasSizeInput, BlockBuilder, BlockPropertiesSetup, ArrowBuilder, ArrowVariantSetup },
    data: function() {
        return {
            currentEl: null,
            tabIndex: 0,
        }
    },
    computed: {
        selectedEl() {
            return this.$store.state.selected
        },
        isArrowSelected() {
            if(this.currentEl) {
                return this.currentEl.id.toString().includes('to')
            } else {
                return false
            }
        },
        isAnyTyping() {
            return this.$store.state.isAnyTyping
        },
        isMakingArrow() {
            return this.$store.state.arrow.arrowMakerMode.on
        },
    },
    methods: {
        deleteSelection(press) {
            if(press.key === 'Delete' && this.currentEl && !this.isAnyTyping) {
                const id = this.currentEl.id
                if(this.isArrowSelected) {
                    this.$store.dispatch('arrow/deleteArrow', id)
                } else {
                    this.$store.dispatch('block/deleteBlock', id)
                        .then(_ => {
                            this.$store.dispatch('mailer/sendMail', {to: 'canvas', content: `remove:block(${id})`})
                            this.$store.dispatch('arrow/deleteArrowsLinkedToBlock', id)
                        })
                }
                this.$store.dispatch('avaliateSelection', '')
            }
        },
        saveCanvas() {
            this.$store.dispatch('avaliateSelection', '')
            const buildSite = document.querySelector('.canvas')
            domtoimage.toPng(buildSite).then(image => {
                var pom = document.createElement('a');
                pom.setAttribute('href', image);
                pom.setAttribute('download', 'myFlowchart');
                pom.style.display = 'none';
                document.body.appendChild(pom);
                pom.click();
                document.body.removeChild(pom);     
            })
        }
    },
    watch: {
        selectedEl(value) {
            this.currentEl = value ? document.getElementById(value) : ''
            if(value && !this.isArrowSelected) {
                this.tabIndex = 1
            } else {
                this.tabIndex = 0
            }

            if(document.activeElement !== document.querySelector('.arrow-label')[0]) {
                this.$store.commit('changeTyping', false)
            }
        },
    },
    mounted() {
        window.addEventListener('keydown', this.deleteSelection)
    }
}
</script>

<style>

.build {
    grid-area: build;
    display: flex;
    justify-content: space-between;
    flex-direction: row-reverse;
    overflow: hidden;
    height: calc(100vh - 65px);
    width: 100vw;
    padding-left: 340px;

    position: relative;
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
</style>
