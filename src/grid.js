export default {
    fromArray(template, array) {
        let p = 0
        let grid = []
        for(let r = 0; r < template.length; r++) {
            for(let c = 0; c < template[r].length; c++) {
                if(p >= array.length) {
                    break
                }
                if(grid[r] === undefined) {
                    grid[r] = []
                }
                grid[r][c] = array[p]
                p += 1
            }
        }
        return grid
    },

    count(grid) {
        let count = 0
        for(let r = 0; r < grid.length; r++) {
            for(let c = 0; c < grid[r].length; c++) {
                count++
            }
        }
        return count
    }
}