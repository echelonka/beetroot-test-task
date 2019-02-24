<template>
    <section class="sidebar">
        <h1>Causes of Crime</h1>
        <transition-group name="slide-fade">
            <div class="sidebar__text" v-for="node in chosenNodes" :key="node.index">
                <h4>{{node.id}}</h4>
                <p>{{node.text}}</p>
            </div>
        </transition-group>
    </section>
</template>

<script>
    import {mapState} from 'vuex'

    export default {
        name: 'Sidebar',

        computed: mapState({
            chosenNodes: state => state.chosenNodes
        })
    }
</script>

<style scoped lang="sass">
    @import '../sass/base/variables'

    .sidebar
        width: 100%
        min-height: calc(100vh - 90px)
        background-color: #1c233c

        &__text
            max-height: calc(100vh - 90px)
            overflow-y: auto
            padding: 0 30px
            color: $bluish
            p
                color: #464e6a

    .slide-fade
        &-enter-active, &-leave-active
            transition: opacity .3s ease, transform .3s ease
        &-enter, &-leave-to
            transform: translateX(10px)
            opacity: 0
</style>
