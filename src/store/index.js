import Vue from 'vue'
import Vuex from 'vuex'
import api from './modules/api'

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    api
  },
  state: {
    bookshelf: {},
    books: {}
  },
  getters: {},
  mutations: {
    updateBookshelf (state, data) {
      state.bookshelf = data
    },
    updateBooks (state, data) {
      state.books = data
    },
  },
  actions: {}
})
