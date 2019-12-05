<template>
	<div class="canvas-size">
		<span>canvas</span>
		<b-form-input type="number" id="canvas-width" v-model="canvas.width" 
			:formatter="(value) => checkCanvasSize(value, 'width')" 
			lazy-formatter>
		</b-form-input> 
		x
		<b-form-input type="number" id="canvas-height" v-model="canvas.height" 
			:formatter="(value) => checkCanvasSize(value, 'height')" 
			lazy-formatter>
		</b-form-input>
	</div>
</template>

<script>
export default {
	name: "CanvasSizeInput",
	data: function() {
		return {
			canvas: {
				width: 0,
				height: 0
			}
		}
	},
	computed: {
		storedCanvasWidth() {
			return this.$store.state.canvas.width
		},
		storedCanvasHeight() {
			return this.$store.state.canvas.height
		}
	},
	methods: {
		checkCanvasSize(newSize, dimension) {
			const direction = dimension === 'width'? 'Left' : 'Top'
			const scroll = document.querySelector('.canvas-box')[`scroll${direction}`]
			this.$store.dispatch('canvas/setSize', { dimension, scroll, newSize })
				.then(correctedSize => {
					this.canvas[dimension] = correctedSize
				})
		},
	},
	watch: {
		storedCanvasWidth(newWidth) {
			this.canvas.width = newWidth
		},
		storedCanvasHeight(newHeight) {
			this.canvas.height = newHeight
		}
	},
	mounted() {
		this.$store.dispatch('canvas/defineInitialSize')
			.then(initialSize => this.canvas = initialSize)
	}
}
</script>

<style>
.canvas-size {
	position: fixed;
	top: 15px;
	left: calc(50vw + 20px);
	z-index: 91;

	display: flex;
	justify-content: space-between;
	align-items: center;
}

.canvas-size span {
	font-size: 0.9rem;
	font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
	letter-spacing: 0.5px;
	color: #fcfcfccc;
}

.canvas-size input.form-control {
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
input[type=number]::-webkit-outer-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

.canvas-size input:focus {
	border-color: var(--off-tools);
	border-width: 1.5px;
	box-shadow: 0 0 2px 0 var(--off-tools);
}
</style>