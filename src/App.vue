<template>
  <div>
    <MagicSquare />
  </div>
</template>

<script>
import MagicSquare from './views/MagicSquare'
export default {
  name: 'App',
  components: {
    MagicSquare
  }
}
</script>

<style>
body {
  margin: 0;
  overflow: hidden;
}

ul {
  margin: 0;
  padding: 0;
}

ul li {
  list-style: none;
}

body,
div,
button,
img {
  user-select: none;
  -webkit-user-drag: none;
}
</style>