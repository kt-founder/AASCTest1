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


module.exports = router;