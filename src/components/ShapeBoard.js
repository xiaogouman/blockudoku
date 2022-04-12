import {SQUARE_STATUS, SHAPE_STATUS} from '../constants'
function ShapeSquare(props) {
    let className;
    if (props.status === SQUARE_STATUS.EMPTY) {
      className = "empty shape-square";
    } else if (props.status === SQUARE_STATUS.BLOCKED) {
      className = "blocked shape-square";
    } else if (props.status === SQUARE_STATUS.ACTIVE) {
      className = "active shape-square";
    } else if (props.status === SQUARE_STATUS.DISABLED) {
      className = "disabled shape-square"
    }
    return <button className={className} onClick={props.onClick}></button>;
  }
  
  function ShapeBoard(props) {
    let rows = [];
    let idx = props.shapeIdx;
    let status = props.status;
    // console.log(props);
    for (let i = 0; i < props.shape.length; i++) {
      let row = [];
      for (let j = 0; j < props.shape[0].length; j++) {
        let value = props.shape[i][j];
        let squareStatus;
        if (value === 0) {
          squareStatus = SQUARE_STATUS.EMPTY;
        } else {
          switch(status) {
            case SHAPE_STATUS.DEFAULT:
              squareStatus = SQUARE_STATUS.BLOCKED;
              break;
            case SHAPE_STATUS.ACTIVE:
              squareStatus = SQUARE_STATUS.ACTIVE;
              break;
            case SHAPE_STATUS.DISABLED:
              squareStatus = SQUARE_STATUS.DISABLED;
              break;
            case SHAPE_STATUS.HIDDEN:
              squareStatus = SQUARE_STATUS.EMPTY;
              break;
          }
        }
        row.push(<ShapeSquare 
          status={squareStatus}
          onClick={() => props.onClick(idx)}
        />)
      }
      rows.push(<div>{row}</div>)
    }
    return <div>{rows}</div>
  }


  export {ShapeBoard};
