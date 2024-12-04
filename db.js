import mongoose from "mongoose";

await mongoose.connect('mongodb+srv://rvit22bis004rvitm:pDdc4sYM970OcW3L@cluster0.vjpsp.mongodb.net/expense-tracker')

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userSchema = new mongoose.Schema({
    name: { type: String, unique: true},
    password: String
})

const expenseSchema = new mongoose.Schema({
    date: Date,
    description: String,
    amount: Number,
    category: { 
        type: String, 
        enum: ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Other', 'Transfer', 'Received']
    },
    userId: ObjectId,
    transferParty: { type: String, default: null }
});

export const UserModel = mongoose.model('user', userSchema);
export const ExpenseModel = mongoose.model('expense', expenseSchema);