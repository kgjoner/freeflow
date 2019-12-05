export const state = () => ({
	width: 0,
	height: 0,
})

export const mutations = {
	setSize: (state, { dimension, newSize }) => {
		state[dimension] = newSize
	},
}

export const actions = {
	defineInitialSize: ({ commit }) => {
		const width = window.innerWidth - 340
		const height = window.innerHeight - 65
		commit('setSize', { dimension: 'width', newSize: width })
		commit('setSize', { dimension: 'height', newSize: height })
		return { width, height }
	},

	setSize: ({ commit }, { dimension, scroll, newSize }) => {
		const direction = dimension === 'width' ? 'right' : 'bottom'
		const correction = dimension === 'width' ? 340 : 65
		
		const allBlocks = document.querySelectorAll('.block')
		const highestExistingPoint = [...allBlocks].reduce((highest, el) => {
			return Math.max(highest, Math.ceil(el.getBoundingClientRect()[direction] + scroll) - correction)
		}, 0)

		const minimumSize = window[`inner${dimension[0].toUpperCase() + dimension.slice(1)}`] - correction
		newSize = Math.max(newSize || 0, Math.max(minimumSize, highestExistingPoint))
		commit('setSize', { dimension, newSize })
		return newSize
	}
}