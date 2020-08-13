export function storeState(state) {
  const json = JSON.stringify(state)
  localStorage.setItem('freeflow-state', json)
}

export function getState() {
  const json = localStorage.getItem('freeflow-state')
  return JSON.parse(json)
}