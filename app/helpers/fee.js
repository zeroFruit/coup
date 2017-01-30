const getFeeFromMinutes = (minutes) => {
  let hours = parseInt(minutes / 60);
  let over = minutes % 60;
  if (over > 10) {
    hours++;
  }

  return hours * 800;
}

module.exports = {
  getFeeFromMinutes
}
