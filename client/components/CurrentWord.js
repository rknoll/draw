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

const CurrentWord = ({ selectedWord, currentWord, revealCharacter }) => {
  const classes = useStyles();
  const word = selectedWord || currentWord;
  if (!word) return null;

  return <Box className={classes.word} fontFamily='Monospace'>
    {word.split('').map((letter, index) => {
      const revealed = currentWord[index] !== '_' && currentWord[index] !== ' ' && selectedWord;
      const clickable = currentWord[index] === '_' && selectedWord;
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
  selectedWord: state.game.selectedWord,
  currentWord: state.game.currentWord,
});

const mapDispatchToProps = {
  revealCharacter: gameActions.revealCharacter,
};

export default connect(mapStateToProps, mapDispatchToProps)(CurrentWord);
