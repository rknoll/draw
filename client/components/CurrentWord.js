import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import gameActions from '../store/actions/game';

const useStyles = makeStyles((theme) => ({
  word: {
    fontSize: 14,
    textAlign: 'center',
    wordBreak: 'break-all',
    [theme.breakpoints.up('sm')]: {
      fontSize: 24,
    },
  },
  character: {
    marginRight: 4,
    [theme.breakpoints.up('sm')]: {
      marginRight: 6,
    },
    '&:last-child': {
      marginRight: 0,
    },
  },
  characterClickable: {
    cursor: 'pointer',
    '&:hover': {
      outlineColor: theme.palette.text.primary,
      outlineWidth: 1,
      outlineStyle: 'dashed',
    },
  },
  characterRevealed: {
    textDecoration: 'underline',
    fontWeight: 'bold',
  },
}));

const CurrentWord = ({ currentWord, currentWordEncoded, revealCharacter }) => {
  const classes = useStyles();
  const word = currentWord || currentWordEncoded;
  if (!word) return null;

  return <Box className={classes.word} fontFamily='Monospace'>
    {word.split('').map((letter, index) => {
      const encodedLetter = currentWordEncoded[index];
      const revealed = encodedLetter !== '_' && encodedLetter !== ' ' && currentWord;
      const clickable = encodedLetter === '_' && currentWord;
      const reveal = () => clickable && revealCharacter(index);
      const className = classnames(
        classes.character,
        revealed && classes.characterRevealed,
        clickable && classes.characterClickable,
      );

      return <span key={`${index}-${letter}`} className={className} onClick={reveal}>
        {letter}
      </span>;
    })}
  </Box>;
};

const mapStateToProps = (state) => ({
  currentWord: state.game.currentWord,
  currentWordEncoded: state.game.currentWordEncoded,
});

const mapDispatchToProps = {
  revealCharacter: gameActions.revealCharacter,
};

export default connect(mapStateToProps, mapDispatchToProps)(CurrentWord);
