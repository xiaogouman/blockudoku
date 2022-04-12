import './App.css';
import React from 'react';
import { SQUARE_STATUS, SHAPE_STATUS } from './constants'
import { ShapeBoard } from './components/ShapeBoard';
import { Board } from './components/Board';
var _ = require('lodash');


// global shapes
const shapes = [
  [[1]], // 1x1 square
  [[1,1],[1,1]], // 2x2 square
  [[1,0],[1,0],[1,1]], // L
  [[0,1],[0,1],[1,1]], // L flipped to left
  [[1,1],[1,0],[1,0]], // L flipped to down
  [[1,1],[0,1],[0,1]], // L flipped to up
  [[1,1]],
  [[1,1,1]],
  [[1,1,1,1]],
  [[1,1,1,1,1]],
  [[1],[1]],
  [[1],[1],[1]],
  [[1],[1],[1],[1]],
  [[1],[1],[1],[1],[1]],
  [[1,0],[1,1]],
  [[0,1],[1,1]],
  [[1,1],[0,1]],
  [[1,1],[1,0]],
  [[1,1,1],[1,0,0],[1,0,0]],
  [[1,1,1],[0,0,1],[0,0,1]],
  [[1,0,0],[1,0,0],[1,1,1]],
  [[0,0,1],[0,0,1],[1,1,1]],
  [[1,0,0],[0,1,0],[0,0,1]],
  [[0,0,1],[0,1,0],[1,0,0]],
  [[0,1],[1,0]],
  [[1,0],[0,1]],
  [[1,0,1],[1,1,1]]
]

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  render() {
    let shapeCandidates = [];
    for (let i=0;i<3;i++) {
      shapeCandidates.push(
        <div class="board">
          <ShapeBoard shapeIdx={i} 
          shape={this.state.nextShapes[i]} 
          onClick={idx => this.handleShapeClick(idx)}
          status={this.state.nextShapeStatus[i]}
          />
        </div>
      )
    }
    return (
      <div className="game">
        <div className="board">
          <span>Score: {this.state.points}</span> 
          <button onClick={() => this.reset()}>Restart</button>
        </div>
        <div className="board">
          <Board
            grid={this.state.grid}
            onClick={gridIdx => this.handleBoardSquareClick(gridIdx)} 
            onMouseEnter={gridIdx => this.handleBoardSquareMouseEnter(gridIdx)}
            />
        </div>
        <div className="board">{shapeCandidates}</div>
      </div>
    )
  }

  getInitialState() {
    return {
      grid: Array(81).fill(SQUARE_STATUS.EMPTY),
      gridPrev: Array(81).fill(SQUARE_STATUS.EMPTY),
      nextShapes: this.generateNextShapes(),
      selectedShapeIdx: -1,
      nextShapeStatus: Array(3).fill(SHAPE_STATUS.DEFAULT),
      points: 0
    }
  }

  handleBoardSquareMouseEnter(gridIdx) {
    let grid = this.state.gridPrev.slice();
    let activeShapeId = this.state.selectedShapeIdx;
    if (activeShapeId !== -1) {
      this.clearHover(grid);
      if (this.canPutShape(grid, gridIdx, this.state.nextShapes[activeShapeId])) {
        this.putShape(grid, gridIdx, SQUARE_STATUS.HOVERED);
        console.log("eliminate squares in preview")
        this.eliminateSquares(grid, SQUARE_STATUS.INFO);
      }
    }
    this.setState({
      grid: grid
    })
  }
  
  clearHover(grid) {
    // clear existing hovered squares first
    for (let i=0;i<grid.length;i++) {
      if (grid[i] === SQUARE_STATUS.HOVERED) {
        grid[i] = SQUARE_STATUS.EMPTY;
      }
    }
  }
  

  handleBoardSquareClick(gridIdx) {
    let grid = this.state.grid.slice();
    let activeShapeId = this.state.selectedShapeIdx;
    let nextShapes = _.cloneDeep(this.state.nextShapes);
    let nextShapeStatus = this.state.nextShapeStatus;

    if (activeShapeId === -1) {
      // no selected shape, do nothing
      return;
    }
    if (!this.canPutShape(grid, gridIdx, nextShapes[activeShapeId])) {
      return;
    }

    // put the shape on the board
    this.putShape(grid, gridIdx, SQUARE_STATUS.BLOCKED);

    // if all shapes are hidden, generate new shapes
    nextShapeStatus[activeShapeId] = SHAPE_STATUS.HIDDEN;
    if ( nextShapeStatus[0] === SHAPE_STATUS.HIDDEN && nextShapeStatus[1] === SHAPE_STATUS.HIDDEN && nextShapeStatus[2] === SHAPE_STATUS.HIDDEN) {
      nextShapes = this.generateNextShapes();
      _.fill(nextShapeStatus, SHAPE_STATUS.DEFAULT);
    }

    this.setState({
      grid: grid,
      selectedShapeIdx: -1,
      nextShapes: nextShapes,
      nextShapeStatus: nextShapeStatus
    })
    
    let gridAfterEliminate = grid.slice();
    // eliminate squares
    let cnt = this.eliminateSquares(gridAfterEliminate, SQUARE_STATUS.EMPTY);
    console.log("eliminateSquares to empty!!!");
    if (cnt > 0) {
      // update grid first, and eliminate square with delay
      this.setState({
        grid: grid,
        gridPrev: grid,
        selectedShapeIdx: -1,
        nextShapes: nextShapes,
        nextShapeStatus: nextShapeStatus
      }, () => setTimeout(() => {
        this.setState({
          grid: gridAfterEliminate,
          gridPrev: gridAfterEliminate,
          points: this.state.points + cnt * 9
        })
      }, 300))
    } else {
      // only update grid
      this.setState({
        grid: grid,
        gridPrev: grid,
        selectedShapeIdx: -1,
        nextShapes: nextShapes,
        nextShapeStatus: nextShapeStatus
      })
    }

    // update shape status
    this.updateShapeStatus(grid, nextShapeStatus, nextShapes);
    this.setState({
      nextShapeStatus: nextShapeStatus
    })

    // check game end
    if (this.isGameEnd(nextShapeStatus)) {
      alert("Game ended, you score is " + this.state.points)
    }
  }

  reset() {
    this.setState(this.getInitialState())
  }

  isGameEnd(nextShapeStatus) {
    for (let i=0;i<3;i++) {
      if (nextShapeStatus[i] === SHAPE_STATUS.DEFAULT || nextShapeStatus[i] === SHAPE_STATUS.ACTIVE) {
        return false;
      }
    }
    return true;
  }

  /**
   * eliminate squares if they are on the same row or column or same 3x3 block
   */
  eliminateSquares(grid, status) {
    let cnt = 0;
    let rows = Array(9).fill(true); // whether a row can be eliminated
    let columns = Array(9).fill(true);
    let blocks = Array(9).fill(true);
    for (let i=0;i<9;i++) {
      for (let j=0;j<9;j++) {
        if (grid[i*9+j] !== SQUARE_STATUS.BLOCKED && grid[i*9+j] !== SQUARE_STATUS.HOVERED && grid[i*9+j] !== SQUARE_STATUS.INFO) {
          rows[i] = false;
          columns[j] = false;
          blocks[Math.floor(i/3)*3+Math.floor(j/3)] = false;
        }
      }
    }

    // reset good rows and columns
    rows.forEach((value, rowIdx) => {
      if (value === true) { 
        console.log("reset");
        cnt ++;
        for (let j=0;j<9;j++) {
          grid[rowIdx*9+j] = status; // reset
        }
      }
    })

    columns.forEach((value, colIdx) => {
      if (value === true) {
        console.log("reset");
        cnt ++;
        for (let i=0;i<9;i++) {
          grid[i*9+colIdx] = status; // reset
        }
      }
    })

    blocks.forEach((value, blockIdx) => {
      if (value === true) {
        console.log("reset");
        cnt ++;
        let originI = Math.floor(blockIdx/3)*3;
        let originJ = (blockIdx%3)*3;
        for (let i=originI;i<originI+3;i++) {
          for (let j=originJ;j<originJ+3;j++) {
            grid[i*9+j] = status; // reset
          }
        }
      }
    })
    return cnt;
  }

  updateShapeStatus(grid, nextShapeStatus, nextShapes) {
    for (let i=0;i<3;i++) {
      if (nextShapeStatus[i] === SHAPE_STATUS.HIDDEN) {
        continue;
      }
      // if the shape is hidden yet and it cannot be put on the grid, we need to disactivate it
      if (!this.canPutShapeOnGrid(grid, i, nextShapes)) {
        nextShapeStatus[i] = SHAPE_STATUS.DISABLED; // set to inactive
      } else {
        nextShapeStatus[i] = SHAPE_STATUS.DEFAULT;
      }
    }
  }

  putShape(grid, gridIdx, status) {
    let originI = Math.floor(gridIdx / 9);
    let originJ = Math.floor(gridIdx % 9);
    let selectedShape = this.state.nextShapes[this.state.selectedShapeIdx];
    
    let offset = this.getPivotOffset(selectedShape);
    for (let i=0;i<selectedShape.length;i++) {
      for (let j=0;j<selectedShape[0].length;j++) {
        if (selectedShape[i][j] !== 0) {
          let newI = originI+i;
          let newJ = originJ+j-offset;
          grid[newI * 9 + newJ] = status;
        }
      }
    }
  }
  /**
   * return true if the shape can be put on the grid idx
   * @param {*} grid 
   * @param {*} gridIdx 
   * @returns 
   */
  canPutShape(grid, gridIdx, shape) {
    let originI = Math.floor(gridIdx / 9);
    let originJ = Math.floor(gridIdx % 9);
    let offset = this.getPivotOffset(shape);
    for (let i=0;i<shape.length;i++) {
      for (let j=0;j<shape[0].length;j++) {
        if (shape[i][j] !== 0) {
          let newI = originI+i;
          let newJ = originJ+j-offset;
          if (this.isOutOfBound(newI, newJ) || grid[newI * 9 + newJ] === 1) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /**
   * return true if the shape can be put anywhere on the grid
   * @param {*} grid 
   * @param {*} shapeId 
   */
  canPutShapeOnGrid(grid, shapeId, nextShapes) {
    let shape = nextShapes[shapeId];
    for (let i=0;i<9;i++) {
      for (let j=0;j<9;j++) {
        let gridIdx = i*9+j;
        if (this.canPutShape(grid, gridIdx, shape)) {
          return true;
        }
      }
    }
    return false;
  }

  // find the index of the first blocked square on the first row of the shape. That is our pivot.
  getPivotOffset(shape) {
    let offset = 0;
    while(shape[0][offset] === 0) {
      offset++;
    }
    return offset;
  }

  isOutOfBound(i, j) {
    return i < 0 || i >= 9 || j < 0 || j >= 9;
  }

  /** Shape Related **/
  handleShapeClick(idx) {
    let nextShapeStatus = this.state.nextShapeStatus.slice();
    let selectedShapeIdx = this.state.selectedShapeIdx;
    let newSelectedShapeId;
    // do nothing if shape is disabled or hidden
    if (nextShapeStatus[idx] === SHAPE_STATUS.DISABLED || nextShapeStatus[idx] === SHAPE_STATUS.HIDDEN) {
      return;
    }
    // toggle
    if (selectedShapeIdx === idx) {
      nextShapeStatus[idx] = SHAPE_STATUS.DEFAULT;
      newSelectedShapeId = -1;
    } else {
      // switch to another shape
      if (selectedShapeIdx !== -1) {
      // clear the selected shape
        nextShapeStatus[selectedShapeIdx] = SHAPE_STATUS.DEFAULT;
      }  
      nextShapeStatus[idx] = SHAPE_STATUS.ACTIVE;
      newSelectedShapeId = idx;
    }
    this.setState(
      {
        selectedShapeIdx: newSelectedShapeId,
        nextShapeStatus: nextShapeStatus
      }
    )

  }

  generateNextShapes() {
    let nextShapes = [];
    for (let i=0;i<3;i++) {
      let ranIdx = Math.floor((Math.random() * (shapes.length)))
      nextShapes.push(_.cloneDeep(shapes[ranIdx]));
    }
    return nextShapes;
  }
}

function App() {
  return (
    <div className="App">
      <Game></Game>
    </div>
  );
}

export default App;
