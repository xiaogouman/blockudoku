import {SQUARE_STATUS} from '../constants'
function Square(props) {
    let className;
    if (props.status === SQUARE_STATUS.EMPTY) {
      className = "square empty";
    } else if (props.status === SQUARE_STATUS.BLOCKED) {
      className = "square blocked";
    } else if (props.status === SQUARE_STATUS.HOVERED) {
      className = "square hovered";
    } else if (props.status === SQUARE_STATUS.INFO) {
      className = "square info";
    }
  
    if (props.rightBold && props.bottomBold) {
      className += " square-bottom-right-bold"
    } else if (props.rightBold) {
      className += " square-right-bold";
    } else if (props.bottomBold) {
      className += " square-bottom-bold";
    } else {
      className += " square-normal-border"
    }
    return <button 
    className={className} 
    onClick={props.onClick} 
    onMouseEnter={props.onMouseEnter}/>;
  }

function Board(props) {
    let rows = [];
    for (let i = 0; i < 9; i++) {
      let row = [];
      for (let j = 0; j < 9; j++) {
        let idx = i*9+j;
        let squareStatus = props.grid[idx];
        row.push(<Square status={squareStatus} 
          onClick={() => props.onClick(idx)}
          onMouseEnter={() => props.onMouseEnter(idx)}
          rightBold={j === 2 || j === 5}
          bottomBold={i === 2 || i === 5}
          />)
      }
      rows.push(<div>{row}</div>)
    }
    return <div>{rows}</div>
  }


  export {Board};
