// POST route to add an expense
import express from 'express';
import { ExpenseModel, UserModel } from './db.js';
import jwt from "jsonwebtoken";
import authMiddleware from "./auth.js"
import cors from "cors";


const JWT_SECRET = "EXPENSES"

const app = express();

app.use(cors());

app.use(express.json())

app.post('/signup', async (req, res) => {
    const name = req.body.name;
    const password = req.body.password;

    try {
        const user = await UserModel.create({
            name,
            password
        })
        res.json({
            message: "You are signed up!"
        })
    } catch (error) {
        res.status(400).json({
            message: "Unable to signup, try again later!"
        })
    }
})

app.post('/signin', async (req, res) => {
    const name = req.body.name;
    const password = req.body.password;

    const userSignin = await UserModel.findOne({
        name
    })

    if (userSignin) {
        if (password === userSignin.password) {
            const token = jwt.sign({
                id: userSignin._id
            }, JWT_SECRET)
            res.json({
                token
            })
        } else {
            res.json({
                message: "Incorrect Credentials"
            })
        }
    } else {
        res.json({
            message: "Unable to Sign In!"
        })
    }
})

app.post('/add-expenses', authMiddleware, async (req, res) => {
    const userId = req.userId;
    const date = req.body.date;
    const description = req.body.description;
    const amount = req.body.amount;
    const category = req.body.category;

    try {
        const expenses = await ExpenseModel.create({
            date,
            description,
            amount,
            category,
            userId
        })
        res.json({
            message: "Expense Added Successfully!"
        })
    } catch (error) {
        res.status(403).json({
            message: "Error adding the expenses!"
        })
    }


});

app.get('/all-expenses', authMiddleware, async(req, res) => {
    const userId = req.userId;

    const allExpenses = await ExpenseModel.find({
        userId
    })

    if (allExpenses) {
        res.json({
            allExpenses
        })
    } else {
        res.status(400).json({
            message: "Error fetching expenses!"
        })
    }
})


// Set the server to listen on a port
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});