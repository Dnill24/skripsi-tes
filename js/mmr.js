function updateMMROnCorrect(timeRatio, isBoss) {
  let mmrGain = 0.25 + (timeRatio * 0.75);
  if (isBoss) mmrGain *= 1.5;
  globalStats.playerMMR = (globalStats.playerMMR || 10) + mmrGain;
}

function updateMMROnWrong(isTimeout) {
  let mmrLoss = isTimeout ? 1.5 : 1.0;
  globalStats.playerMMR = Math.max(1, (globalStats.playerMMR || 10) - mmrLoss);
}
