<template>
    <div class="graph">
        <div class="graph__controls">
            <button @click="clearSelection" class="graph__button">Clear Selection</button>
            <button @click="addNodePopup = !addNodePopup" class="graph__button">Add Node</button>
        </div>
        <transition name="fade">
            <div class="graph__add-popup" v-if="addNodePopup">
                <div class="form-group">
                    <label for="node-name">
                        Name:
                        <input type="text" id="node-name" v-model="newNodeName">
                    </label>
                </div>
                <div class="form-group">
                    <label for="target">
                        To:
                        <select name="target" id="target" v-model="target">
                            <option :value="node.id" v-for="node in nodes" :key="node.id">{{node.id}}</option>
                        </select>
                    </label>
                </div>
                <div class="form-group">
                    <label for="target">
                        Connection Type:
                        <select name="group" id="group" v-model="group">
                            <option :value="group.id" v-for="group in groupTypes" :key="group.id">{{group.name}}</option>
                        </select>
                    </label>
                </div>
                <div class="form-group" v-if="error">{{error}}</div>
                <button @click="addNode" class="graph__button">Add</button>
            </div>
        </transition>
        <svg class="graph__container" ref="canvas"></svg>
    </div>
</template>

<script>
    import * as d3 from 'd3'
    import {mapState} from 'vuex'

    export default {
        name: 'Graph',

        data: () => ({
            addNodePopup: false,
            canvas: {},
            circles: [],
            color: d3.scaleOrdinal(d3.schemeAccent),
            group: '',
            groupTypes: [
                {
                    id: 1,
                    name: 'Simple'
                },
                {
                    id: 2,
                    name: 'Cause'
                }
            ],
            error: '',
            height: 600,
            labels: [],
            link: {},
            newNodeName: '',
            node: {},
            simulation: {},
            target: '',
            width: 1024
        }),

        methods: {
            dragstarted(d) {
                if (!d3.event.active) this.simulation.alphaTarget(0.3).restart()
                d.fx = d.x
                d.fy = d.y
            },

            dragged: d => {
                d.fx = d3.event.x
                d.fy = d3.event.y
            },

            dragended(d) {
                if (!d3.event.active) this.simulation.alphaTarget(0)
                d.fx = null
                d.fy = null
            },

            ticked() {
                this.link
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y)

                this.node.attr('transform', d => `translate(${d.x}, ${d.y})`)
            },

            selectNode(node) {
                this.$store.commit('setNodes', node)

                d3.selectAll('.circle')
                    .attr('class', d => {
                        return `circle ${this.chosenNodes.some(node => node.index === d.index) ? 'circle--selected': ''}`
                    })
            },

            clearSelection() {
                this.$store.commit('clearNodes')
                d3.selectAll('.circle--selected').attr('class', 'circle')
            },

            addNode() {
                this.error = ''

                if (this.newNodeName && this.target && this.group) {
                    this.nodes.push({id: this.newNodeName, group: 2})
                    this.links.push({source: this.newNodeName, target: this.target, value: this.group})
                    this.restartSimulation()
                    this.addNodePopup = false
                    this.newNodeName = ''
                    this.target = ''
                    this.group = ''
                } else {
                    this.error = 'Fill all the fields'
                }
            },

            restartSimulation() {
                // Apply the general update pattern to the links.
                this.link = this.link.data(this.links, d => `${d.source.id}-${d.target.id}`)
                this.link.exit().remove()
                this.link = this.link
                    .join('line')
                    .attr('class', 'link')
                    .attr('stroke-width', 1)
                    .attr('stroke-dasharray', d => {
                        if (d.value === 2) return '5'
                        else return false
                    })
                    .attr('marker-end','url(#arrowhead)')
                // Apply the general update pattern to the nodes.
                this.node = this.node.data(this.nodes, d => d.id)
                this.node.exit().remove()
                this.node = this.node
                    .join('g')
                    .call(d3.drag()
                        .on('start', this.dragstarted)
                        .on('drag', this.dragged)
                        .on('end', this.dragended))

                this.circles = this.node.append('circle')
                    .attr('class', 'circle')
                    .attr('stroke', d => this.color(d.group))
                    .attr('stroke-width', d => d.group >= 2 ? 7 : 10)
                    .attr('r', d => d.group < 2 ? 10 : 5)
                    .attr('fill', d => this.color(d.group))
                    .on('click', this.selectNode)

                this.labels = this.node.append('text')
                    .text(d => d.id)
                    .attr('x', 5)
                    .attr('y', -10)
                    .attr('font-size', d => d.group < 2 ? 18 : 14)
                    .attr('fill', d => d.group < 2 ? '#c2c2c2' : '#8a94ac')
                    .style('pointer-events', 'none')
                // Update and restart the simulation.
                this.simulation.nodes(this.nodes)
                this.simulation.force('link').links(this.links)
                this.simulation.alpha(1).restart()
            }
        },

        computed: mapState({
            data: state => state.data,
            chosenNodes: state => state.chosenNodes,
            links: state => state.data.links.map(d => Object.create(d)),
            nodes: state => state.data.nodes.map(d => Object.create(d))
        }),

        mounted() {
            this.canvas = d3.select(this.$refs.canvas)

            this.canvas.append('defs').append('marker')
                .attr('id', 'arrowhead')
                .attr('viewBox', '-0 -5 10 10')
                .attr('refX', 15)
                .attr('refY', 0)
                .attr('orient', 'auto')
                .attr('markerWidth', 10)
                .attr('markerHeight', 10)
                .attr('xoverflow', 'visible')
                .append('svg:path')
                .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                .attr('fill', '#383d52')
                .style('stroke','none')

            this.simulation = d3.forceSimulation(this.nodes)
                .force('charge', d3.forceManyBody())
                .force('link', d3.forceLink(this.links).id(d => d.id).distance(200).strength(0.25))
                .force('center', d3.forceCenter(this.$refs.canvas.clientWidth / 2 - 50, this.$refs.canvas.clientHeight / 2))
                .alphaTarget(1)
                .on('tick', this.ticked)

            this.link = this.canvas.append('g')
                .attr('class', 'links')
                .attr('stroke', '#383d52')
                .selectAll('.links')

            this.node = this.canvas.append('g')
                .attr('class', 'nodes')
                .selectAll('.node')

            this.restartSimulation()
        }
    }
</script>

<style scoped lang="sass">
    @import '../sass/base/variables'

    .graph
        position: relative
        &__container
            width: 100%
            height: 680px
        &__controls
            padding: 20px 30px 0
        &__button
            margin: 0 5px
            padding: 5px 10px
            box-sizing: border-box
            font-family: 'Avenir', Helvetica, Arial, sans-serif
            color: #96a2bd
            font-size: 14px
            border: 1px solid
            border-radius: 3px
            background-color: transparent
            cursor: pointer
            -webkit-appearance: none
            outline: none
            transition: background-color $transition, color $transition
            &:hover
                background-color: #96a2bd
                color: #15182b
        &__add-popup
            max-width: 300px
            box-sizing: border-box
            top: 60px
            left: 100px
            padding: 30px
            border-radius: 5px
            color: #96a2bd
            position: absolute
            background-color: #1c233c

    .fade
        &-enter-active, &-leave-active
            transition: opacity $transition, transform $transition
        &-enter, &-leave-to
            transform: translateY(20px)
            opacity: 0
</style>
