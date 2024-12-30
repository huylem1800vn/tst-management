const express = require("express");
const router = express.Router();

// có router phải tạo controller
const controller = require("../../controllers/admin/degree.controller");

router.get('/', controller.index);

router.get('/create', controller.create);

router.post('/create', controller.createPost);

router.get('/edit/:id', controller.edit);

router.patch('/edit/:id', controller.editPatch);

router.delete('/delete/:id', controller.deleteDegree);

router.get('/import-database', controller.importDatabase);

router.post('/import-database', controller.importDatabasePost);

module.exports = router;
