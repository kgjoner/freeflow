<template>
    <div class="block-builder ml-1 mr-4">
        <div v-for="(type, index) in blockTypes" :key="index">
            <button :class="[`${type}-tool`, {'mr-2': type=='data'}, 
                {'mr-3': type=='delay'}, {'mr-4': type=='connector'}]"
                @mousedown="e => triggerBlockCreatingEvents(e, type)"
                :disabled="isMakingArrow"></button>
            <p :class="`label-${type}`">{{type.charAt(0).toUpperCase() + type.slice(1)}}</p>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'BlockBuilder',
    data: function() {
        return {
            blockTypes: [
                'terminator',
                'data',
                'process',
                'decision',
                'connector',
                'delay'
            ]
        }
    },
    computed: {
        ...mapState('arrow', {
            isMakingArrow: state => state.arrowMakerMode.on
        })
    },
    methods: {
        triggerBlockCreatingEvents(e, shape) {
            const centerPos = {
                x: e.pageX,
                y: e.pageY
            }
            this.$store.dispatch('block/prepBlockToAdd', {shape, copyId: null, centerPos})
        }
    }
}
</script>

<style>
.tools .block-builder {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    max-width: 100%;
    margin-top: 35px;
}

.tools .block-builder button {
    border: 1px solid var(--theme-color-1);
    width: 70px;
    height: 35px;
    background-color: transparent;
    outline: none;
    cursor: grab;
    margin-bottom: 10px;
}

.tools .block-builder button[disabled='disabled'] {
    border-color: #fcfcfc50;
    cursor: default;
}

.tools .block-builder p {
    position: relative;
    text-align: center;
    font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    color:#fcfcfcaa;
}

.tools .block-builder .label-decision {
    left: -7px;
}

.tools .block-builder .label-connector {
    left: -10px;
}

.tools .block-builder .label-delay {
    left: -7px;
}

.tools .block-builder button.terminator-tool {
    border-radius: 20px;
    width: 80px;
}

.tools .block-builder button.data-tool {
    margin-left: 6px;
    width: 65px;
    transform: skewX(-20deg);
}

.tools .block-builder button.decision-tool {
    margin-left: 22px;
    margin-right: 35px;
    height: 40px;
    width: 40px;
    transform: rotate(-45deg) skew(20deg, 20deg);
}

.tools .block-builder button.connector-tool {
    height: 40px;
    width: 40px;
    border-radius: 50%;
}

.tools .block-builder button.delay-tool {
    height: 40px;
    width: 40px;
    border-top-right-radius: 50%;
    border-bottom-right-radius: 50%;
}
</style>