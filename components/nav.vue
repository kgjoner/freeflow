<template>
    <ul class="navbar">
        <li ref="build">
            <nuxt-link to="/"><span>Free Flow</span></nuxt-link>
        </li>
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
    mounted() {
        this.$refs[this.active].classList.add('active')
    }
}
</script>

<style>

.navbar {
    grid-area: header;
    display: flex;
    justify-content: flex-end;
    /* background: rgb(196, 196, 196); */
    background: rgb(150, 150, 150);
    margin-bottom: 0;
    padding-top: 0;
    padding-bottom: 0;
    height: 65px;

    position: fixed;
    width: 100vw;
    z-index: 90;
    user-select: none;
}

.navbar li {
    color: #696969;
    height: 100%;
    padding: 13px 30px;
    text-transform: uppercase;
}

.navbar li:hover, .navbar li.active {
    background: var(--off-tools);
    color: #f2f2f2;
}

.navbar span {
    font-family: 'Indie Flower', cursive;
    font-size: 1.6rem;
}

</style>
