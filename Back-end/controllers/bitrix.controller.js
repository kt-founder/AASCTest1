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
    // 1. Lấy danh sách liên hệ
    const data = await callBitrix("crm.contact.list", {
      select: ["ID", "NAME", "LAST_NAME", "EMAIL", "PHONE", "ADDRESS","ADDRESS_REGION","ADDRESS_CITY","ADDRESS_PROVINCE","ADDRESS_COUNTRY", "WEB"],
    });

    const contacts = data.result;
    const contactIds = contacts.map(contact => contact.ID);

    // 2. Lấy danh sách requisites của các liên hệ
    const requisiteData = await callBitrix("crm.requisite.list", {
      filter: {
        ENTITY_TYPE_ID: 3, // 3 là Contact
        ENTITY_ID: contactIds,
      }
    });

    const requisites = requisiteData.result;

    // 3. Lấy toàn bộ bank detail từ các requisites
    const requisiteIds = requisites.map(r => r.ID);

    const bankDetailsData = await callBitrix("crm.requisite.bankdetail.list", {
      filter: {
        ENTITY_ID: requisiteIds,
      }
    });

    const bankDetails = bankDetailsData.result;

    // 4. Mapping: Contact -> Requisite -> BankDetail
    const enrichedData = contacts.map(contact => {
      const contactRequisite = requisites.find(r => r.ENTITY_ID === contact.ID);
      const bankDetailsForRequisite = contactRequisite
    ? bankDetails.filter(b => b.ENTITY_ID === contactRequisite.ID) // Lấy tất cả các bankDetails
    : [];
    const banks = bankDetailsForRequisite.map(bank => ({
      BANK_ID: bank.ID,
      BANK_NAME: bank.RQ_BANK_NAME,
      BANK_ACCOUNT: bank.RQ_ACC_NUM,
    }));

    return {
      ...contact,
      BANKS: banks.length > 0 ? banks : null,  // Nếu có ngân hàng, trả về mảng, nếu không trả về null
    };
    });

    res.json(enrichedData);
  } catch (e) {
    console.error("❌ Lỗi khi lấy danh sách liên hệ và thông tin ngân hàng:", e.response?.data || e.message);
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
      ADDRESS_COUNTRY,
      ADDRESS_PROVINCE,
      ADDRESS_CITY,
      ADDRESS_REGION,
      BANKS = [], // Mảng chứa thông tin ngân hàng
    } = req.body;

    // Chuyển đổi mảng để phù hợp định dạng Bitrix
    const normalize = (list) =>
      list
        .filter((item) => !item.DELETE) // bỏ các item đã đánh xoá
        .map(({ VALUE, VALUE_TYPE }) => ({
          VALUE,
          VALUE_TYPE: VALUE_TYPE || "WORK",
        }));

    // Tiến hành thêm liên hệ
    const contactData = await callBitrix("crm.contact.add", {
      fields: {
        NAME,
        LAST_NAME,
        EMAIL: normalize(EMAIL),
        PHONE: normalize(PHONE),
        WEB: normalize(WEB),
        ADDRESS,
        ADDRESS_COUNTRY,
        ADDRESS_PROVINCE,
        ADDRESS_CITY,
        ADDRESS_REGION,
      },
    });
    const contactId = contactData.result; // Lấy CONTACT_ID từ liên hệ vừa tạo

    // Kiểm tra xem có Requisite chưa, nếu chưa thì tạo mới
    const requisiteData = await callBitrix("crm.requisite.list", {
      filter: {
        ENTITY_ID: contactId, // Kiểm tra nếu đã có requisite cho contact
        ENTITY_TYPE_ID: 3,    // 3 là ID của đối tượng Contact
      },
    });

    let requisiteId;
    if (requisiteData.result.length === 0) {
      // Nếu không có, tạo mới Requisite
      const newRequisiteData = await callBitrix("crm.requisite.add", {
        fields: {
          ENTITY_TYPE_ID: 3,  // ID của đối tượng Contact
          ENTITY_ID: contactId,  // Liên kết với CONTACT_ID của liên hệ vừa tạo
          PRESET_ID: 1,        // Preset ID của Requisite
          NAME: "BANK",
        },
      });
      requisiteId = newRequisiteData.result;
    } else {
      // Nếu có, lấy ID của Requisite
      requisiteId = requisiteData.result[0].ID;
    }

    // Tiến hành thêm thông tin ngân hàng vào Requisite Bank Detail
    const bankDetails = [];
    for (const bank of BANKS) {
      const bankDetail = await callBitrix("crm.requisite.bankdetail.add", {
        fields: {
          ENTITY_ID: requisiteId, // Liên kết với Requisite
          NAME:"BANK",
          RQ_BANK_NAME: bank.BANK_NAME,
          RQ_ACC_NUM: bank.BANK_ACCOUNT,
        },
      });
      bankDetails.push(bankDetail.result);
    }

    res.json({ contactId, requisiteId, bankDetails });
  } catch (e) {
    console.error("❌ Lỗi khi thêm liên hệ và thông tin ngân hàng:", e.response?.data || e.message);
    res.status(500).send(e.message || "Lỗi khi thêm liên hệ và thông tin ngân hàng");
  }
};

exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      NAME,
      LAST_NAME,
      EMAIL = [],
      PHONE = [],
      WEB = [],
      ADDRESS,
      ADDRESS_COUNTRY,
      ADDRESS_PROVINCE,
      ADDRESS_CITY,
      ADDRESS_REGION,
      BANKS = [],
    } = req.body;
    console.log("🔹 Payload nhận được:", req.body);

    const cleanField = (list) =>
      list.map((item) => {
        if (item.DELETE === 'Y') return { ID: item.ID, DELETE: 'Y' };
        const obj = { VALUE: item.VALUE };
        if (item.ID) obj.ID = item.ID;
        if (item.VALUE_TYPE) obj.VALUE_TYPE = item.VALUE_TYPE;
        return obj;
      });

    console.log("🔹 Đang cập nhật thông tin liên hệ...");
    const data = await callBitrix("crm.contact.update", {
      id,
      fields: {
        NAME,
        LAST_NAME,
        EMAIL: cleanField(EMAIL),
        PHONE: cleanField(PHONE),
        WEB: cleanField(WEB),
        ADDRESS,
        ADDRESS_COUNTRY,
        ADDRESS_PROVINCE,
        ADDRESS_CITY,
        ADDRESS_REGION,
      }
    });
    console.log("✅ Cập nhật liên hệ thành công:", data);

    console.log("🔹 Lấy danh sách Requisite liên quan đến Contact ID:", id);
    const requisiteData = await callBitrix("crm.requisite.list", {
      filter: {
        ENTITY_ID: id,
        ENTITY_TYPE_ID: 3,
      },
    });

    if (requisiteData.result.length === 0) {
      console.warn("⚠️ Không tìm thấy Requisite.");
      return res.status(400).send("Không tìm thấy Requisite cho liên hệ này.");
    }

    const requisiteId = requisiteData.result[0].ID;
    console.log("✅ Lấy Requisite ID:", requisiteId);

    const bankDetails = [];
    for (const bank of BANKS) {
      console.log("🔹 Xử lý ngân hàng:", bank);
      if (bank.ID) {
        if (bank.DELETE === 'Y') {
          console.log("🗑️ Đang xóa ngân hàng ID:", bank.ID);
          const result = await callBitrix('crm.requisite.bankdetail.delete', {
            id: bank.ID,
          });
          console.log("✅ Đã xóa:", result);
          bankDetails.push({ ID: bank.ID, deleted: true });
        } else {
          console.log("✏️ Đang cập nhật ngân hàng ID:", bank.ID);
          const result = await callBitrix('crm.requisite.bankdetail.update', {
            id: bank.ID,
            fields: {
              RQ_BANK_NAME: bank.BANK_NAME,
              RQ_ACC_NUM: bank.BANK_ACCOUNT,
            }
          });
          console.log("✅ Cập nhật ngân hàng thành công:", result);
          bankDetails.push({ ID: bank.ID, updated: true });
        }
      } else {
        console.log("➕ Thêm mới thông tin ngân hàng:", bank);
        const result = await callBitrix('crm.requisite.bankdetail.add', {
          fields: {
            ENTITY_ID: requisiteId,
            NAME: "BANK",
            RQ_BANK_NAME: bank.BANK_NAME,
            RQ_ACC_NUM: bank.BANK_ACCOUNT,
          }
        });
        console.log("✅ Thêm ngân hàng thành công:", result);
        bankDetails.push(result.result);
      }
    }

    res.json({ result: data, bankDetails });
  } catch (e) {
    console.error("❌ Lỗi khi cập nhật liên hệ và ngân hàng:", e.response?.data || e.message);
    res.status(500).send(e.message || "Lỗi khi cập nhật liên hệ và ngân hàng");
  }
};



exports.deleteContact = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("🔹 Bắt đầu xoá liên hệ với ID:", id);

    // Xóa thông tin liên hệ
    const data = await callBitrix("crm.contact.delete", { id });
    console.log("✅ Xoá liên hệ thành công:", data);
  } catch (e) {
    console.error("❌ Lỗi khi xoá liên hệ và thông tin ngân hàng:", e.response?.data || e.message);
    res.status(500).send(e.message || "Lỗi khi xoá liên hệ và thông tin ngân hàng");
  }
};
