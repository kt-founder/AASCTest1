const axios = require("axios");
const { saveToken, callBitrix } = require("../services/bitrix.service");
require("dotenv").config();

// Regex đơn giản cho kiểm tra email, số điện thoại, website
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{8,15}$/;
const URL_REGEX = /^https?:\/\/.+$/;
const UF_BANK_FIELD = process.env.UF_BANK_FIELD;
const UF_ACCOUNT_FIELD = process.env.UF_ACCOUNT_FIELD;

// ========== OAuth ==========

exports.handleInstall = async (req, res) => {
  const { AUTH_ID, AUTH_EXPIRES, REFRESH_ID } = req.body;
  if (!AUTH_ID || !REFRESH_ID) return res.status(400).send("Thiếu token");

  await saveToken({
    access_token: AUTH_ID,
    refresh_token: REFRESH_ID,
    expires_in: parseInt(AUTH_EXPIRES),
  });

  res.send("✅ Nhận token từ Bitrix thành công!");
};

exports.handleCallback = async (req, res) => {
  const code = req.query.code;
  try {
    const result = await axios.get("https://oauth.bitrix.info/oauth/token/", {
      params: {
        grant_type: "authorization_code",
        client_id: process.env.BITRIX_CLIENT_ID,
        client_secret: process.env.BITRIX_CLIENT_SECRET,
        redirect_uri: process.env.BITRIX_REDIRECT_URI,
        code,
      },
    });
    await saveToken(result.data);
    res.send("✅ Đã xác thực OAuth thành công!");
  } catch (e) {
    console.error("❌ Callback thất bại:", e.response?.data || e.message);
    res.status(500).send("❌ Callback thất bại");
  }
};

exports.testApi = async (req, res) => {
  try {
    console.log("🔥 Gọi testApi");
    const data = await callBitrix("user.current");
    console.log("✅ testApi thành công");
    res.json(data);
  } catch (e) {
    console.error("❌ Lỗi khi gọi Bitrix API:", e.response?.data || e.message);
    res.status(500).send(e.message || "Lỗi gọi API");
  }
};

// ========== CRUD Liên hệ ==========

exports.getContacts = async (req, res) => {
  try {
    const data = await callBitrix("crm.contact.list", {
      select: ["ID", "NAME", "LAST_NAME", "EMAIL", "PHONE", "ADDRESS", "WEB", UF_ACCOUNT_FIELD, UF_BANK_FIELD],
    });
    // console.log(data)
    res.json(data.result);
  } catch (e) {
    console.error("❌ Lỗi khi lấy danh sách:", e.response?.data || e.message);
    res.status(500).send(e.message || "Lỗi khi lấy danh sách liên hệ");
  }
};

exports.addContact = async (req, res) => {
  try {
    const {
      NAME,
      LAST_NAME,
      EMAIL = [],
      PHONE = [],
      WEB = [],
      ADDRESS,
      ADDRESS_CITY,
      ADDRESS_REGION,
      BANK_NAME,
      BANK_ACCOUNT,
    } = req.body;

    // Chuyển đổi mảng để phù hợp định dạng Bitrix
    const normalize = (list) =>
      list
        .filter(item => !item.DELETE) // bỏ các item đã đánh xoá
        .map(({ VALUE, VALUE_TYPE }) => ({ VALUE, VALUE_TYPE: VALUE_TYPE || 'WORK' }));

    const data = await callBitrix("crm.contact.add", {
      fields: {
        NAME,
        LAST_NAME,
        EMAIL: normalize(EMAIL),
        PHONE: normalize(PHONE),
        WEB: normalize(WEB),
        ADDRESS,
        ADDRESS_CITY,
        ADDRESS_REGION,
        [UF_BANK_FIELD]: BANK_NAME,
        [UF_ACCOUNT_FIELD]: BANK_ACCOUNT,
      },
    });

    res.json({ id: data.result });
  } catch (e) {
    console.error("❌ Lỗi khi thêm liên hệ:", e.response?.data || e.message);
    res.status(500).send(e.message || "Lỗi khi thêm liên hệ");
  }
};


exports.updateContact = async (req, res) => {
  console.log("🧾 Payload nhận được:", req.body);
  try {
    const id = req.params.id;
    const {
      NAME,
      LAST_NAME,
      EMAIL = [],
      PHONE = [],
      WEB = [],
      ADDRESS,
      ADDRESS_CITY,
      ADDRESS_REGION,
      BANK_NAME,
      BANK_ACCOUNT
    } = req.body;

    // Lọc lại mảng để đảm bảo đúng định dạng Bitrix yêu cầu
    const cleanField = (list) =>
      list.map((item) => {
        if (item.DELETE === 'Y') {
          return { ID: item.ID, DELETE: 'Y' };
        }
        const obj = { VALUE: item.VALUE };
        if (item.ID) obj.ID = item.ID;
        if (item.VALUE_TYPE) obj.VALUE_TYPE = item.VALUE_TYPE;
        return obj;
      });

    const data = await callBitrix("crm.contact.update", {
      id,
      fields: {
        NAME,
        LAST_NAME,
        EMAIL: cleanField(EMAIL),
        PHONE: cleanField(PHONE),
        WEB: cleanField(WEB),
        ADDRESS,
        ADDRESS_CITY,
        ADDRESS_REGION,
        [UF_BANK_FIELD]: BANK_NAME,
        [UF_ACCOUNT_FIELD]: BANK_ACCOUNT
      }
    });

    res.json({ result: data });
  } catch (e) {
    console.error("❌ Lỗi khi cập nhật liên hệ:", e.response?.data || e.message);
    res.status(500).send(e.message || "Lỗi khi cập nhật liên hệ");
  }
};


exports.deleteContact = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await callBitrix("crm.contact.delete", { id });
    res.json({ result: data.result });
  } catch (e) {
    console.error("❌ Lỗi khi xoá liên hệ:", e.response?.data || e.message);
    res.status(500).send(e.message || "Lỗi khi xoá liên hệ");
  }
};
