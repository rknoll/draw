import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import gameActions from '../store/actions/game';
import toolActions from '../store/actions/tool';
import { COLORS, WIDTHS } from '../../shared/constants';

const useStyles = makeStyles((theme) => ({
  root: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing(2),
  },
  colorRow: {
    display: 'flex',
    maxWidth: '100%',
    justifyContent: 'center',
  },
  tool: {
    flexGrow: 0,
    width: 24,
    height: 24,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.text.primary,
    [theme.breakpoints.up('sm')]: {
      width: 40,
      height: 40,
    },
  },
  color: {
    width: '90%',
    height: '90%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.text.primary,
  },
  line: {
    borderRadius: '50%',
    backgroundColor: theme.palette.text.primary,
    margin: 'auto',
    '&::before': {
      content: '""',
      display: 'block',
      paddingBottom: '100%',
    },
  },
  svg: {
    fill: theme.palette.text.primary,
    width: '80%',
    margin: 'auto',
  },
}));

const Controls = ({ tool, updateTool, sendCommand }) => {
  const classes = useStyles();
  const topRow = COLORS.slice(0, COLORS.length / 2);
  const bottomRow = COLORS.slice(COLORS.length / 2, COLORS.length);

  const renderColor = (color) => {
    const borderStyle = {};
    if (tool.color !== color && tool.color !== 'rainbow') {
      borderStyle.borderColor = 'transparent';
    }
    return <div
      key={color}
      className={classes.tool}
      style={borderStyle}
    >
      <div
        key={color}
        className={classes.color}
        style={{ backgroundColor: color }}
        onClick={() => updateTool({ color })}
      />
    </div>;
  };

  const renderLine = (thickness) => {
    const percent = 8 + thickness * 2;
    const style = {};
    if (tool.width !== thickness || tool.type !== 'line') style.borderColor = 'transparent';
    return <div key={thickness} style={style} className={classes.tool}
                onClick={() => updateTool({ type: 'line', width: thickness })}>
      <div className={classes.line} style={{ width: `${percent}%` }} />
    </div>;
  };

  const renderFill = () => {
    const style = {};
    if (tool.type !== 'fill') style.borderColor = 'transparent';
    return <div className={classes.tool} onClick={() => updateTool({ type: 'fill' })} style={style}>
      <svg viewBox='0 0 512 512' className={classes.svg} style={{ transform: 'scale(-1,1)' }}>
        <path d='M160 0l-29 29 37 37L25 209a63 63 0 000 90l2 2 131 130c24 25 64 25 89 0l157-157 15-15L218
          58l-17-17-4-4-37-37zm37 95l164 164-46 46H89l-35-35c-8-9-8-23 0-32L197 95zm247 237l-17 25-23 35c-6
          10-10 18-14 29-4 10-9 16-9 29 0 33 29 62 63 62s62-29 62-62c0-13-4-21-9-31-4-11-10-21-14-29-10-19
          -23-36-23-36l-16-22z' />
      </svg>
    </div>;
  };

  const renderErase = () => {
    const style = {};
    if (tool.type !== 'erase') style.borderColor = 'transparent';
    return <div className={classes.tool} onClick={() => updateTool({ type: 'erase' })} style={style}>
      <svg viewBox='0 0 512 512' className={classes.svg}>
        <path d='M439 441H154L54 341 324 71h-1l135 135-242 243a27 27 0 0038 38l242-243a54 54 0 000-76L362
          33h-1a54 54 0 00-76 0L16 303a54 54 0 000 76l108 108c5 5 12 8 19 8h296c15 0 27-12 27-27s-12-27-27-27z' />
        <path d='M431 268L262 98a27 27 0 00-39 38l170 170a27 27 0 0038-38' />
      </svg>
    </div>;
  };

  const renderUndo = () => {
    const style = { borderColor: 'transparent' };
    return <div className={classes.tool} onClick={() => sendCommand({ type: 'undo' })} style={style}>
      <svg viewBox='0 0 512 512' className={classes.svg} style={{ width: '70%' }}>
        <path d='M512 255a265 265 0 01-75 182 262 262 0 01-182 75 258 258 0 01-197-92c-2-2-2-5-2-8s1-4
          3-6l45-46c2-2 5-2 9-2 3 0 6 1 7 3a169 169 0 00256 17c15-15 28-34 36-55a162 162 0 000-132 162
          162 0 00-91-91 162 162 0 00-128-2c-20 7-38 19-53 33l45 46c7 6 9 14 5 23s-10 13-20 13H21c-5 0
          -11-2-14-6-4-5-7-10-7-15V43c0-9 5-16 13-20s17-2 23 5l44 43A262 262 0 01257 0c34 0 68 7 99 21
          s59 31 82 54c24 24 41 51 55 82 13 30 19 64 19 98z' />
      </svg>
    </div>;
  };

  const renderTrash = () => {
    const style = { borderColor: 'transparent' };
    return <div className={classes.tool} onClick={() => sendCommand({ type: 'clear' })} style={style}>
      <svg viewBox='0 0 512 512' className={classes.svg}>
        <path d='M51 154h410a26 26 0 000-52H51a26 26 0 000 52M179 230v154a26 26 0 0051 0V230a26 26 0 00-51
          0M282 230v154a26 26 0 0051 0V230a26 26 0 00-51 0' />
        <path d='M51 130l26 307 25-2H77c0 43 34 77 77 77h204c43 0 77-34 77-77h-25l25 2 26-307c1-14-10-26-24
          -28-14-1-26 10-27 24l-26 307v2c0 14-12 26-26 26H154c-15 0-26-12-26-26v-2l-26-307a26 26 0 10-51 4z' />
        <path d='M205 128V51h102v77a26 26 0 0051 0V51c0-28-22-51-51-51H205c-28 0-51 23-51 51v77a26 26 0 0051 0z' />
      </svg>
    </div>;
  };

  return <div className={classes.root}>
    <div className={classes.colorRow}>
      {topRow.map(renderColor)}
      {WIDTHS.map(renderLine)}
    </div>
    <div className={classes.colorRow}>
      {bottomRow.map(renderColor)}
      {renderFill()}
      {renderErase()}
      {renderUndo()}
      {renderTrash()}
    </div>
  </div>;
};

const mapStateToProps = (state) => ({
  tool: state.tool,
});

const mapDispatchToProps = {
  sendCommand: gameActions.sendCommand,
  updateTool: toolActions.updateTool,
};

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
