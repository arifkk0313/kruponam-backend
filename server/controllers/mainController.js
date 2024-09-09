const PaymentRequest = require("../models/PaymentRequest");
const QRCode = require('qrcode');
const crypto = require('crypto');
const moment = require('moment');
const Booking = require("../models/Booking");

const twilio = require('twilio');



exports.paymentRequesting = async (req, res) => {
    try {
        if (req.file) {
            const path = req.file.path;
            var img_url = req.protocol + "://" + req.headers.host + "/" + path;
            req.body.image = img_url;
        }
        if (!req.body.name || !req.body.phone || !req.body.image || !req.body.department || !req.body.year) {
            return res.status(500).json({
                error: true,
                message: "Please Fill all the fields",
            });
        }
        const exist = await PaymentRequest.findOne({ phone: req.body.phone, status: { $ne: "rejected" } });
        if (exist) {
            return res.status(405).json({
                error: true,
                message: "Already requested please wait !",
            });
        }
        const requested = await PaymentRequest.create({
            name: req.body.name,
            phone: req.body.phone,
            proof: req.body.image,
            department: req.body.department,
            year: req.body.year,
            status: "pending"
        })
        return res.status(200).json({
            data: requested,
        });
    } catch (error) {
        console.error("Error while request:", error);
        return res.status(500).json({
            error: true,
            message: "Error while request",
        });
    }
};
exports.paymentRequestCount = async (req, res) => {
    try {
        const totalRequest = await PaymentRequest.countDocuments().exec();
        const pendingRequest = await PaymentRequest.countDocuments({ status: "pending" }).exec();
        const successRequest = await PaymentRequest.countDocuments({ status: "success" }).exec();
        const rejectedRequest = await PaymentRequest.countDocuments({ status: "rejected" }).exec();

        return res.status(200).json({
            totalRequest: totalRequest,
            pendingRequest: pendingRequest,
            successRequest: successRequest,
            rejectedRequest: rejectedRequest
        });
    } catch (error) {
        console.error("Error while fetching count:", error);
        return res.status(500).json({
            error: true,
            message: "Error while fetching count",
        });
    }
};
exports.ticketView = async (req, res) => {
    try {        
        const {mobile} = req.query
        const ticket = await Booking.findOne({phone:mobile}).lean()
        if(!ticket){
            return res.status(500).json({
                error: true,
                message: "ticket is not available",
            });
        }else{

            return res.status(200).json({
               ticket: ticket,           
            });
        }
    } catch (error) {
        console.error("Error while fetching ticket:", error);
        return res.status(500).json({
            error: true,
            message: "Error while fetching ticket",
        });
    }
};

exports.paymentRequestPending = async (req, res) => {
    try {
        let condition={status:"pending"}
        if (req.query.search) {
            const searchQuery = req.query.search;
            condition.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { phone: { $regex: searchQuery, $options: 'i' } },
                { department: { $regex: searchQuery, $options: 'i' } },
                { year: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        const data = await PaymentRequest.find(condition).sort({ createdAt: 1 })
        return res.status(200).json({
            data: data,
        });
    } catch (error) {
        console.error("Error while fetching data:", error);
        return res.status(500).json({
            error: true,
            message: "Error while fetching data",
        });
    }
};
exports.paymentRequestSuccess = async (req, res) => {
    let condition = {};

    // Add search condition if search query is provided
    if (req.query.search) {
        const searchQuery = req.query.search;
        condition.$or = [
            { name: { $regex: searchQuery, $options: 'i' } },
            { phone: { $regex: searchQuery, $options: 'i' } },
            { department: { $regex: searchQuery, $options: 'i' } },
            { year: { $regex: searchQuery, $options: 'i' } }
        ];
    }

    try {
        const successfulRequests = await Booking.find(condition).sort({createdAt:-1}).exec();
        return res.status(200).json({
            data: successfulRequests
        });
    } catch (error) {
        console.error('Error fetching successful payment requests:', error);
        return res.status(500).json({
            error: true,
            message: 'Error fetching successful payment requests'
        });
    }
};

// const sendWhatsAppMessage = async (phoneNumber, qrCodeUrl) => {
//     try {
//         // Ensure the phone number includes the country code (+91) if not already present
//         const formattedPhoneNumber = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
        
//         await twilioClient.messages.create({
//             body: 'Here is your QR code for entry.',
//             from: 'whatsapp:+14155238886',
//             to: `whatsapp:${formattedPhoneNumber}`, // Phone number in E.164 format
//             mediaUrl: qrCodeUrl
//         });

//         console.log('WhatsApp message sent successfully.');
//     } catch (error) {
//         console.error('Error sending WhatsApp message:', error);
//     }
// };
exports.paymentRequestUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id || !status) {
            return res.status(400).json({
                error: true,
                message: "Please pass the data",
            });
        }

        const updatedRequest = await PaymentRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true } // Return the updated document
        );

        if (!updatedRequest) {
            return res.status(404).json({ message: 'Payment request not found' });
        }

        if (status === "success") {
            // Generate a unique token
            const token = crypto.randomBytes(16).toString('hex');
            const qrData = `http://localhost:3019/api/v2/kruponamverify/${token}`;

            try {
                const qrCodeUrl = await QRCode.toDataURL(qrData);
                const latestBooking = await Booking.findOne().sort({ createdAt: -1 });
                let newBookingId = 100;

                if (latestBooking && latestBooking.bookingId) {
                    newBookingId = latestBooking.bookingId + 1;
                }
                let booking = await Booking.create({
                    bookingId: newBookingId,
                    phone: updatedRequest.phone,
                    department: updatedRequest.department,
                    year: updatedRequest.year,
                    paymentReqeustId: id,
                    name: updatedRequest.name,
                    qrImage: qrCodeUrl,
                    qrToken: token,
                });

                // Send QR code via WhatsApp
                // await sendWhatsAppMessage(updatedRequest.phone, qrCodeUrl);

                return res.status(200).json({
                    data: booking,
                });

            } catch (qrError) {
                console.error("Error generating QR code:", qrError);
                return res.status(500).json({
                    error: true,
                    message: "Error generating QR code",
                });
            }
        }

        // Handle other status cases if needed

    } catch (error) {
        console.error("Error while updating data:", error);
        return res.status(500).json({
            error: true,
            message: "Error while updating data",
        });
    }
};
const fs = require('fs');
const path = require('path');

exports.testing = async (req, res) => {
    try {
        const token = crypto.randomBytes(16).toString('hex');
        const qrData = `http://localhost:3019/api/v2/kruponamverify/${token}`;

        // Define local file path for QR code
        const qrCodeFilePath = path.join(__dirname, '..', '..', 'assets', 'qrcode.png');

        // Generate QR code and save it locally
        await QRCode.toFile(qrCodeFilePath, qrData);
        console.log(`QR code saved to ${qrCodeFilePath}`);

        // Generate the public URL
        const imgUrl = `${req.protocol}://${req.headers.host}/assets/qrcode.png`;
        console.log(imgUrl);

        // Send the QR code via WhatsApp
        // await sendWhatsAppMessage('8111861445', 'https://canto-wp-media.s3.amazonaws.com/app/uploads/2019/08/19194138/image-url-3.jpg');

        res.status(200).json({ message: 'QR code sent successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: true,
            message: 'Error handling QR code',
        });
    }
};
