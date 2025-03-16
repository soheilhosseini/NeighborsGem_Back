const logEvents = require("/utils/logEvents.js");
const log = (req, res, next) => {
  logEvents(`${req.method}\t ${req.headers.origin}\t ${req.url}`, "reqLog.txt");
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = log;
