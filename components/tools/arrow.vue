<template>
    <div v-show="!isDeleted" class="arrow" :class="{'selected' : isSelected}" ref="outerBox" :id="id"
    @mousedown="e => select(e)">
        <div class="arrow-body" ref="mode">
            <div class="main-body" ref="mainBody"></div>
            <div class="aditional-body"></div>
            <div class="arrow-head" ref="head"></div>
            <div class="arrow-label" ref="label"
            @mousemove="e => dragLabel(e)" @mousedown="e => selectByLabel(e)">{{label}}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Arrow",
    props: ['id', 'from', 'to', 'label', '$store'],
    data: function() {
        return {
            direction: {
                horizontal: '',
                vertical: ''
            },
            labelPos: {
                x: 0,
                y: 0,
            },
            missRange: 20,
            sizes: {
                fromEl: {
                    height: 0,
                    width: 0,
                },
                toEl: {
                    height: 0,
                    width: 0,
                },
            },
            isDragging: false,
            isDeleted: false,
            trueMode: '1',
        }
    },
    computed: {
        isSelected() {
            return this.$store.state.components.selected === this.id
        },
        mode() {
            this.$refs.mode.getAttribute('kg-mode')
        },
        update() {
            const thisArrow = this.$store.state.components.arrowLib.filter(arrow => arrow[0] === this.from && arrow[1] === this.to)
            return thisArrow[0]? thisArrow[0][2] : null
        },
        height() {
            return parseInt(window.getComputedStyle(this.$refs.outerBox, null).getPropertyValue('height'));
        },
        width() {
            return parseInt(window.getComputedStyle(this.$refs.outerBox, null).getPropertyValue('width'));
        },
        reverseDirection() {
            return {
                horizontal: this.direction.horizontal === 'left'? 'right' : 'left',
                vertical: this.direction.vertical === 'top'? 'bottom' : 'top',
            }
        },
        toolsPanelWidth() {
            const toolsPanel = document.getElementsByClassName('tools')[0]
            return toolsPanel.getBoundingClientRect().width
        }
    },
    methods: {
        select(e) {
            const mode = this.$refs.mode.getAttribute('kg-mode')
            var validClick = false;
            const limits = {
                top: this.$refs.outerBox.getBoundingClientRect().top + this.missRange,
                right: this.$refs.outerBox.getBoundingClientRect().right - this.missRange,
                bottom: this.$refs.outerBox.getBoundingClientRect().bottom - this.missRange,
                left: this.$refs.outerBox.getBoundingClientRect().left + this.missRange
            }
            const height = parseInt(window.getComputedStyle(this.$refs.outerBox, null).getPropertyValue('height'));
            const width = parseInt(window.getComputedStyle(this.$refs.outerBox, null).getPropertyValue('width'));
            if(mode === '1' || mode === `4`) {
                validClick = (limits[this.direction.vertical] - this.missRange < e.clientY 
                    && e.clientY < limits[this.direction.vertical] + this.missRange) ||
                    (limits[this.direction.horizontal] - this.missRange < e.clientX 
                    && e.clientX < limits[this.direction.horizontal] + this.missRange)
            } else if (mode === '2') {
                validClick = (limits.top + height/2 - 2*this.missRange < e.clientY
                    && e.clientY < limits.top + height/2) 
                if(!validClick && e.clientY < limits.top + height/2) {
                    if(this.direction.vertical === 'bottom') {
                        validClick = (limits[this.direction.horizontal] - this.missRange < e.clientX 
                            && e.clientX < limits[this.direction.horizontal] + this.missRange)
                    } else {
                        validClick = (limits[this.reverseDirection.horizontal] - this.missRange < e.clientX 
                            && e.clientX < limits[this.reverseDirection.horizontal] + this.missRange)
                    }
                } else if(!validClick) {
                    if(this.direction.vertical === 'top') {
                        validClick = (limits[this.direction.horizontal] - this.missRange < e.clientX 
                            && e.clientX < limits[this.direction.horizontal] + this.missRange)
                    } else {
                        validClick = (limits[this.reverseDirection.horizontal] - this.missRange < e.clientX 
                            && e.clientX < limits[this.reverseDirection.horizontal] + this.missRange)
                    }
                }
            } else if (mode === '3') {
                validClick = (limits.left + width/2 - 2*this.missRange < e.clientX
                    && e.clientX < limits.left + width/2) 
                if(!validClick && e.clientX < limits.left + width/2) {
                    if(this.direction.horizontal === 'right') {
                        validClick = (limits[this.direction.vertical] - this.missRange < e.clientY 
                            && e.clientY < limits[this.direction.vertical] + this.missRange)
                    } else {
                        validClick = (limits[this.reverseDirection.vertical] - this.missRange < e.clientY 
                            && e.clientY < limits[this.reverseDirection.vertical] + this.missRange)
                    }
                } else if(!validClick) {
                    if(this.direction.horizontal === 'left') {
                        validClick = (limits[this.direction.vertical] - this.missRange < e.clientY 
                            && e.clientY < limits[this.direction.vertical] + this.missRange)
                    } else {
                        validClick = (limits[this.reverseDirection.vertical] - this.missRange < e.clientY 
                            && e.clientY < limits[this.reverseDirection.vertical] + this.missRange)
                    }
                }
            }
            if(validClick) {
                this.$store.commit('components/changeSelection', this.id)
                this.$store.commit('components/emmitEventToArrow', ['any', 'off'])
            } else {
                this.$store.commit('components/changeSelection', '')
                if(typeof this.update === 'string' ) {
                    this.$store.commit('components/emmitEventToArrow', ['any', e])
                } else {
                    this.$store.commit('components/emmitEventToArrow', [this.id, 'off'])
                }
            }
        },
        selectByLabel(e) {
            this.$store.commit('components/changeSelection', this.id)
        },
        buildArrow() {
            const fromEl = document.getElementById(this.from)
            const toEl = document.getElementById(this.to)

            const fromPoint = this.getMiddlePoint(fromEl, 'fromEl')
            const toPoint = this.getMiddlePoint(toEl, 'toEl')

            this.setOuterSize(fromPoint, toPoint)

            this.direction = {
                horizontal: fromPoint.xPos < toPoint.xPos ? 'right' : 'left',
                vertical: fromPoint.yPos < toPoint.yPos ? 'top' : 'bottom'
            }

            this.$refs.mode.setAttribute('kg-mode', '1')
            this.$refs.mainBody.classList.add(`bd-${this.direction.vertical}`)
            this.$refs.mainBody.classList.add(`bd-${this.direction.horizontal}`)
            this.$refs.label.style[this.reverseDirection.horizontal] = `${this.sizes.fromEl.width/2 + 10}px`

            this.checkHeadPosition(1)
        },
        getMiddlePoint(el, computeSize) {
            const left = el.getBoundingClientRect().left + window.scrollX
            const top = el.getBoundingClientRect().top + window.scrollY
            const width = parseInt(window.getComputedStyle(el, null).getPropertyValue('width'));
            const height = parseInt(window.getComputedStyle(el, null).getPropertyValue('height'));

            if(computeSize) {
                this.sizes[computeSize] = {
                    height,
                    width
                }
            }

            return {
                xPos: left + width/2,
                yPos: top + height/2
            }
        },
        setOuterSize(from, to) {
            this.$refs.outerBox.style.width = `${2*this.missRange + Math.max(Math.abs(to.xPos - from.xPos), 2)}px`
            this.$refs.outerBox.style.height = `${2*this.missRange + Math.max(Math.abs(to.yPos - from.yPos), 2)}px`

            this.$refs.outerBox.style.left = `${Math.min(to.xPos, from.xPos) - this.missRange - this.toolsPanelWidth}px`
            this.$refs.outerBox.style.top = `${Math.min(to.yPos, from.yPos) - this.missRange - 65}px`
        },
        setPosition(mode, Xperc = this.labelPos.x, Yperc = this.labelPos.y) {
            const height = parseInt(window.getComputedStyle(this.$refs.mode, null).getPropertyValue('height'));
            const width = parseInt(window.getComputedStyle(this.$refs.mode, null).getPropertyValue('width'));
            var Xpos = Xperc*width;
            var Ypos = Yperc*height;
            const vertical = this.direction.vertical;
            const horizontal = this.direction.horizontal;
            var Xset = '';
            var Yset = '';

            if(width < this.sizes.fromEl.width/2 && mode != 4) {
                Ypos = vertical == 'top' ? Math.max(this.sizes.fromEl.height/2, Ypos) 
                : Math.min(height - this.sizes.fromEl.height/2, Ypos)
                if(vertical != 'top' && (height - this.sizes.fromEl.height/2) == Ypos) {
                    Ypos -= this.$refs.label.offsetHeight
                }
            } else if (width < this.sizes.toEl.width/2 && mode == 4) {
                Ypos = vertical == 'top' ? Math.max(this.sizes.toEl.height/2, Ypos) 
                : Math.min(height - this.sizes.toEl.height/2, Ypos)
                if(vertical != 'top' && (height - this.sizes.toEl.height/2) == Ypos) {
                    Ypos -= this.$refs.label.offsetHeight
                }
            } else if (height < this.sizes.toEl.height/2 && mode !=4) {
                Xpos = horizontal == 'left' ? Math.max(this.sizes.toEl.width/2, Xpos)
                : Math.min(width - this.sizes.toEl.width/2, Xpos)
                if(horizontal != 'left' && (width - this.sizes.toEl.width/2) == Xpos) {
                    Xpos -= this.$refs.label.offsetWidth + 10
                }
            } else if (height < this.sizes.fromEl.height/2 && mode ==4) {
                Xpos = horizontal == 'left' ? Math.max(this.sizes.fromEl.width/2, Xpos)
                : Math.min(width - this.sizes.fromEl.width/2, Xpos)
                if(horizontal != 'left' && (width - this.sizes.fromEl.width/2) == Xpos) {
                    Xpos -= this.$refs.label.offsetWidth + 10
                }
            }

            if(mode == 1) {
                const Ylim = vertical == 'top' ? 10 : height - 40
                if(Ypos < Ylim) {
                    Xset = vertical == 'top' ? (horizontal == 'right' ? Math.max(Xpos, this.sizes.fromEl.width/2 + 10) 
                        : Math.max(width - Xpos - this.$refs.label.offsetWidth, this.sizes.fromEl.width/2 + 10)) : width + 10
                    Yset = vertical == 'top' ? -26 : Math.min(height - Ypos - this.$refs.label.offsetHeight, height - this.sizes.toEl.height/2 - 30)
                } else {
                    Xset = vertical == 'top' ? width + 10 : (horizontal == 'right' ? Math.max(Xpos, this.sizes.fromEl.width/2 + 10) 
                        : Math.max(width - Xpos - this.$refs.label.offsetWidth, this.sizes.fromEl.width/2 + 10))
                    Yset = vertical == 'top' ? Math.min(Ypos, height - this.sizes.toEl.height/2 - 30) : 0
                }
            } else if (mode == 2) {
                const Ylim = [height/2 - this.$refs.label.offsetHeight - 10, height/2 + 10]
                if(Ypos > Ylim[0] && Ypos< Ylim[1]) {
                    Xset = horizontal == "right" ? Xpos : width - Xpos - this.$refs.label.offsetWidth
                    Yset = vertical == 'top' ? height/2 - this.$refs.label.offsetHeight : height/2
                } else if(Ypos < Ylim[0]) {
                    Xset = vertical == 'top' ? - 10 - this.$refs.label.offsetWidth : width + 10
                    Yset = vertical == 'top' ? Math.max(Ypos, this.sizes.fromEl.height/2) 
                        : Math.min(height - Ypos - this.$refs.label.offsetHeight, height - this.sizes.toEl.height/2 - this.$refs.label.offsetHeight)
                } else {
                    Xset = vertical == 'top' ? width + 10 : -10 - this.$refs.label.offsetWidth 
                    Yset = vertical == 'top' ? Math.min(Ypos, height - this.sizes.toEl.height/2 - this.$refs.label.offsetHeight) 
                        : Math.max(height - Ypos - this.$refs.label.offsetHeight, this.sizes.fromEl.height/2)
                }
            } else if (mode == 3) {
                const Xlim = horizontal == 'right' ? [width/2 - 10, width/2 + this.$refs.label.offsetWidth] : [width/2 - this.$refs.label.offsetWidth - 10, width/2 + 10]
                if(Xpos > Xlim[0] && Xpos < Xlim[1]) {
                    Xset = width/2 + 10
                    Yset = vertical == 'top' ? Math.min(Ypos, height - this.$refs.label.offsetHeight) : height - Ypos - this.$refs.label.offsetHeight
                } else if(Xpos < Xlim[0]) {
                    Xset = horizontal == 'right' ? Math.max(Xpos, this.sizes.fromEl.width/2 + 10) 
                        : Math.min(width - Xpos - this.$refs.label.offsetWidth, width - this.sizes.toEl.width/2 - this.$refs.label.offsetWidth - 10) 
                    Yset = horizontal == 'right' ? (vertical == 'top' ? -26 : 0) : height - this.$refs.label.offsetHeight
                } else {
                    Xset = horizontal == 'right' ? Math.min(Xpos, width - this.sizes.toEl.width/2 - this.$refs.label.offsetWidth - 10) 
                        : Math.max(width - Xpos - this.$refs.label.offsetWidth, this.sizes.fromEl.width/2 + 10)
                    Yset = horizontal == 'right' ? height - this.$refs.label.offsetHeight : (vertical == 'top' ? -26 : 0)
                }
            } else if (mode == 4) {
                const Ylim = vertical == 'top' ? 10 : height - 40
                if(Ypos < Ylim) {
                    Xset = vertical == 'top' ? (horizontal == 'right' ? Math.max(Xpos, this.sizes.toEl.width/2 + 10) 
                        : Math.max(width - Xpos - this.$refs.label.offsetWidth, this.sizes.toEl.width/2 + 10)) : width + 10
                    Yset = vertical == 'top' ? -26 : Math.min(height - Ypos - this.$refs.label.offsetHeight, height - this.sizes.fromEl.height/2 - 30)
                } else {
                    Xset = vertical == 'top' ? width + 10 : (horizontal == 'right' ? Math.max(Xpos, this.sizes.toEl.width/2 + 10) 
                        : Math.max(width - Xpos - this.$refs.label.offsetWidth, this.sizes.toEl.width/2 + 10))
                    Yset = vertical == 'top' ? Math.min(Ypos, height - this.sizes.fromEl.height/2 - 30) : 0
                }
            }

            this.$refs.label.style[this.direction.vertical] = `${Yset}px`;
            this.$refs.label.style[this.direction.horizontal] = `auto`;
            this.$refs.label.style[this.reverseDirection.vertical] = `auto`
            this.$refs.label.style[this.reverseDirection.horizontal] = `${Xset}px`

            return mode
        },
        dragLabel(e) {
            if(e.buttons && this.isSelected) {
                this.isDragging = true;
                const Ypos = `${e.clientY - this.$refs.label.offsetHeight/2 - this.$refs.mode.getBoundingClientRect().top}px`
                const Xpos = `${e.clientX - this.$refs.label.offsetWidth/2  - this.$refs.mode.getBoundingClientRect().left}px`
                this.labelPos.y = Math.min(Math.max(0, parseInt(Ypos)/this.$refs.mode.offsetHeight), 1)
                this.labelPos.x = Math.min(Math.max(0, parseInt(Xpos)/this.$refs.mode.offsetWidth), 1)
                const mode = this.$refs.mode.getAttribute('kg-mode')
                this.setPosition(mode)
            } else if(this.isDragging) {
                this.isDragging = false;
            }
        },
        migrateToWindow(e) {
            if(this.isDragging) {
                this.dragLabel(e)
            }
        },
        checkSelection(e) {
            const interactors = Array.from(document.getElementsByClassName('interactor'))
            if(this.isSelected && interactors.indexOf(e.target) === -1) {
                if((e.clientX > this.$refs.outerBox.getBoundingClientRect().right + 20) ||
                (e.clientX < this.$refs.outerBox.getBoundingClientRect().left - 20) ||
                (e.clientY > this.$refs.outerBox.getBoundingClientRect().bottom + 20) ||
                (e.clientY < this.$refs.outerBox.getBoundingClientRect().top - 20)) {
                    this.$store.commit('components/changeSelection', '')
                    this.$store.commit('components/emmitEventToArrow', [this.id, 'off'])
                } else {
                    this.select(e)
                }
            }
        },
        checkHeadPosition(mode) {
            const height = parseInt(window.getComputedStyle(this.$refs.mode, null).getPropertyValue('height'));

            if(height < this.sizes.toEl.height/2 || mode == 3) {
                const rotate = this.direction.horizontal === 'right' ? '90' : '270';
                this.$refs.head.style.transform = `rotate(${rotate}deg)`;
                this.$refs.head.style[this.reverseDirection.vertical] = `-7px`;
                this.$refs.head.style[this.direction.horizontal] = `${this.sizes.toEl.width/2 - 5}px`;
            } else {
                const rotate = this.direction.vertical === 'top' ? '180' : '0';
                this.$refs.head.style.transform = `rotate(${rotate}deg)`;
                this.$refs.head.style[this.reverseDirection.vertical] = `${this.sizes.toEl.height/2 - 10}px`;
                this.$refs.head.style[this.direction.horizontal] = '-4px';
            }
            this.$refs.head.style[this.direction.vertical] = 'auto';
            this.$refs.head.style[this.reverseDirection.horizontal] = 'auto';

            if(mode == 4) {
                const rotate = this.direction.horizontal === 'left' ? '90' : '270';
                this.$refs.head.style.transform = `rotate(${rotate}deg)`;
                this.$refs.head.style[this.direction.vertical] = `-7px`;
                this.$refs.head.style[this.reverseDirection.horizontal] = `${this.sizes.toEl.width/2 - 5}px`;
                this.$refs.head.style[this.reverseDirection.vertical] = 'auto';
                this.$refs.head.style[this.direction.horizontal] = 'auto';
            }
        },
        updateDirection(mode) {
            const fromEl = document.getElementById(this.from)
            const toEl = document.getElementById(this.to)

            const fromPoint = this.getMiddlePoint(fromEl)
            const toPoint = this.getMiddlePoint(toEl)

            const newHor = fromPoint.xPos < toPoint.xPos ? 
                mode == 4? 'left' : 'right'
                : mode == 4? 'right' : 'left';
            const newVer = fromPoint.yPos < toPoint.yPos ? 
                mode == 4? 'bottom' : 'top'
                : mode == 4? 'top' : 'bottom';

            if(newHor != this.direction.horizontal) {
                this.direction.horizontal = newHor;
                this.$refs.mainBody.classList.remove(`bd-${this.reverseDirection.horizontal}`)
                this.$refs.mainBody.classList.add(`bd-${this.direction.horizontal}`)
                this.labelPos.x = 1 - this.labelPos.x;
            } else if(newVer != this.direction.vertical) {
                this.direction.vertical = newVer;
                this.$refs.mainBody.classList.remove(`bd-${this.reverseDirection.vertical}`)
                this.$refs.mainBody.classList.add(`bd-${this.direction.vertical}`)
                this.labelPos.y = 1 - this.labelPos.y;
            }

            return mode
        },
        updateSizes() {
            const fromEl = document.getElementById(this.from)
            const toEl = document.getElementById(this.to)

            const points = [[fromEl, 'fromEl'], [toEl, 'toEl']]
            points.map(el => {
                this.sizes[el[1]] = {
                    height: parseInt(window.getComputedStyle(el[0], null).getPropertyValue('height')),
                    width: parseInt(window.getComputedStyle(el[0], null).getPropertyValue('width'))
                }
            })
        },
        whetherStraightArrows(mode) {
            const height = parseInt(window.getComputedStyle(this.$refs.mode, null).getPropertyValue('height'));
            const width = parseInt(window.getComputedStyle(this.$refs.mode, null).getPropertyValue('width'));

            if ((width < this.sizes.toEl.width/2 && mode == 4) 
             || (width < this.sizes.toEl.width/2 && mode == 3) 
             || (width < 20 && mode == 2)) {
                this.$refs.mode.setAttribute('kg-mode', '1')
                mode = 1;
            } else if ((height < this.sizes.toEl.height/2 && mode == 1)
             || (height < this.sizes.toEl.height/2 && mode == 2)  
             || (height < 20 && mode == 3)) {
                this.$refs.mode.setAttribute('kg-mode', '4')
                mode = 4;
            } else if ((height > this.sizes.toEl.height/2 && mode == 4)
             || (width > this.sizes.toEl.width/2 && mode == 1)) {
                this.$refs.mode.setAttribute('kg-mode', this.trueMode)
                mode = this.trueMode
            }

            return mode
        }
    },
    watch: {
        update(value) {
            if(value !== 'off' && value !== 'deleted' && typeof value === 'string') {
                if (value === 'recreated') {
                    this.trueMode = '1'
                    this.isDeleted = false;
                }
                const mode = this.$refs.mode.getAttribute('kg-mode')
                if(value === 'updateMode') this.trueMode = mode
                if(value === 'resize') this.updateSizes()
                this.checkHeadPosition(this.setPosition(this.updateDirection(this.whetherStraightArrows(mode))))
                this.$store.commit('components/emmitEventToArrow', [this.id, 'off'])
                if(value === 'updateMode' || value === 'recreated') this.checkHeadPosition(this.setPosition(this.updateDirection(this.whetherStraightArrows(mode))))
            } else if (typeof value === 'object' && value) {
                this.select(value)
            } else if ( value === 'deleted') {
                this.trueMode = '1';
                this.isDeleted = true;
                this.labelPos = {
                    x: 0,
                    y: 0,
                }
            }
        },
    },
    mounted() {
        this.buildArrow()
        window.addEventListener('click', this.checkSelection)
        window.addEventListener('mousemove', this.migrateToWindow)
    }
}
</script>

<style>
:root {
    --border-color: rgba(27, 27, 27, 1);
    --selected-color: rgb(4, 179, 179);
}

.arrow {
    position: absolute;
    z-index: 0;

    padding: 20px;
}

.arrow-head {
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 15px solid rgba(27, 27, 27, 1);
    height: 0;
    width: 0;

    position: absolute;
    top: 0;
    right: 0;
}

.arrow-body {
    width: 100%;
    height: 100%;
    position: relative;
}

.arrow-body[kg-mode="3"] {
    display: flex;
}

.selected .arrow-body, .selected .main-body, 
.selected .aditional-body {
    border-color: var(--selected-color) !important;
}

.selected .arrow-head {
    border-bottom-color: var(--selected-color) !important;
}

.selected .arrow-label {
    color: var(--selected-color) !important;
}

[kg-mode='1'] .main-body,
[kg-mode='4'] .main-body {
    width: 100%;
    height: 100%;
}

[kg-mode='1'] .main-body.bd-top,
[kg-mode='4'] .main-body.bd-top {
    border-top: 1px solid var(--border-color);
}

[kg-mode='1'] .main-body.bd-right,
[kg-mode='4'] .main-body.bd-right {
    border-right: 1px solid var(--border-color);
}

[kg-mode='1'] .main-body.bd-bottom,
[kg-mode='4'] .main-body.bd-bottom {
    border-bottom: 1px solid var(--border-color);
}

[kg-mode='1'] .main-body.bd-left,
[kg-mode='4'] .main-body.bd-left {
    border-left: 1px solid var(--border-color);
}

[kg-mode='1'] .aditional-body, 
[kg-mode='4'] .aditional-body {
    display: none;
}

[kg-mode="2"] .main-body {
    width: 100%;
    height: 50%;

    border-bottom: 1px solid var(--border-color);
}

[kg-mode="2"] .aditional-body {
    width: 100%;
    height: 50%;
}

[kg-mode="2"] .main-body.bd-left.bd-top,
[kg-mode="2"] .main-body.bd-right.bd-bottom,
[kg-mode="2"] .main-body.bd-right.bd-top ~ .aditional-body,
[kg-mode="2"] .main-body.bd-left.bd-bottom ~ .aditional-body {
    border-right: 1px solid var(--border-color);
}

[kg-mode="2"] .main-body.bd-right.bd-top,
[kg-mode="2"] .main-body.bd-left.bd-bottom,
[kg-mode="2"] .main-body.bd-left.bd-top ~ .aditional-body,
[kg-mode="2"] .main-body.bd-right.bd-bottom ~ .aditional-body {
    border-left: 1px solid var(--border-color);
}

[kg-mode="3"] .main-body {
    width: 50%;
    height: 100%;

    border-right: 1px solid var(--border-color);
}

[kg-mode="3"] .aditional-body {
    width: 50%;
    height: 100%;
}

[kg-mode="3"] .main-body.bd-left.bd-top,
[kg-mode="3"] .main-body.bd-right.bd-bottom,
[kg-mode="3"] .main-body.bd-right.bd-top ~ .aditional-body,
[kg-mode="3"] .main-body.bd-left.bd-bottom ~ .aditional-body {
    border-bottom: 1px solid var(--border-color);
}

[kg-mode="3"] .main-body.bd-right.bd-top,
[kg-mode="3"] .main-body.bd-left.bd-bottom,
[kg-mode="3"] .main-body.bd-left.bd-top ~ .aditional-body,
[kg-mode="3"] .main-body.bd-right.bd-bottom ~ .aditional-body {
    border-top: 1px solid var(--border-color);
}

.arrow .arrow-label {
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
    color: rgba(0,0,0,0.6);
    font-size: 1.1rem;
    font-variant: small-caps;
    text-transform: lowercase;

    position: absolute;
    margin-bottom: 0;
    cursor: move;
    user-select: none;
    -moz-user-select:none;
    -webkit-user-select:none;
}

:not([kg-mode="2"]) .main-body.bd-top ~ .arrow-label {
    top: calc(-1.1rem - 8px);
}

:not([kg-mode="2"]) .main-body.bd-bottom ~ .arrow-label {
    bottom: 2px;
}
</style>
