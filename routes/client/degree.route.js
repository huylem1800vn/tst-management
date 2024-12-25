const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/degree.controller");

router.get('/', controller.searchDegree);

module.exports = router;