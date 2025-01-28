const express = require("express");
const router = express.Router();
const homeRoutes = require("./home.route");
const degreeRoutes = require("./degree.route");
const userRoutes = require("./user.route");
const settingMiddleware = require("../../middlewares/client/setting.middleware");
const userMiddleware = require("../../middlewares/client/user.middleware");

module.exports = (app) => {

    // để tất cả các trang đều chạy qua middleware này
    app.use(settingMiddleware.settingGeneral);

    app.use(userMiddleware.infoUser);

    app.use('/', homeRoutes);

    app.use('/searchDegree', degreeRoutes);

    app.use('/user', userRoutes);
}