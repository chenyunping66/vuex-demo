/* eslint-disable no-use-before-define */
/* eslint-disable no-underscore-dangle */
let Vue;
class ModuleCollection {
  constructor(options) {
    // vuex []
    this.register([], options);
  }

  register(path, rawModule) {
    // path 是个空数组 rawModule即使个对象
    const newModule = {
      _raw: rawModule, // 对象 当前 有state,getters 那个对象
      _children: {}, // 表示 他包含的模块
      state: rawModule.state, // 自己的模块状态
    };
    if (path.length === 0) {
      this.root = newModule; // 根
    } else {
      // eslint-disable-next-line no-underscore-dangle
      const parent = path.slice(0, -1).reduce((root, current) => root._children[current],
        this.root);
      // eslint-disable-next-line no-underscore-dangle
      parent._children[path[path.length - 1]] = newModule;
    }
    if (rawModule.modules) {
      // eslint-disable-next-line no-use-before-define
      forEach(rawModule.modules, (childName, module) => {
        // [a]
        this.register(path.concat(childName), module);
      });
    }
  }
}
function installModule(store, rootState, path, rootModule) {
  // store 状态  空数组 更模块
  if (path.length > 0) {
    // 第日次获取到的就是a对应的对象
    // eslint-disable-next-line max-len
    const parent = path.slice(0, -1).reduce((root, current) => root[current], rootState); // row, children,state
    // {count:1000,a:{}}
    Vue.set(parent, path[path.length - 1], rootModule.state);
  }
  // eslint-disable-next-line no-undef
  // console.log(modules, '-------------');
  if (rootModule._raw.getters) {
    // eslint-disable-next-line no-underscore-dangle
    forEach(rootModule._raw.getters, (getterName, getterFn) => {
      Object.defineProperty(store.getters, getterName, {
        get: () => getterFn(rootModule.state),
      });
    });
  }
  if (rootModule._raw.actions) {
    // eslint-disable-next-line no-underscore-dangle
    forEach(rootModule._raw.actions, (actionName, actionFn) => {
      // eslint-disable-next-line no-param-reassign
      const entry = store.actions[actionName] || (store.actions[actionName] = []);
      entry.push(() => {
        actionFn.call(store, store);
      });
    });
  }
  // eslint-disable-next-line no-underscore-dangle
  if (rootModule._raw.mutations) {
    // eslint-disable-next-line no-underscore-dangle
    // eslint-disable-next-line no-use-before-define
    forEach(rootModule._raw.mutations, (mutationName, mutationFn) => {
      // eslint-disable-next-line no-param-reassign
      const entry = store.mutations[mutationName] || (store.mutations[mutationName] = []);
      entry.push(() => {
        mutationFn.call(store, rootModule.state);
      });
    });
  }

  // 判断儿子
  forEach(rootModule._children, (childName, module) => {
    installModule(store, rootState, path.concat(childName), module);
  });
}
class Store {
  // state getters mutations actions
  constructor(options) {
    const { state } = options;
    this.getters = {};
    this.mutations = {};
    this.actions = {};
    // console.log(this.s);
    // 什么样的属性可以实现双向 有get和set new Vue({data:{}})

    // vuex核心就是借用了vue的实例 因为vue的实例数据变化 会刷新视图
    // eslint-disable-next-line no-underscore-dangle
    this._vm = new Vue({
      data: {
        state,
      },
    });

    // 把模块之间的关系进行整理
    // root._children => a._children =>b
    this.modules = new ModuleCollection(options);
    // console.log(this.modules);
    // 无论子模块还是孙子 所有的mutation都是根上的
    console.log(this, '----');

    // this是store的实例 [] path this.modules.root当前的根模块
    installModule(this, state, [], this.modules.root); // _row _children

    // 只对根进行处理，还需要对孙子曾孙进行处理
    // if (options.getters) {
    //   const { getters } = options; // {newCount:fn}
    //   // eslint-disable-next-line no-use-before-define
    //   forEach(getters, (getterName, getterFn) => {
    //     Object.defineProperty(this.getters, getterName, {
    //       get: () => getterFn(state),
    //     });
    //   });
    // }
    // // mutation
    // const { mutations } = options;
    // // eslint-disable-next-line no-use-before-define
    // forEach(mutations, (mutationName, mutationFn) => {
    //   // this.mutations.change = () => {change(state)}
    //   this.mutations[mutationName] = () => {
    //     mutationFn.call(this, state);
    //   };
    // });
    // // actions
    // const { actions } = options;
    // // eslint-disable-next-line no-use-before-define
    // forEach(actions, (actionName, actionFn) => {
    //   this.actions[actionName] = () => {
    //     actionFn.call(this, this);
    //   };
    // });

    // eslint-disable-next-line comma-spacing
    const { commit, dispatch } = this; // 拷贝
    this.commit = (type) => {
      commit.call(this, type); // 绑定this指向
    };
    this.dispatch = (type) => {
      dispatch.call(this, type);
    };
  }

  get state() {
    // 类的访问器 Object.defineProperty里面的get同一个意思
    // eslint-disable-next-line no-underscore-dangle
    return this._vm.state;
  }

  commit(type) {
    this.mutations[type].forEach(fn => fn());
  }

  dispatch(type) {
    this.actions[type].forEach(fn => fn());// 绑定this,否则undefiend
  }
}
function forEach(obj, callback) {
  Object.keys(obj).forEach(item => callback(item, obj[item]));
}
const install = (_Vue) => {
  // console.log(_Vue, 'install');
  Vue = _Vue; // 保留vue的构造函数
  Vue.mixin({
    // 给每个组件混合一些东西(方法)
    beforeCreate() {
      // console.log('before create');
      // main.vue  App.vue 所以会走两次，因为所有组件创建之前都会加载beforeCreate
    // 我需要把根组件中 store实例 给每个组件都增加一个$store属性
    // 1. 判断是否是根组件
      if (this.$options && this.$options.store) {
        // console.log(this.$options.store);
        this.$store = this.$options.store;
      } else {
        // 子组件  深度优先 父组件=》子=》孙子
        // console.log(this.$options.name);
        this.$store = this.$parent && this.$parent.$store;
      }
    },
  });
};
export default {
  Store,
  install,
};
