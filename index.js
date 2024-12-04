// POST route to add an expense
import express from 'express';
import { ExpenseModel, UserModel } from './db.js';
import jwt from "jsonwebtoken";
import authMiddleware from "./auth.js"
import cors from "cors";


const JWT_SECRET = "EXPENSES"

const app = express();

app.use(cors({
    origin: '*',  // Allow only your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allow specific headers
    credentials: true,  // Allow credentials (e.g., cookies, authorization headers)
}));

app.options('*', cors());


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

app.post('/transfer', authMiddleware, async (req, res) => {
    const senderId = req.userId;
    const { recipientUsername, amount, description } = req.body;

    try {
        // Find recipient user
        const recipient = await UserModel.findOne({ name: recipientUsername });
        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found" });
        }

        // Find sender user
        const sender = await UserModel.findById(senderId);
        if (!sender) {
            return res.status(404).json({ message: "Sender not found" });
        }

        // Create sender's expense (negative amount)
        await ExpenseModel.create({
            date: new Date(),
            description: `Transfer to ${recipientUsername}: ${description}`,
            amount: -amount,
            category: 'Transfer',
            userId: senderId,
            transferParty: recipientUsername
        });

        // Create recipient's record (positive amount)
        await ExpenseModel.create({
            date: new Date(),
            description: `Received from ${sender.name}: ${description}`,
            amount: amount,
            category: 'Received',
            userId: recipient._id,
            transferParty: sender.name
        });

        res.json({ message: "Transfer successful!" });
    } catch (error) {
        console.error(error); // Add logging for debugging
        res.status(500).json({ message: "Transfer failed" });
    }
});

// Set the server to listen on a port
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});