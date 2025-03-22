import express, { urlencoded, json } from "express";
import { join } from "path";
import verifyJWT from "./middleware/verifyJWT";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "./middleware/errorHandler";
import corsOptions from "./config/corsOptions";
import credentials from "./middleware/credentials";
import log from "./middleware/log";
import connectDB from "./database/db";
import apis from "./routes/api/api";
const PORT = process.env.PORT || 3500;

const app = express();

//middleware for cookies
app.use(cookieParser());

// custom middleware logger
app.use(log);

app.use(credentials);
app.use(cors(corsOptions));

app.use(urlencoded({ extended: false }));

app.use(json());

app.use(express.static(join(__dirname, "/public")));

connectDB();

app.use("/api", apis);
// app.use("/auth", require("./routes/auth"));
// app.use("/refresh", require("./routes/refresh"));
// app.use("/logout", require("./routes/logout"));
// app.use(verifyJWT);
// app.use("/me", require("./routes/api/me"));

app.all("*", (_, res) => {
  res.sendStatus(404);
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
