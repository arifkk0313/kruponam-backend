const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentRequestSchema = new Schema({
    phone: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },      
    proof: {
        type: String,
        required: true
    },  
    department: {
        type: String,
        required: true
    },  
    year: {
        type: String,
        required: true
    },  
    status: {
        type: String,
        required: true
        // rejected , success, pending
    },  
}, {
    versionKey: false,
    timestamps: true,
});

const PaymentRequest = mongoose.model("PaymentRequest", PaymentRequestSchema);

module.exports = PaymentRequest;
