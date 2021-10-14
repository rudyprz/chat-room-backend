const express = require("express")
const Message = require('../models/Message');

const router = express.Router();

router.route("/").get((req, res, next) =>{
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;

    Message.find().then(result => {
        res.json(result);
    })

})

module.exports = router;