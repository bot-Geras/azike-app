import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"



const app = express()
const PORT = process.env.PORT || 3000


app.use(helmet())
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/health',(req, res) => {

res.json({ status: 'OK', timestamp: new Date().toISOString() });

})


app.listen(PORT, () => {
    console.log(`Connected on port http://localhost:${PORT}`)
})