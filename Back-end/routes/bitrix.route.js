const express = require("express");
const router = express.Router();
const controller = require("../controllers/bitrix.controller");

router.post("/install", controller.handleInstall);
router.get("/oauth/callback", controller.handleCallback);
router.get("/test-api", controller.testApi);
// Thêm vào dưới các dòng hiện có
router.get("/contacts", controller.getContacts);
router.post("/contacts", controller.addContact);
router.put("/contacts/:id", controller.updateContact);
router.delete("/contacts/:id", controller.deleteContact);
// // Thêm các route mới cho CRM Requisite
// router.post('/add-requisite', controller.addRequisite);        // Thêm thông tin ngân hàng
// router.put('/update-requisite/:id', controller.updateRequisite); // Cập nhật thông tin ngân hàng
// router.delete('/requisites/:id', controller.deleteRequisite); // Xóa thông tin ngân hàng


module.exports = router;