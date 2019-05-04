<template>
    <ul class="navbar">
        <!-- <li ref="home"><nuxt-link to="/">Home</nuxt-link></li> -->
        <!-- <li ref="posts"><nuxt-link to="/posts/1">Post</nuxt-link></li> -->
        <li ref="build"><nuxt-link to="/">
            <span>Free Flow</span></nuxt-link></li>
    </ul>
</template>

<script>
export default {
    name: 'Navbar',
    data: function() {
        return {
            isCanvas: false,
        }
    },
    computed: {
        active() {
            const ref = this.$route.fullPath.match(/(\/)(\w+)(\/?)/)
            if (!ref) {
                return 'build'
            } else {
                return ref[2]
            }
        }
    },
    // watch: {
    //     $route(to, from) {
    //         const ref = from.fullPath.match(/(\/)(\w+)(\/?)/)
    //         if (!ref) {
    //             this.$refs.home.classList.remove('active')
    //         } else {
    //             this.$refs[ref[2]].classList.remove('active')
    //         }
    //         this.$refs[this.active].classList.add('active')
    //     }
    // },
    mounted() {
        this.$refs[this.active].classList.add('active')
    }
}
</script>

<style>

.navbar {
    display: flex;
    justify-content: flex-end;
    background: rgb(196, 196, 196);
    margin-bottom: 0;
    padding-top: 0;
    padding-bottom: 0;
    height: 65px;

    position: fixed;
    width: 100vw;
}

.navbar li {
    color: #696969;
    height: 100%;
    padding: 13px 30px;
    text-transform: uppercase;
}

.navbar li:hover, .navbar li.active {
    background: orange;
    color: #f2f2f2;
}

.navbar span {
    font-family: 'Indie Flower', cursive;
    font-size: 1.6rem;
}

</style>
