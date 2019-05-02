<template>
  <section class="container">
    <div>
      <logo />
      <h1 class="title">
        try
      </h1>
      <h2 class="subtitle">
        My prime Nuxt.js project
      </h2>
      <div class="links">
        <router-link
          v-for="post in posts"
          :key="post.id"
          :to="{name: 'posts-id', params: {id: post.id}}"
          target="_blank"
          class="button--grey"
        >{{post.title}}</router-link>
      </div>
    </div>
  </section>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  },
  head() {
    return {
      title: "Home Page"
    }
  },
  computed: {
    posts() {
      return this.$store.state.posts.all
    }
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  padding: 50px;
  /* min-height: 100vh; */
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
