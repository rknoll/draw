import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import LinearProgress from '@material-ui/core/LinearProgress';
import { connect } from 'react-redux';
import gameActions from '../store/actions/game';
import { SELECT_WORD_TIMEOUT } from '../../shared/constants';

const useStyles = makeStyles((theme) => ({
  word: {
    margin: theme.spacing(),
  }
}));

const WordSelectionDialog = ({ words, selectWord, currentWordEncoded }) => {
  const classes = useStyles();
  const [isOpen, setIsOpen] = React.useState(false);
  const [targetTime, setTargetTime] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const onSelect = (word) => () => selectWord(word);
  const open = !!words && words.length > 0 && (!currentWordEncoded || !currentWordEncoded.length);

  const updateProgress = () => {
    const now = Date.now();
    const diff = targetTime - now;
    if (diff <= 0) return setProgress(0);
    setProgress(Math.floor(diff / SELECT_WORD_TIMEOUT * 100));
  };

  if (open !== isOpen) {
    setTargetTime(open ? Date.now() + SELECT_WORD_TIMEOUT : 0);
    updateProgress();
    setIsOpen(open);
  }

  React.useEffect(() => {
    const now = Date.now();
    if (targetTime < now) return () => {};
    const timer = setInterval(updateProgress, 250);
    return () => clearInterval(timer);
  }, [targetTime]);

  return <Dialog open={open}>
    <DialogTitle>Select word</DialogTitle>
    <DialogContent>
      {words && words.map((word) => <Button key={word} className={classes.word} variant='contained' color='primary'
                                            onClick={onSelect(word)}>{word}</Button>)}
    </DialogContent>
    <DialogActions>
      <Button variant='outlined' onClick={onSelect('')}>
        Skip round
      </Button>
    </DialogActions>
    <LinearProgress variant='determinate' value={progress} />
  </Dialog>;
};

const mapStateToProps = (state) => ({
  words: state.game.words,
  currentWordEncoded: state.game.currentWordEncoded,
});

const mapDispatchToProps = {
  selectWord: gameActions.useWord,
};

export default connect(mapStateToProps, mapDispatchToProps)(WordSelectionDialog);
