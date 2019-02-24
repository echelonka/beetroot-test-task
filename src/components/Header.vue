<template>
    <header class="header">
        <img src="../assets/logo.png" alt="SparkBeyound" class="header__logo">
        <div class="header__title">test task</div>
    </header>
</template>

<script>
    export default {
        name: 'Header'
    }
</script>

<style scoped lang="sass">
    @import '../sass/base/variables'

    .header
        padding: 30px
        display: flex
        align-items: center
        color: $gray
        background-color: #28304b

        &__logo
            margin: 0 10px 0 0
        &__title
            text-transform: uppercase
            font-weight: bold
</style>
