export function buildArrow (id, from, to) {

    const missRange = 20;
    const arrowEl = document.getElementById(id);
    const toolsPanelWidth = document.getElementsByClassName('tools')[0].getBoundingClientRect().width

    function getMiddlePoint(el) {
        const left = el.getBoundingClientRect().left + window.scrollX
        const top = el.getBoundingClientRect().top + window.scrollY
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
    
        arrowEl.style.left = `${Math.min(to.xPos, from.xPos) - missRange - toolsPanelWidth}px`
        arrowEl.style.top = `${Math.min(to.yPos, from.yPos) - missRange - 65}px`
    }

    const fromEl = document.getElementById(from)
    const toEl = document.getElementById(to)

    const fromPoint = getMiddlePoint(fromEl)
    const toPoint = getMiddlePoint(toEl)

    setOuterSize(fromPoint, toPoint)
}

export function centralizeTextVertically(el, target = '.real-text') {
    const text = el.querySelector(target)
    const shape = el.querySelector('.shape')
    if(text) {
        const padding = (shape.getBoundingClientRect().height - 2*parseFloat(getComputedStyle(shape).borderWidth)
        - text.getBoundingClientRect().height + parseFloat(getComputedStyle(text).paddingTop))/2;                    
        el.querySelector('.real-text').style.paddingTop = `${Math.max(0, padding)}px`;
    }
}

function rgbToHex(rgb) {
    rgb = rgb.split('rgb(').join('').split(')').join('').split(', ')
    var hex = rgb.map(v => {
        let hv = Number(v).toString(16);
        if (hv.length < 2) {
            hv = "0" + hv;
        }
        return hv
    })
    return "#" + hex.join('');
}

export default {buildArrow, centralizeTextVertically}