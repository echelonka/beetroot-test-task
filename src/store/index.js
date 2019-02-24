import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        data: {},
        chosenNodes: []
    },

    actions: {
    },

    mutations: {
        setData: (state, data) => state.data = data,

        setNodes: (state, node) => {
            if (!state.chosenNodes[0]) {
                state.chosenNodes = [node]
            } else if (!state.chosenNodes[1]) {
                state.chosenNodes = [state.chosenNodes[0], node]
            }
        },

        clearNodes: state => state.chosenNodes = []
    }
})
