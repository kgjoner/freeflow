<template>
    <div class="canvas-box" ref="canvasBox" :key="renderKey">
        <div class="canvas" ref="canvas" :style="`height: ${canvas.height}px; width: ${canvas.width}px;`">
            <div v-show="$store.state.arrow.arrowMakerMode.on" class="making-info" style="left: calc(50vw + 170px - 20px);">From?</div>
            <div v-show="$store.state.arrow.arrowMakerMode.on && $store.state.arrow.arrowMakerMode.from" class="making-info"
                style="left: calc(50vw + 170px - 10.7px);">To?</div>
            <div v-show="$store.state.block.alignmentMode.on" class="making-info" style="left: calc(50vw + 170px - 35.8px);">Align with?</div>
            <h2 v-show="numberOfBlocks == 0">Drag and drop a shape here!</h2>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import BlockModel from '@/components/build/block'
import ArrowModel from '@/components/build/arrow'

import Vue from 'vue'

export default {
    name: "Canvas",
    data: function() {
        return {
            storedId: null,
            renderKey: 0,
        }
    },
    computed: {
        ...mapState({
            canvas: state => state.canvas,
            event: state => state.mailer.canvas,
            toolsPanelWidth: state => state.toolsPanelWidth,
            headerHeight: state => state.headerHeight,
            isLoadingState: state => state.isLoadingState,
            blocks: state => state.block.blocks,
            arrows: state => state.arrow.arrows
        }),
        ...mapGetters({
            numberOfBlocks: 'block/quantity'
        }),
        currentEl() {
            const selected = this.$store.state.selected
            if(selected && document) {
                return document.getElementById(selected)
            } else {
                return ''
            }
        }
    },
    methods: {
        create(whichComponent, propsData) {
            const el = document.createElement('div')
            el.id = 'addHere';
            let parent = this.$refs.canvas
            if(whichComponent === 'block') {
                const isCopy = this.blocks[propsData.index].isCopy
                if(!isCopy && !this.isLoadingState) {
                    parent =  document.querySelector('.build')
                    this.storedId = propsData.index
                    window.addEventListener('mouseup', this.insertToCanvas)
                }
            }
            parent.appendChild(el)
            const Constructor = whichComponent === 'block' ? BlockModel : ArrowModel
            const Component = Vue.extend(Constructor)
            const instance = new Component({ propsData })
            instance.$mount('#addHere')
        },
        insertToCanvas() {
            const isTargetOnCanvas = this.blocks[this.storedId].centerPos.x > this.toolsPanelWidth
            const targetBlock = document.getElementById(this.storedId)
            document.querySelector('.build').removeChild(targetBlock)
            if(isTargetOnCanvas) {
                this.$refs.canvas.appendChild(targetBlock)
            }
            window.removeEventListener('mouseup', this.insertToCanvas)
        },
        removeBlock(id) {
            const blockToRemove = document.getElementById(id)
            this.$refs.canvas.removeChild(blockToRemove);
        },
    },
    watch: {
        event(value) {
            if(!value) return
            if(value.includes('create')) {
                const whichComponent = value.match(/\:(.+)\(/)[1]
                const propsData = {
                    index: value.match(/\((.+)\)/)[1],
                    $store: this.$store
                }
                this.create(whichComponent, propsData)
                
            } else if (value.includes('remove:block')) {
                const id = value.match(/\((.+)\)/)[1]
                this.removeBlock(id)

            } else if (value.includes('drag') && this.currentEl) {
                const data = value.match(/\((.+)\)/)
                const movement = data ? JSON.parse(data[1]) : { x: 1, y: 1 }
                const scrollTop = this.$refs.canvasBox.scrollTop
                const scrollLeft = this.$refs.canvasBox.scrollLeft
                
                if(movement.x > 0 && this.currentEl.getBoundingClientRect().right + scrollLeft 
                    - this.toolsPanelWidth > this.canvas.width) {
                    this.$store.dispatch('canvas/setSize', {dimension: 'width', scroll: scrollLeft})
                } else if (movement.y > 0 && this.currentEl.getBoundingClientRect().bottom + scrollTop 
                    - this.headerHeight > this.canvas.height) {
                    this.$store.dispatch('canvas/setSize', {dimension: 'height', scroll: scrollTop})
                }

                if(movement.x > 0 && this.currentEl.getBoundingClientRect().right > window.innerWidth) {
                    this.$refs.canvasBox.scroll(scrollLeft + 5, scrollTop)
                } else if (movement.y > 0 && this.currentEl.getBoundingClientRect().bottom > innerHeight) {
                    this.$refs.canvasBox.scroll(scrollLeft, scrollTop + 5)
                } else if (movement.x < 0 && this.currentEl.getBoundingClientRect().left < this.toolsPanelWidth &&
                    !this.currentEl.classList.contains('new-piece')) {
                    this.$refs.canvasBox.scroll(scrollLeft - 5, scrollTop)
                } else if (movement.y < 0 && this.currentEl.getBoundingClientRect().top < this.headerHeight) {
                    this.$refs.canvasBox.scroll(scrollLeft, scrollTop - 5)
                }
            } else if(value.includes('load')) {
                const propsData = { $store: this.$store }

                this.blocks.forEach(block => {
                    if(!block || block.event === 'destruction') return
                    propsData.index = block.id
                    this.create('block', propsData)
                })

                this.arrows.forEach((arrow, index) => {
                    if(arrow.status === 'deleted') return
                    propsData.index = index
                    this.create('arrow', propsData)
                })

                this.$store.dispatch('avaliateSelection', '')
                this.$store.dispatch('finishLoadingState')

            } else if(value.includes('reset')) {
                this.blocks.forEach(block => {
                    if(!block || block.event === 'destruction') return
                    this.$store.dispatch('block/deleteBlock', block.id)
                    this.removeBlock(block.id)
                })

                this.arrows.forEach(arrow => {
                    this.$store.dispatch('arrow/alterArrow', {id: arrow.id, alterations: {status: 'destruction'}})
                    this.removeBlock(arrow.id)
                })
                this.renderKey++
                this.$nextTick(() => this.$store.dispatch('resetState'))
            }
            this.$store.dispatch('mailer/clearEvent', 'canvas');
        }
    },
}
</script>

<style>
.canvas-box {
    position: relative;
    overflow-x: scroll; 
}

.canvas {
    flex-grow: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 65px);
    width: calc(100vw - 340px);
    background: transparent;
}

.canvas h2 {
    position: fixed;
    width: 357px;
    left: calc(50vw + 170px - 178px);
    top: calc(50vh + 32px - 19px);
    user-select: none;
}

.canvas .making-info {
    background-color: var(--theme-color-1);
    color: #fcfcfc;
    padding: 5px 10px;
    border-radius: 4px;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    position: fixed;
    top: 75px;
    z-index: 50;
}
</style>