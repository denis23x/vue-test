<template>
  <div id="home">
    <div class="home-menu" v-if="bookshelf.length > 0">
      <div class="home-menu-list">
        <div
          :class="['home-menu-list-item', {'active':activeBookshelf.name === shelf.name}]"
          v-for="(shelf, key) in bookshelf"
          :key="key"
          @click="getBooksList(shelf)">{{shelf.name}}</div>
      </div>
      <h1>{{activeBookshelf.name}}</h1>
    </div>
    <div class="home-books">
      <div class="home-books-order" v-if="bookshelf.length > 0">
        <div
          v-show="key === 0 || [1, 2].indexOf(key) !== -1 && activeBookshelf.slug !== 'readed' || key === (orderTypes.length - 1) && activeBookshelf.slug === 'readed'"
          v-for="(type, key) in orderTypes" :key="key"
          @click="setOrder(key === 0 ? (activeBookshelf.slug === 'readed' ? type.value[0] : type.value[1]) : type.value[0])"
          :class="{'active': type.value.indexOf(order.type.replace('-', '')) !== -1}">{{type.title}}
          <span v-if="type.value.indexOf(order.type.replace('-', '')) !== -1">{{order.reverse ? '↓' : '↑'}}</span>
        </div>
      </div>
      <div class="home-books-list" v-if="books && books.objects && books.objects.length > 0">
        <div class="home-books-list-item" v-for="(book, key) in books.objects" :key="key">
          <img class="cover" :src="`http://my-lib.ru/${book.work.cover}`" alt="">
          <div class="title">{{book.work.title}}</div>
          <div class="author">{{book.work.authors_titles}}</div>
          <div class="rating">{{book.work.rating.score}}</div>
        </div>
      </div>
      <div class="home-books-loader" v-if="loader">Загрузка..</div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  name: 'home',
  data () {
    return {
      activeBookshelf: {},
      loader: true,
      hasNext: true,
      currentPage: 1,
      order: {
        reverse: ['-'].indexOf(this.$route.params.order) !== -1,
        type: this.$route.params.order ? this.$route.params.order : '',
      }
    }
  },
  created() {
    const user = parseInt(this.$route.params.user, 10);
    const shelf = this.$route.params.shelf;
    let shelves = [];

    // Get bookshelf menu
    this.getBookshelf({ user: user }).then((response) => {
      shelves = response.body;

      // Add readed menu item
      shelves.push({
        id: response.body.length + 1,
        name: 'Прочитанные книги',
        slug: 'readed',
        user: user
      });

      // Set active bookshelf
      this.activeBookshelf = shelf === 'readed' ? shelves[shelves.length - 1] : shelves[parseInt(shelf, 10) - 1];

      // Save bookshelves
      this.updateBookshelf(shelves);

      // Get books
      this.getBooksList(this.activeBookshelf, this.$route.params.order);
    }).catch((error) => { console.log(error); }); // eslint-disable-line

    // Set event watcher for lazy-load
    window.onscroll = () => {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !this.loader && this.hasNext) {
        this.getBooksList(this.activeBookshelf, this.order.type, this.currentPage += 1)
      }
    }
  },
  computed: {
    ...mapState([
      'bookshelf',
      'books'
    ]),
    orderTypes() {
      return [
        {
          title: 'По дате добавления',
          value: ['id', 'created']
        },
        {
          title: 'По названию',
          value: ['work__default_edition__title']
        },
        {
          title: 'По общему рейтингу',
          value: ['work__rating_score']
        },
        {
          title: 'По оценке',
          value: ['score']
        }
      ]
    }
  },
  methods: {
    ...mapMutations([
      'updateBookshelf',
      'updateBooks'
    ]),
    ...mapActions('api', [
      'getBookshelf',
      'getBooks',
      'getRating'
    ]),
    setOrder(type) {
      const isCurrent = this.order.type === type;

      // Handle order
      this.order.reverse = isCurrent;
      this.order.type = `${isCurrent ? '-' : ''}${type}`;

      // Get books
      this.getBooksList(this.activeBookshelf, this.order.type)
    },
    getBooksList(shelf, order, lazy) {
      const isReaded = shelf.slug === 'readed';

      // Build query
      let query = {};
      query.user = this.$route.params.user;

      // Its readed bookshelf ?
      if (!isReaded) {
        query.bookshelf = shelf.id;
      }

      // Has order ?
      if (order !== undefined && order !== '') {
        query.o = order
      } else {
        this.order.reverse = false;
        this.order.type = '';
      }

      // Its lazy ?
      if (lazy !== undefined) {
        query.page = lazy;
      } else {
        query.page = 1;

        // Clear books
        this.updateBooks({});

        // Set active bookshelf
        this.activeBookshelf = shelf;
        this.$router.push({ name: 'home', params: { shelf: (isReaded ? shelf.slug : shelf.id), order: order } });
      }

      // Get books
      this.loader = true;
      this[isReaded ? 'getRating' : 'getBooks'](query).then((response) => {
        this.loader = false;
        this.hasNext = response.body.has_next;
        this.currentPage = response.body.page;

        // Lazy load handler
        if (query.page === 1) {
          this.updateBooks(response.body)
        } else {
          const tmp = response.body;
          tmp.objects = this.books.objects.concat(response.body.objects);
          this.updateBooks(tmp);
        }
      }).catch((error) => { console.log(error); }) // eslint-disable-line
    },
  }
}
</script>

<style scoped>
#home {
  padding: 20px;
}

.home-menu > h1 {
  margin: 20px 30px;
}

.home-menu-list {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.home-menu-list-item {
  margin: 0 20px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
}

.home-menu-list-item.active {
  background: #ffd400;
}

.home-books {
  position: relative;
}

.home-books-order {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 2px solid #f6f6f6;
  margin: 0 -20px;
  padding: 0 30px;
}

.home-books-order > div {
  padding: 10px;
  cursor: pointer;
  user-select: none;
  margin: 0 10px;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.home-books-order > div.active {
  background: #f6f6f6;
}

.home-books-list {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
}

.home-books-list-item {
  width: 100%;
  max-width: calc(25% - 80px);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  text-align: center;
  padding: 20px;
  margin: 20px;
  position: relative;
  border-radius: 6px;
}

.home-books-list-item:hover {
  background: #f6f6f6;
}

.home-books-list-item > .cover {
  display: block;
  max-height: 150px;
  margin: 0 0 20px 0;
}

.home-books-list-item > .title {
  color: #5aa1c7;
}

.home-books-list-item > .author {
  color: #828fa1;
  font-size: 12px;
  margin: 8px 0;
}

.home-books-loader {
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 20px 0 0 0;
}
</style>
