<template>
  <div id="app">
    <!-- <div id="nav"> -->
      ceshi
     {{this.$store.state.count}}
    {{this.$store.getters.newCount}}
    {{this.$store.state.a.b.count}}
    <button @click="change">add</button>
    <!-- </div> -->
    <!-- <router-view/> -->
  </div>
</template>
<script>
export default {
  name: 'app',
  data() {
    return {
    };
  },
  mounted() {
    console.log(this.$store.state, '+++++++');
  },
  methods: {
    change() {
      this.$store.dispatch('change');
    },
  },
};
</script>
<style lang="stylus">

</style>
