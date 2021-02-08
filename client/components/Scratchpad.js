import React from 'react';
import { connect } from 'react-redux';
import { withResizeDetector } from 'react-resize-detector';
import parseColor from 'color-parse';
import { makeStyles } from '@material-ui/core/styles';
import { COLORS } from '../../shared/constants';
import gameActions from '../store/actions/game';

const canvasSize = {
  width: 800,
  height: 600,
};

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    position: 'relative',
    flexGrow: 1,
  },
  canvas: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    position: 'absolute',
    borderColor: theme.palette.text.primary,
    borderWidth: 1,
    borderStyle: 'solid',
    display: 'none',
    imageRendering: 'pixelated',
  },
}));

const distance = (from, to) => {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getToolColor = (tool, rainbowLength) => {
  if (tool.type === 'erase') {
    return '#FFFFFF';
  }
  if (tool.color === 'rainbow') {
    const colorIndex = Math.floor(rainbowLength / 50) % COLORS.length;
    return COLORS[colorIndex];
  }
  return tool.color;
};

const getToolCursor = (tool, rainbowLength, scale) => {
  const brushCanvas = document.createElement('canvas');
  const brushCanvasCtx = brushCanvas.getContext('2d');
  brushCanvasCtx.imageSmoothingEnabled = false;
  switch (tool.type) {
    case 'line':
    case 'erase': {
      const scaled = (x) => Math.round(x * scale);
      brushCanvas.width = scaled(40);
      brushCanvas.height = scaled(40);
      brushCanvasCtx.clearRect(0, 0, scaled(40), scaled(40));
      brushCanvasCtx.fillStyle = getToolColor(tool, rainbowLength);
      brushCanvasCtx.beginPath();
      brushCanvasCtx.arc(scaled(20), scaled(20), scaled((tool.type === 'erase' ? 20 : tool.width / 2)) - 1, 0, 2 * Math.PI);
      brushCanvasCtx.fill();
      brushCanvasCtx.strokeStyle = '#FFFFFF';
      brushCanvasCtx.beginPath();
      brushCanvasCtx.arc(scaled(20), scaled(20), scaled((tool.type === 'erase' ? 20 : tool.width / 2)) - 1, 0, 2 * Math.PI);
      brushCanvasCtx.stroke();
      brushCanvasCtx.strokeStyle = '#000000';
      brushCanvasCtx.beginPath();
      brushCanvasCtx.arc(scaled(20), scaled(20), scaled((tool.type === 'erase' ? 20 : tool.width / 2)), 0, 2 * Math.PI);
      brushCanvasCtx.stroke();
      const t = brushCanvas.toDataURL();
      return `url(${t}) ${scaled(20)} ${scaled(20)}, default`;
    }
    case 'fill': {
      const path = new Path2D('M160 0l-29 29 37 37L25 209a63 63 0 000 90l2 2 131 130c24 25 64 25 89 0l157-157 15-15L218 58l-17-17-4-4-37-37zm37 95l164 164-46 46H89l-35-35c-8-9-8-23 0-32L197 95zm247 237l-17 25-23 35c-6 10-10 18-14 29-4 10-9 16-9 29 0 33 29 62 63 62s62-29 62-62c0-13-4-21-9-31-4-11-10-21-14-29-10-19 -23-36-23-36l-16-22z');
      const cross = new Path2D('M560 460v80M560 580v80M580 560h80M460 560h80');
      const canvasSize = 80;
      const toolSize = 44;
      const svgSize = 704;
      brushCanvas.width = canvasSize;
      brushCanvas.height = canvasSize;
      brushCanvasCtx.clearRect(0, 0, canvasSize, canvasSize);
      brushCanvasCtx.translate(toolSize, canvasSize - toolSize);
      brushCanvasCtx.scale(-toolSize / svgSize, toolSize / svgSize);
      brushCanvasCtx.strokeStyle = '#FFFFFF';
      brushCanvasCtx.lineWidth = svgSize / toolSize * 4;
      brushCanvasCtx.stroke(path);
      brushCanvasCtx.stroke(cross);
      brushCanvasCtx.strokeStyle = '#000000';
      brushCanvasCtx.lineWidth = svgSize / toolSize * 2;
      brushCanvasCtx.stroke(path);
      brushCanvasCtx.stroke(cross);
      brushCanvasCtx.fillStyle = tool.color;
      brushCanvasCtx.fill(path);
      const t = brushCanvas.toDataURL();
      return `url(${t}) 10 ${canvasSize - 10}, default`;
    }
    default:
      return null;
  }
};

const clearCanvas = (canvas) => {
  if (!canvas) return;

  const context = canvas.getContext('2d');
  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, canvas.width, canvas.height);
};

const resizeCanvas = (canvas, w, h, connected) => {
  if (!canvas) return;

  const ratio = w / h;
  const targetRatio = canvasSize.width / canvasSize.height;
  const width = ratio > targetRatio ? h * targetRatio : w;
  const height = width / targetRatio;

  canvas.style.display = connected ? 'block' : 'none';
  canvas.style.width = `${Math.round(width)}px`;
  canvas.style.height = `${Math.round(height)}px`;
};

const Scratchpad = ({ connected, width, height, targetRef, tool, commands, sendCommand, canDraw }) => {
  const classes = useStyles();
  const canvasRef = React.useRef(null);
  const [drawnCommands, setDrawnCommands] = React.useState([]);
  const [rainbowLength, setRainbowLength] = React.useState(0);

  React.useEffect(() => clearCanvas(canvasRef.current), []);
  React.useEffect(() => resizeCanvas(canvasRef.current, width, height, connected), [canvasRef, width, height, connected]);

  React.useEffect(() => {
    if (!canvasRef.current) return;
    const cursor = getToolCursor(tool, rainbowLength, width / 800);
    canvasRef.current.style.cursor = cursor;
  }, [canvasRef, tool, width, height, rainbowLength]);

  const [isPainting, setIsPainting] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState(undefined);

  const getCoordinates = (event) => {
    event.preventDefault();
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (!event.clientX) event = event.changedTouches[0];

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const drawLeaderboard = (points) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = '#2d2d2d';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.shadowBlur = 40;
    context.shadowColor = '#FFFFFF';
    context.fillStyle = '#FFFFFF';
    context.font = '72px xkcd-script, Roboto, Helvetica, Arial, sans-serif';

    context.textAlign = 'center';
    context.fillText('🏆 Leaderboard 🏆', 400, 150);

    const colors = [
      '#D4AF37',
      '#B4B4B4',
      '#A0522D',
    ];

    const ranked = points.filter(({ player }) => player).sort((a, b) => b.points - a.points);
    context.textAlign = 'start';
    for (let i = 0, r = 1; i < ranked.length && i < 3; ++i) {
      const { player, points } = ranked[i];
      context.fillStyle = colors[r - 1];
      context.fillText(`#${r} ${player.name}`, 100, 300 + i * 100);
      if (i < ranked.length - 1 && ranked[i + 1].points !== points) ++r;
    }
  };

  const drawLineCommand = ({ from, to, color, width }) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const parsedColor = parseColor(color);

    const clamp = (val, min, max) => val < min ? min : val > max ? max : val;
    const upperWidth = Math.ceil(width / 2);
    let x1 = clamp(Math.floor(from.x), -upperWidth, canvas.width + upperWidth);
    let y1 = clamp(Math.floor(from.y), -upperWidth, canvas.height + upperWidth);
    let x2 = clamp(Math.floor(to.x), -upperWidth, canvas.width + upperWidth);
    let y2 = clamp(Math.floor(to.y), -upperWidth, canvas.height + upperWidth);

    const lowerWidth = Math.floor(width / 2);
    const widthSquared = lowerWidth * lowerWidth;
    const left = Math.min(x1, x2) - lowerWidth;
    const top = Math.min(y1, y2) - lowerWidth;
    const right = Math.max(x1, x2) + lowerWidth;
    const bottom = Math.max(y1, y2) + lowerWidth;
    x1 -= left;
    y1 -= top;
    x2 -= left;
    y2 -= top;

    const data = context.getImageData(left, top, right - left, bottom - top);
    const drawDot = (pointX, pointY) => {
      for (let x = -lowerWidth; x <= lowerWidth; x++) {
        for (let y = -lowerWidth; y <= lowerWidth; y++) {
          if (x * x + y * y >= widthSquared) continue;
          const address = 4 * ((pointY + y) * data.width + pointX + x);
          if (address < 0 || address >= data.data.length) continue;
          data.data[address] = parsedColor.values[0];
          data.data[address + 1] = parsedColor.values[1];
          data.data[address + 2] = parsedColor.values[2];
          data.data[address + 3] = Math.round(parsedColor.alpha * 255);
        }
      }
    };

    if (x1 === x2 && y1 === y2) {
      drawDot(x1, y1);
    } else {
      drawDot(x1, y1);
      drawDot(x2, y2);

      const dx = Math.abs(x2 - x1);
      const dy = Math.abs(y2 - y1);
      const dirX = x1 < x2 ? 1 : -1;
      const dirY = y1 < y2 ? 1 : -1;
      let delta = dx - dy;

      while (x1 !== x2 || y1 !== y2) {
        const error = delta << 1;
        if (error > -dy) {
          delta -= dy;
          x1 += dirX;
        }
        if (error < dx) {
          delta += dx;
          y1 += dirY;
        }
        drawDot(x1, y1);
      }
    }

    context.putImageData(data, left, top);
  };

  const getPixel = (pixelData, x, y) => {
    if (x < 0 || y < 0 || x >= pixelData.width || y >= pixelData.height) return -1;
    return pixelData.data[y * pixelData.width + x];
  };

  const floodFillCanvas = (ctx, x, y, fillColor) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const pixelData = {
      width: imageData.width,
      height: imageData.height,
      data: new Uint32Array(imageData.data.buffer),
    };
    const targetColor = getPixel(pixelData, x, y);
    if (targetColor === fillColor) return;
    const pixelsToCheck = [x, y];
    while (pixelsToCheck.length > 0) {
      const y = pixelsToCheck.pop();
      const x = pixelsToCheck.pop();

      const currentColor = getPixel(pixelData, x, y);
      if (currentColor === targetColor) {
        pixelData.data[y * pixelData.width + x] = fillColor;
        pixelsToCheck.push(x + 1, y);
        pixelsToCheck.push(x - 1, y);
        pixelsToCheck.push(x, y + 1);
        pixelsToCheck.push(x, y - 1);
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const floodFillCommand = ({ position, color }) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const parsedColor = parseColor(color);
    const fillColor =
      parsedColor.values[0] +
      parsedColor.values[1] * 256 +
      parsedColor.values[2] * 256 * 256 +
      Math.round(parsedColor.alpha * 255) * 256 * 256 * 256;
    floodFillCanvas(context, Math.round(position.x), Math.round(position.y), fillColor);
  };

  const clearCommand = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    clearCanvas(canvas);
  };

  const drawCommand = (command) => {
    switch (command.type) {
      case 'line':
        return drawLineCommand({
          from: command.from,
          to: command.to,
          color: command.color,
          width: command.width,
        });
      case 'erase':
        return drawLineCommand({
          from: command.from,
          to: command.to,
          color: '#FFFFFF',
          width: 40,
        });
      case 'fill':
        return floodFillCommand(command);
      case 'clear':
        return clearCommand();
      case 'over':
        return drawLeaderboard(command.points);
      default:
        break;
    }
  };

  const drawCommands = (commands) => {
    const realCommands = [];
    let index = 0;

    const findLastBarrier = (index) => {
      for (let i = index; i >= 0; --i) {
        const type = realCommands[i].command.type;
        if (type !== 'line' && type !== 'erase') return i;
      }
      return -1;
    };

    for (const command of commands) {
      if (command.command.type !== 'undo') {
        realCommands[index] = command;
        ++index;
        continue;
      }
      if (index === 0) continue;

      const lastBarrier = findLastBarrier(index - 1);
      if (lastBarrier === -1) continue;
      if (realCommands[lastBarrier].command.type === 'over') continue;

      if (realCommands[lastBarrier].command.type !== 'done') {
        realCommands.splice(lastBarrier, 1);
        --index;
        continue;
      }

      const barrierId = realCommands[lastBarrier].id;
      realCommands.splice(lastBarrier, 1);
      --index;

      for (let i = lastBarrier - 1; i >= 0; --i) {
        if (realCommands[i].id !== barrierId) continue;
        if (realCommands[i].command.type !== 'line' && realCommands[i].command.type !== 'erase') break;
        realCommands.splice(i, 1);
        --index;
      }
    }

    realCommands.length = index;
    for (const command of realCommands) {
      drawCommand(command.command);
    }
  };

  if (canvasRef.current) {
    if (drawnCommands.length > commands.length) {
      clearCanvas(canvasRef.current);
      drawCommands(commands);
      setDrawnCommands(commands);
    } else {
      const missingCommands = commands.slice(drawnCommands.length, commands.length);
      if (missingCommands.length) {
        if (missingCommands.find(({ command }) => command.type === 'undo')) {
          clearCanvas(canvasRef.current);
          drawCommands(commands);
        } else {
          drawCommands(missingCommands);
        }
        setDrawnCommands(commands);
      }
    }
  }

  const drawLine = React.useCallback((from, to) => {
    if (!canDraw) return;
    sendCommand({
      type: tool.type,
      color: getToolColor(tool, rainbowLength),
      width: tool.width,
      from,
      to,
    });
    setRainbowLength(rainbowLength + distance(from, to));
  }, [tool, canDraw, rainbowLength]);

  const eraseLine = React.useCallback((from, to) => {
    if (!canDraw) return;
    sendCommand({
      type: tool.type,
      from,
      to,
    });
  }, [tool, canDraw]);

  const floodFill = React.useCallback((position) => {
    if (!canDraw) return;
    sendCommand({
      type: tool.type,
      color: tool.color,
      position,
    });
  }, [tool, canDraw]);

  const startPaint = React.useCallback((event) => {
    const coordinates = getCoordinates(event);
    if (!coordinates) return;
    setIsPainting(true);
    setMousePosition(coordinates);
    switch (tool.type) {
      case 'line':
        return drawLine(coordinates, coordinates);
      case 'erase':
        return eraseLine(coordinates, coordinates);
      case 'fill':
        return floodFill(coordinates);
      default:
        break;
    }
  }, [drawLine, floodFill, tool]);

  React.useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.addEventListener('mousedown', startPaint);
    canvas.addEventListener('touchstart', startPaint);
    return () => {
      canvas.removeEventListener('mousedown', startPaint);
      canvas.removeEventListener('touchstart', startPaint);
    };
  }, [startPaint]);

  const paint = React.useCallback((event) => {
    if (!isPainting) return;
    const newMousePosition = getCoordinates(event);
    if (mousePosition && newMousePosition) {
      switch (tool.type) {
        case 'line':
          drawLine(mousePosition, newMousePosition);
          break;
        case 'erase':
          eraseLine(mousePosition, newMousePosition);
          break;
        default:
          break;
      }
      setMousePosition(newMousePosition);
    }
  }, [isPainting, mousePosition, drawLine, tool]);

  React.useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', paint);
    canvas.addEventListener('touchmove', paint);
    return () => {
      canvas.removeEventListener('mousemove', paint);
      canvas.removeEventListener('touchmove', paint);
    };
  }, [paint]);

  const exitPaint = React.useCallback(() => {
    if (!isPainting) return;
    setIsPainting(false);
    if (!canDraw) return;
    if (tool.type === 'line' || tool.type === 'erase') sendCommand({ type: 'done' });
  }, [isPainting, tool, canDraw]);

  React.useEffect(() => {
    if (!canvasRef) return;
    const canvas = canvasRef.current;
    canvas.addEventListener('mouseup', exitPaint);
    canvas.addEventListener('mouseleave', exitPaint);
    canvas.addEventListener('touchend', exitPaint);
    canvas.addEventListener('touchcancel', exitPaint);
    return () => {
      canvas.removeEventListener('mouseup', exitPaint);
      canvas.removeEventListener('mouseleave', exitPaint);
      canvas.removeEventListener('touchend', exitPaint);
      canvas.removeEventListener('touchcancel', exitPaint);
    };
  }, [exitPaint]);

  return <div className={classes.root} ref={targetRef}>
    <canvas width={canvasSize.width} height={canvasSize.height} ref={canvasRef} className={classes.canvas} />
  </div>;
};

const mapStateToProps = (state) => ({
  canDraw: !state.game.started || state.game.currentWord,
  commands: state.game.commands,
  connected: state.game.connected,
  tool: state.tool,
});

const mapDispatchToProps = {
  sendCommand: gameActions.sendCommand,
};

export default connect(mapStateToProps, mapDispatchToProps)(withResizeDetector(Scratchpad));
