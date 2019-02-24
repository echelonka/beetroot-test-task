<template>
    <div id="app">
        <Header/>
        <main class="main">
            <div class="main__grid">
                <Graph/>
                <Sidebar/>
            </div>

        </main>
    </div>
</template>

<script>
    import Header from './components/Header'
    import Graph from './components/Graph'
    import Sidebar from './components/Sidebar'
    import data from './assets/crime'

    export default {
        name: 'app',
        components: {
            Header,
            Graph,
            Sidebar
        },

        beforeCreate() {
            this.$store.commit('setData', data)
        }
    }
</script>

<style lang="sass">
    @import './sass/main.sass'

    .main
        &__grid
            display: grid
            grid-template-columns: 70% 30%
</style>
