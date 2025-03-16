require("module-alias/register");
const express = require("express");
const path = require("path");
const verifyJWT = require("./middleware/verifyJWT.js");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 3500;
const cors = require("cors");
const { errorHandler } = require("./middleware/errorHandler");
const corsOptions = require("./config/corsOptions");
const credentials = require("./middleware/credentials.js");
const app = express();
const log = require("./middleware/log.js");
// custom middleware logger
app.use(log);

app.use(credentials);
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

//middleware for cookies
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "/public")));

app.use("/register", require("./routes/register.js"));
app.use("/auth", require("./routes/auth.js"));
app.use("/refresh", require("./routes/refresh.js"));
app.use("/logout", require("./routes/logout.js"));
app.use(verifyJWT);
app.use("/me", require("./routes/api/me"));

app.all("*", (req, res) => {
  res.sendStatus(404);
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
