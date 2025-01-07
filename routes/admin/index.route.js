const systemConfig = require("../../config/system");
const degreeRoutes = require("./degree.route");
const dashboardRoutes = require("./dashboard.route");
const authRoutes = require("./auth.route");
const settingRoutes = require("./setting.route");
const accountRoutes = require("./account.route");
const roleRoutes = require("./role.route");

const settingMiddleware = require("../../middlewares/client/setting.middleware");
const authMiddleware = require("../../middlewares/admin/auth.middlewares");

module.exports = (app) => {
    const PATH_ADMIN = `/${systemConfig.prefixAdmin}`

    app.use(
        PATH_ADMIN + '/dashboard', 
        authMiddleware.requireAuth, 
        dashboardRoutes
    );

    app.use(PATH_ADMIN + '/auth', authRoutes);

    app.use(
        PATH_ADMIN + '/degrees',
        authMiddleware.requireAuth, 
        degreeRoutes
    );

    app.use(
        PATH_ADMIN + '/settings',
        authMiddleware.requireAuth, 
        settingRoutes
    );

    app.use(
        PATH_ADMIN + '/accounts',
        authMiddleware.requireAuth, 
        accountRoutes
    );

    app.use(
        PATH_ADMIN + '/roles',
        authMiddleware.requireAuth, 
        roleRoutes
    );
}

