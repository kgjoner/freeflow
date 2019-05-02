<template>
    <section class="post">
        <article>
            <h1>{{post.title}}</h1>
            <p>{{post.content}}</p>
        </article>
        <aside>
            <h3>Other posts:</h3>
            <ul>
                <li v-for="(post, index) in links" :key="index">
                    <nuxt-link :to="`/posts/${post.id}`">
                        {{post.title}}
                    </nuxt-link>
                </li>
            </ul>
        </aside>
    </section>
</template>

<script>
export default {
    name: "Post",
    head() {
        return {
            title: this.post.title
        }
    },
    computed: {
        post() {
            return this.$store.state.posts.all.find(post => post.id == this.$route.params.id)
        },
        links() {
            return this.$store.state.posts.all.filter(post => post.id != this.$route.params.id)
        }
    }
}
</script>

<style>

.post {
    padding: 100px 50px;
    min-height: calc(100vh - 65px);
    background-color:rgb(36, 43, 58);

    display: flex;
    justify-content: flex-end;
}

.post article {
    flex-grow: 2;
}

.post aside {
    margin-right: 20px;
    min-width: 200px;
}

h1 {
    font-family:'Times New Roman', Times, serif;
    color:orange
}

aside li {
    color:rgb(4, 179, 179);
}
</style>
