import Vue from 'vue';
import Vuex from '@/vuex.js';

Vue.use(Vuex); // 调用库里面的install方法

export default new Vuex.Store({
  // 状态分层
  modules: { // 递归
    a: {
      state: {
        count: 200,
      },
      mutations: {
        // eslint-disable-next-line no-unused-vars
        change(state) {
          console.log('xxxx');
          // 发布订阅，所有方法都放在一个数组里面
        },
      },
      modules: {
        b: {
          state: {
            count: 3000,
          },
        },
      },
    },
  },
  state: {
    // 状态
    count: 100,
  },
  getters: {
    // 状态的计算属性
    newCount(state) { // 200
      return state.count + 100;
    },
  },
  mutations: {
    // 同步更新状态
    change(state) {
      state.count += 10;
      // console.log(this.state);
      console.log(this.state.count += 10);
    },
  },
  actions: {
    change({ commit }) {
      setTimeout(() => {
        commit('change');
      }, 1000);
    },
  },
});
