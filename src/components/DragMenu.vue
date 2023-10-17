<template>
  <div class="menu" :style="`top: ${initialTop + menuMoveConfig.y}px; left: ${initialLeft + menuMoveConfig.x}px;`+  basicStyle">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'DragMenu',
  props: [ 'width', 'bgcColor', 'top', 'left' ],
  data () {
    return {
      initialTop: this.top ? Number(this.top) : 150,
      initialLeft: this.left ? Number(this.left) : 100,
      style: {
        width: Number(this.width) || 400,
        'background-color': this.bgcColor || 'transparent'
      },
      menuMoveConfig: {
        display: false,
        move: false,
        x: 0,
        y: 0,
        downX: 0,
        downY: 0,
        moveX: 0,
        moveY: 0
      }
    }
  },
  computed: {
    basicStyle() {
      let styleStr = ''
      const style = this.style
      for (const [key, value] of Object.entries(style)) {
        let unit = typeof value === 'number' ? 'px' : ''
        styleStr += `${key}: ${value}${unit};`
      }
      return styleStr
    }
},
  methods: {
    mouseDrag (e) {
      const config = this.menuMoveConfig
      if (!config.move) return
      const tmpX = config.moveX + e.pageX - config.downX
      const tmpY = config.moveY + e.pageY - config.downY
      config.x = tmpX < -this.initialLeft ? -this.initialLeft : tmpX
      config.y = tmpY < -this.initialTop ? -this.initialTop : tmpY
    }
  },
  mounted () {
    const dragDom = document.querySelector('#drag')
    dragDom.addEventListener('mousedown', e => {
      const config = this.menuMoveConfig
      config.move = true
      config.downX = e.pageX
      config.downY = e.pageY
      addEventListener('mousemove', this.mouseDrag)
    })
    addEventListener('mouseup', () => {
      const config = this.menuMoveConfig
      if (config.move) {
        config.move = false
        config.moveX = config.x
        config.moveY = config.y
        removeEventListener('mousemove', this.mouseDrag)
      }
    })
  }
}
</script>

<style scoped lang="scss">
.menu {
  position: absolute;
  z-index: 999;
  box-shadow: 0 0 10px 5px rgba(0, 0, 0, .2);
  #drag {
    cursor: grab;
  }
}
</style>