export const formatNumberToTime = (value: number) => {
  let hours = Math.floor(value / 3600);
  var minutes = Math.floor((value - hours * 3600) / 60);
  var seconds = value - hours * 3600 - minutes * 60;

  hours = Math.round(hours);
  minutes = Math.round(minutes);
  seconds = Math.round(seconds);

  let hoursString = hours < 10 ? `0${hours}` : hours.toString();
  let minutesString = minutes < 10 ? `0${minutes}` : minutes.toString();
  let secondsString = seconds < 10 ? `0${seconds}` : seconds.toString();

  if (hours === 0) return `${minutesString}:${secondsString}`;
  else return `${hoursString}:${minutesString}:${secondsString}`;
};
