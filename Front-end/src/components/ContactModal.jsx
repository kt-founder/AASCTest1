import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const ContactModal = ({
  isOpen = false,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [form, setForm] = useState({
    NAME: "",
    LAST_NAME: "",
    EMAILS: [],
    PHONES: [],
    WEBS: [],
    ADDRESS: "", // Địa chỉ chi tiết (số nhà, đường...)
    ADDRESS_CITY: "", // Quận/Huyện
    ADDRESS_REGION: "", // Phường/Xã
    ADDRESS_PROVINCE: "", // Tỉnh/Thành phố
    ADDRESS_COUNTRY: "", // Quốc gia
    BANKS: [],
  });

  useEffect(() => {
    if (isOpen && initialData) {
      console.log(initialData)
      setForm({
        NAME: initialData.NAME || "",
        LAST_NAME: initialData.LAST_NAME || "",
        EMAILS:
          initialData.EMAIL_LIST?.map((e) => ({
            id: e.ID,
            VALUE: e.VALUE,
            VALUE_TYPE: e.VALUE_TYPE || "WORK",
          })) || [],
        PHONES:
          initialData.PHONE_LIST?.map((p) => ({
            id: p.ID,
            VALUE: p.VALUE,
            VALUE_TYPE: p.VALUE_TYPE || "WORK",
          })) || [],
        WEBS:
          initialData.WEBSITE_LIST?.map((w) => ({
            id: w.ID,
            VALUE: w.VALUE,
            VALUE_TYPE: w.VALUE_TYPE || "WORK",
          })) || [],
        ADDRESS: initialData.ADDRESS|| "",
        ADDRESS_REGION: initialData.ADDRESS_REGION|| "",
        ADDRESS_CITY: initialData.ADDRESS_CITY|| "",
        ADDRESS_PROVINCE: initialData.ADDRESS_PROVINCE|| "",
        ADDRESS_COUNTRY: initialData.ADDRESS_COUNTRY|| "",
        BANKS:
          initialData.BANK_LIST.map((b) => ({
            id: b.BANK_ID,
            BANK_NAME: b.BANK_NAME,
            BANK_ACCOUNT: b.BANK_ACCOUNT,
          })) || [],
        // 👈
      });
    } else {
      setForm({
        NAME: "",
        LAST_NAME: "",
        EMAILS: [],
        PHONES: [],
        WEBS: [],
        ADDRESS: "",
        BANKS: [],
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (type, id, key, value) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      ),
    }));
  };

  const handleAddField = (type) => {
    // const newId = generateId();
    const newItem =
      type === "BANKS"
        ? { BANK_NAME: "", BANK_ACCOUNT: "" }
        : { VALUE: "", VALUE_TYPE: "WORK" };
    setForm((prev) => ({
      ...prev,
      [type]: [...prev[type], { VALUE: "", newItem }],
    }));
  };

  const handleRemoveField = (type, id) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].map((item) =>
        item.id === id ? { ...item, DELETE: "Y" } : item
      ),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      NAME: form.NAME,
      LAST_NAME: form.LAST_NAME,
      ADDRESS: form.ADDRESS,
      ADDRESS_REGION: form.ADDRESS_REGION,
      ADDRESS_CITY: form.ADDRESS_CITY,
      ADDRESS_PROVINCE: form.ADDRESS_PROVINCE,
      ADDRESS_COUNTRY: form.ADDRESS_COUNTRY,
      EMAIL: form.EMAILS.map(({ VALUE, VALUE_TYPE, id, DELETE }) => ({
        ...(id ? { ID: id } : {}),
        ...(DELETE ? { DELETE } : { VALUE, VALUE_TYPE }),
      })),
      PHONE: form.PHONES.map(({ VALUE, VALUE_TYPE, id, DELETE }) => ({
        ...(id ? { ID: id } : {}),
        ...(DELETE ? { DELETE } : { VALUE, VALUE_TYPE }),
      })),
      WEB: form.WEBS.map(({ VALUE, VALUE_TYPE, id, DELETE }) => ({
        ...(id ? { ID: id } : {}),
        ...(DELETE ? { DELETE } : { VALUE, VALUE_TYPE }),
      })),
      BANKS: form.BANKS.map(({ BANK_NAME, BANK_ACCOUNT, id, DELETE }) => ({
        ...(id ? { ID: id } : {}),
        ...(DELETE ? { DELETE } : { BANK_NAME, BANK_ACCOUNT }),
      })),
    };
    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded shadow-md w-full max-w-3xl p-6">
        <h2 className="text-xl font-bold mb-4">
          {mode === "edit" ? "✏️ Cập nhật liên hệ" : "➕ Thêm liên hệ mới"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4 text-sm"
        >
          <input
            name="LAST_NAME"
            value={form.LAST_NAME}
            onChange={handleChange}
            placeholder="Họ"
            className="border p-2"
          />
          <input
            name="NAME"
            value={form.NAME}
            onChange={handleChange}
            placeholder="Tên"
            className="border p-2"
          />

          <div className="col-span-2">
            <label className="font-medium">📧 Email</label>
            {form.EMAILS.filter((e) => !e.DELETE).map((email) => (
              <div key={email.id} className="flex gap-2 mt-1">
                <input
                  value={email.VALUE}
                  onChange={(e) =>
                    handleArrayChange(
                      "EMAILS",
                      email.id,
                      "VALUE",
                      e.target.value
                    )
                  }
                  placeholder="Email"
                  className="border p-2 w-full"
                />
                <select
                  value={email.VALUE_TYPE}
                  onChange={(e) =>
                    handleArrayChange(
                      "EMAILS",
                      email.id,
                      "VALUE_TYPE",
                      e.target.value
                    )
                  }
                  className="border p-2"
                >
                  <option value="WORK">Công việc</option>
                  <option value="HOME">Cá nhân</option>
                  <option value="OTHER">Khác</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveField("EMAILS", email.id)}
                  className="text-red-500"
                >
                  ❌
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddField("EMAILS")}
              className="text-blue-600 mt-2"
            >
              + Thêm email
            </button>
          </div>

          <div className="col-span-2">
            <label className="font-medium">📱 Số điện thoại</label>
            {form.PHONES.filter((p) => !p.DELETE).map((phone) => (
              <div key={phone.id} className="flex gap-2 mt-1">
                <input
                  value={phone.VALUE}
                  onChange={(e) =>
                    handleArrayChange(
                      "PHONES",
                      phone.id,
                      "VALUE",
                      e.target.value
                    )
                  }
                  placeholder="Số điện thoại"
                  className="border p-2 w-full"
                />
                <select
                  value={phone.VALUE_TYPE}
                  onChange={(e) =>
                    handleArrayChange(
                      "PHONES",
                      phone.id,
                      "VALUE_TYPE",
                      e.target.value
                    )
                  }
                  className="border p-2"
                >
                  <option value="WORK">Công việc</option>
                  <option value="HOME">Cá nhân</option>
                  <option value="OTHER">Khác</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveField("PHONES", phone.id)}
                  className="text-red-500"
                >
                  ❌
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddField("PHONES")}
              className="text-blue-600 mt-2"
            >
              + Thêm số
            </button>
          </div>

          <div className="col-span-2">
            <label className="font-medium">🌐 Website</label>
            {form.WEBS.filter((w) => !w.DELETE).map((web) => (
              <div key={web.id} className="flex gap-2 mt-1">
                <input
                  value={web.VALUE}
                  onChange={(e) =>
                    handleArrayChange("WEBS", web.id, "VALUE", e.target.value)
                  }
                  placeholder="URL website"
                  className="border p-2 w-full"
                />
                <select
                  value={web.VALUE_TYPE}
                  onChange={(e) =>
                    handleArrayChange(
                      "WEBS",
                      web.id,
                      "VALUE_TYPE",
                      e.target.value
                    )
                  }
                  className="border p-2"
                >
                  <option value="WORK">Công việc</option>
                  <option value="HOME">Cá nhân</option>
                  <option value="OTHER">Khác</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveField("WEBS", web.id)}
                  className="text-red-500"
                >
                  ❌
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddField("WEBS")}
              className="text-blue-600 mt-2"
            >
              + Thêm website
            </button>
          </div>
          <input
            name="ADDRESS_COUNTRY"
            value={form.ADDRESS_COUNTRY}
            onChange={handleChange}
            placeholder="Quốc gia"
            className="border p-2"
          />
          <input
            name="ADDRESS_PROVINCE"
            value={form.ADDRESS_PROVINCE}
            onChange={handleChange}
            placeholder="Tỉnh/Thành phố"
            className="border p-2"
          />
          <input
            name="ADDRESS_CITY"
            value={form.ADDRESS_CITY}
            onChange={handleChange}
            placeholder="Quận/Huyện"
            className="border p-2"
          />
          <input
            name="ADDRESS_REGION"
            value={form.ADDRESS_REGION}
            onChange={handleChange}
            placeholder="Phường/Xã"
            className="border p-2"
          />

          <input
            name="ADDRESS"
            value={form.ADDRESS}
            onChange={handleChange}
            placeholder="Số nhà, đường (địa chỉ chi tiết)"
            className="border p-2"
          />

          <div className="col-span-2">
            <label className="font-medium">🏦 Ngân hàng</label>
            {form.BANKS.filter((b) => !b.DELETE).map((bank) => (
              <div key={bank.id} className="flex gap-2 mt-1">
                <input
                  value={bank.BANK_NAME}
                  onChange={(e) =>
                    handleArrayChange(
                      "BANKS",
                      bank.id,
                      "BANK_NAME",
                      e.target.value
                    )
                  }
                  placeholder="Tên ngân hàng"
                  className="border p-2 w-full"
                />
                <input
                  value={bank.BANK_ACCOUNT}
                  onChange={(e) =>
                    handleArrayChange(
                      "BANKS",
                      bank.id,
                      "BANK_ACCOUNT",
                      e.target.value
                    )
                  }
                  placeholder="Số tài khoản"
                  className="border p-2 w-full"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveField("BANKS", bank.id)}
                  className="text-red-500"
                >
                  ❌
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => handleAddField("BANKS")}
              className="text-blue-600 mt-2"
            >
              + Thêm ngân hàng
            </button>
          </div>

          <div className="col-span-2 flex justify-end mt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {mode === "edit" ? "Lưu thay đổi" : "Thêm liên hệ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
