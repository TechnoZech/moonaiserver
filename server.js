require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passportSetup = require("./passport");
const passport = require("passport");
const authRoute = require("./routes/auth");
const cookieSession = require("cookie-session");
const { Configuration, OpenAIApi } = require("openai");
const bodyParser = require("body-parser")

const app = express();

const configuration = new Configuration({
    organization: process.env.CLIENT_ORG,
    apiKey: process.env.CLIENT_API,
});
const openai = new OpenAIApi(configuration);

app.use(bodyParser.json())
app.use(cors())

app.post("/", async(req, res)=>{
    const {message} = req.body;
    console.log(message)
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${message}`,
        max_tokens: 100,
        temperature: 0.5,
      });
    
      res.json({
        message: response.data.choices[0].text,
      })
})

app.use(
	cookieSession({
		name: "session",
		keys: ["cyberwolve"],
		maxAge: 24 * 60 * 60 * 100,
	}) 
);

app.use(passport.initialize());
app.use(passport.session());

app.enable("trust proxy");
app.use(
	cors({
		origin: `${process.env.CLIENT_PORT}`,
		methods: "GET,POST,PUT,DELETE",
		credentials: true,
	})
);

app.use("/auth", authRoute);

const port = process.env.PORT || 3080;
// const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`Listenting on port ${port}...`));
