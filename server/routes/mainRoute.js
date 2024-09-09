const express = require("express");
const router = express.Router();
const mainController = require("../controllers/mainController");
const multer = require("multer");
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "assets/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
let upload = multer({ storage: storage });


router.post("/payment-request", upload.single("image"), mainController.paymentRequesting);
router.get("/payment-request-count",  mainController.paymentRequestCount);
router.get("/payment-request-pending", mainController.paymentRequestPending);
router.patch("/payment-request-update/:id", mainController.paymentRequestUpdate);
router.get("/payment-request-success", mainController.paymentRequestSuccess);
router.get("/ticket", mainController.ticketView);
router.get("/test", mainController.testing);


module.exports = router;
