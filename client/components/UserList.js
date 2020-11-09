import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  player: {
    margin: -8,
    padding: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    borderColor: 'transparent',
    display: 'flex',
  },
  self: {
    fontWeight: 'bold',
  },
  correct: {
    color: theme.palette.success.main,
  },
  activePlayer: {
    borderColor: theme.palette.text.secondary,
  },
  rank: {
    marginRight: theme.spacing(2),
    flexShrink: 0,
  },
  points: {
    marginLeft: theme.spacing(1),
    flexShrink: 0,
  },
  crown: {
    marginLeft: theme.spacing(1),
  },
  name: {
    textOverflow: 'ellipsis',
    flexGrow: 1,
    flexShrink: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
}));

const extendPoints = (points, players) => {
  const allPoints = { ...points };
  for (const player of players) {
    allPoints[player.id] = allPoints[player.id] || 0;
  }
  return allPoints;
};

const rankUsers = (allPoints) => {
  const ids = Object.keys(allPoints);
  if (ids.length === 0) return {};
  ids.sort((a, b) => allPoints[b] - allPoints[a]);

  let currentPoints = allPoints[ids[0]];
  let currentRank = 1;
  const ranked = {};
  for (const id of ids) {
    if (currentPoints !== allPoints[id]) {
      ++currentRank;
      currentPoints = allPoints[id];
    }
    ranked[id] = currentRank;
  }
  return ranked;
};

const isAllWinners = (allPoints) => {
  const ids = Object.keys(allPoints);
  if (ids.length === 0) return true;
  return ids.every(id => allPoints[id] === allPoints[ids[0]]);
};

const UserList = ({ self, players, correct, currentPlayer, points }) => {
  const classes = useStyles();
  const correctSet = new Set(correct);
  const allPoints = extendPoints(points, players);
  const userRank = rankUsers(allPoints);
  const allWinners = isAllWinners(allPoints);

  return <div className={classes.root}>
    {players && players.map(({ id, name }) => {
      const guessedCorrectly = correctSet.has(id) && id !== currentPlayer;
      const isWinner = !allWinners && userRank[id] === 1;
      const className = classnames(
        classes.player,
        id === self && classes.self,
        guessedCorrectly && classes.correct,
        id === currentPlayer && classes.activePlayer,
      );
      return <div key={id} className={className}>
        <span className={classes.rank}>#{userRank[id]}</span>
        <span className={classes.name}>
        {name}
          {isWinner && <span className={classes.crown}>🏆</span>}
        </span>
        <span className={classes.points}>{allPoints[id]}</span>
      </div>;
    })}
  </div>;
};

const mapStateToProps = (state) => ({
  players: state.game.players,
  self: state.game.self,
  points: state.game.points,
  correct: state.game.correct,
  currentPlayer: state.game.currentPlayer,
});

export default connect(mapStateToProps)(UserList);
