
function linearRegression(x, y) {
  let xSum = 0;
  let ySum = 0;
  let xxSum = 0;
  let xySum = 0;
  let yySum = 0;

  let n = 0;
  for (; n < x.length && n < y.length; n += 1) {
    xSum += x[n];
    ySum += y[n];
    xxSum += x[n] ** 2;
    xySum += x[n] * y[n];
    yySum += y[n] ** 2;
  }

  const div = (n * xxSum) - (xSum * xSum);
  const gain = ((n * xySum) - (xSum * ySum)) / div;
  const correlation = Math.abs(((xySum * n) - (xSum * ySum)) / Math.sqrt(((xxSum * n) - (xSum ** 2)) * ((yySum * n) - (ySum ** 2))));

  return { gain, correlation };
}

module.exports = linearRegression;
