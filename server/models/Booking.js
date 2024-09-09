const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
    phone: {
        type: String,
        required: true
    },
    name: {
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
    qrImage: {
        type: String,
    },
    qrToken: {
        type: String,
    },
    qrTokenExpires: {
        type: String,
    },    
    bookingId:{
        type:Number,
        required:true
    },
    paymentReqeustId:{
        type: Schema.Types.ObjectId, ref: "PaymentRequest",
    },
    entrance:{
        type:Boolean,
        default:false,
        required:true
    },

}, {
    versionKey: false,
    timestamps: true,
});

const Booking = mongoose.model("Booking", BookingSchema);

module.exports = Booking;
