<template>
  <div class="clear-canvas">
    <button class="clear-canvas-btn" @click="showPopup()">clear</button>
    <div v-if="isPopupActive" class="popup-bg" ref="popupBg">
      <div class="clear-popup">
        <p>You are about to clear the entire canvas. Is that what you really want?</p>
        <div class="popup-buttons">
          <button @click="clearCanvas()">Go ahead</button>
          <button @click="closePopup()">Nevermind</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ClearCanvasBtn",
  data: function() {
    return {
      isPopupActive: false,
    }
  },
  methods: {
    clearCanvas() {
      this.$store.dispatch('mailer/sendMail', {to: 'canvas', content: 'reset' })
      this.closePopup()
    },
    showPopup() {
      this.isPopupActive = true
      setTimeout(() => window.addEventListener('click', this.checkWhetherClickWasOutsidePopup))
    },
    closePopup() {
      this.isPopupActive = false
      window.removeEventListener('click', this.checkWhetherClickWasOutsidePopup)
    },
    checkWhetherClickWasOutsidePopup(e) {
      if(e.target === this.$refs.popupBg) {
        this.closePopup()
      }
    }
  }
}
</script>

<style>
.clear-canvas {
  position: fixed;
  top: 1px;
  left: calc(50vw + 260px);
  height: 65px;
  z-index: 91;

  display: flex;
	justify-content: center;
	align-items: center;
}

.clear-canvas-btn {
  background-color: transparent;
  border: 1px solid #fcfcfc55;
  border-radius: 5px;
  padding: 4px 0;
  height: 37px;
  width: 100px;
  font-size: 0.9rem;
	font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
  letter-spacing: 0.5px;
  color: #fcfcfccc;
}

.clear-canvas-btn:hover {
  border-color: var(--off-tools);
  border-width: 1.5px;
	box-shadow: 0 0 2px 0 var(--off-tools);
}

.popup-bg {
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0,0,0,0.7);
  z-index: 99;
  height: 100vh;
  width: 100vw;

  display: flex;
  justify-content: center;
  align-items: center;
}

.clear-popup {
  width: 400px;
  height: 200px;
  background-color: #e3e4eb;
  border-radius: 5px;
  padding: 30px; 
}

.clear-canvas .clear-popup p {
  color: #797979;
  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
}

.clear-popup .popup-buttons {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
}

.clear-popup .popup-buttons button {
  background-color: var(--off-tools);
  border: none;
  border-radius: 5px;
  padding: 8px 30px;
  font-size: 0.9rem;
	font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
  letter-spacing: 0.5px;
  color: #fcfcfccc;
}

.clear-popup .popup-buttons button:hover {
  background-color: var(--bg-tools);
}
</style>