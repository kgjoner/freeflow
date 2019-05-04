

export function buildArrow (id, from, to) {

    const missRange = 20;
    const arrowEl = document.getElementById(id);
    const toolsPanelWidth = document.getElementsByClassName('tools')[0].getBoundingClientRect().width

    function getMiddlePoint(el) {
        const left = el.getBoundingClientRect().left
        const top = el.getBoundingClientRect().top
        const width = parseInt(window.getComputedStyle(el, null).getPropertyValue('width'));
        const height = parseInt(window.getComputedStyle(el, null).getPropertyValue('height'));
    
        return {
            xPos: left + width/2,
            yPos: top + height/2
        }
    }

    function setOuterSize(from, to) {
        arrowEl.style.width = `${2*missRange + Math.max(Math.abs(to.xPos - from.xPos), 2)}px`
        arrowEl.style.height = `${2*missRange + Math.max(Math.abs(to.yPos - from.yPos), 2)}px`
    
        arrowEl.style.left = `${Math.min(to.xPos, from.xPos) - missRange - toolsPanelWidth + window.scrollX}px`
        arrowEl.style.top = `${Math.min(to.yPos, from.yPos) - missRange - 65 + window.scrollY}px`
    }

    const fromEl = document.getElementById(from)
    const toEl = document.getElementById(to)

    const fromPoint = getMiddlePoint(fromEl)
    const toPoint = getMiddlePoint(toEl)

    setOuterSize(fromPoint, toPoint)
}

export default {buildArrow}