const SHAPE_STATUS = {
    DEFAULT: 0, // shown
    ACTIVE: 1, // selected
    DISABLED: 2, // cannot be put on the grid
    HIDDEN: 3 // 
}


const SQUARE_STATUS = {
    EMPTY: 0,
    BLOCKED: 1,
    ACTIVE: 2,
    DISABLED: 3,
    HOVERED: 4,
    INFO: 5 // square can be eliminated when hovered
  }

export {SHAPE_STATUS, SQUARE_STATUS}