const mongoose = require("mongoose");

const feesSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "student",
            required: true,
        },
        school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin",
            required: true,
        },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "sclass",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["Cash", "Online", "Cheque", "Bank Transfer"],
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        remarks: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("fees", feesSchema);
