import Vue from 'vue'

const env = {
  cors: 'https://cors-anywhere.herokuapp.com',
  host: 'http://my-lib.ru',
  api: 'api',
};

export default {
  namespaced: true,
  actions: {
    getBookshelf (e, params) {
      return Vue.http.get(`${env.cors}/${env.host}/${env.api}/userbooks/bookshelf`, { params: params })
    },
    getBooks (e, params) {
      return Vue.http.get(`${env.cors}/${env.host}/${env.api}/userbooks/`, { params: params })
    },
    getRating (e, params) {
      return Vue.http.get(`${env.cors}/${env.host}/${env.api}/rating/`, { params: params })
    },
  }
}
