import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import PropTypes from 'prop-types';

const validationSchema = Yup.object().shape({
  NAME: Yup.string().required('Vui lòng nhập tên'),
  LAST_NAME: Yup.string().required('Vui lòng nhập họ'),
  EMAILS: Yup.array().of(
    Yup.object().shape({
      VALUE: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
      VALUE_TYPE: Yup.string().required('Vui lòng chọn loại email')
    })
  ),
  PHONES: Yup.array().of(
    Yup.object().shape({
      VALUE: Yup.string()
        .matches(/^[0-9+\-\s()]*$/, 'Số điện thoại không hợp lệ')
        .min(10, 'Số điện thoại phải có ít nhất 10 chữ số')
        .required('Vui lòng nhập số điện thoại'),
      VALUE_TYPE: Yup.string().required('Vui lòng chọn loại số điện thoại')
    })
  ),
  WEBS: Yup.array().of(
    Yup.object().shape({
      VALUE: Yup.string().url('URL không hợp lệ').required('Vui lòng nhập URL'),
      VALUE_TYPE: Yup.string().required('Vui lòng chọn loại website')
    })
  ),
  ADDRESS: Yup.string().required('Vui lòng nhập địa chỉ'),
  ADDRESS_CITY: Yup.string().required('Vui lòng nhập quận/huyện'),
  ADDRESS_REGION: Yup.string().required('Vui lòng nhập phường/xã'),
  ADDRESS_PROVINCE: Yup.string().required('Vui lòng nhập tỉnh/thành phố'),
  ADDRESS_COUNTRY: Yup.string().required('Vui lòng nhập quốc gia'),
  BANKS: Yup.array().of(
    Yup.object().shape({
      BANK_NAME: Yup.string().required('Vui lòng nhập tên ngân hàng'),
      BANK_ACCOUNT: Yup.string().required('Vui lòng nhập số tài khoản')
    })
  )
});

const ContactModal = ({
  isOpen = false,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const formik = useFormik({
    initialValues: {
      NAME: "",
      LAST_NAME: "",
      EMAILS: [],
      PHONES: [],
      WEBS: [],
      ADDRESS: "",
      ADDRESS_CITY: "",
      ADDRESS_REGION: "",
      ADDRESS_PROVINCE: "",
      ADDRESS_COUNTRY: "",
      BANKS: [],
    },
    validationSchema,
    onSubmit: (values) => {
      const payload = {
        NAME: values.NAME,
        LAST_NAME: values.LAST_NAME,
        ADDRESS: values.ADDRESS,
        ADDRESS_REGION: values.ADDRESS_REGION,
        ADDRESS_CITY: values.ADDRESS_CITY,
        ADDRESS_PROVINCE: values.ADDRESS_PROVINCE,
        ADDRESS_COUNTRY: values.ADDRESS_COUNTRY,
        EMAIL: values.EMAILS.map(({ VALUE, VALUE_TYPE, id, DELETE }) => ({
          ...(id ? { ID: id } : {}),
          ...(DELETE ? { DELETE } : { VALUE, VALUE_TYPE }),
        })),
        PHONE: values.PHONES.map(({ VALUE, VALUE_TYPE, id, DELETE }) => ({
          ...(id ? { ID: id } : {}),
          ...(DELETE ? { DELETE } : { VALUE, VALUE_TYPE }),
        })),
        WEB: values.WEBS.map(({ VALUE, VALUE_TYPE, id, DELETE }) => ({
          ...(id ? { ID: id } : {}),
          ...(DELETE ? { DELETE } : { VALUE, VALUE_TYPE }),
        })),
        BANKS: values.BANKS.map(({ BANK_NAME, BANK_ACCOUNT, id, DELETE }) => ({
          ...(id ? { ID: id } : {}),
          ...(DELETE ? { DELETE } : { BANK_NAME, BANK_ACCOUNT }),
        })),
      };
      onSubmit(payload);
    },
  });

  useEffect(() => {
    if (isOpen && initialData) {
      formik.setValues({
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
        ADDRESS: initialData.ADDRESS || "",
        ADDRESS_REGION: initialData.ADDRESS_REGION || "",
        ADDRESS_CITY: initialData.ADDRESS_CITY || "",
        ADDRESS_PROVINCE: initialData.ADDRESS_PROVINCE || "",
        ADDRESS_COUNTRY: initialData.ADDRESS_COUNTRY || "",
        BANKS:
          initialData.BANK_LIST?.map((b) => ({
            id: b.BANK_ID,
            BANK_NAME: b.BANK_NAME,
            BANK_ACCOUNT: b.BANK_ACCOUNT,
          })) || [],
      });
    }
  }, [isOpen, initialData]);

  const handleAddField = (type) => {
    const newItem =
      type === "BANKS"
        ? { BANK_NAME: "", BANK_ACCOUNT: "" }
        : { VALUE: "", VALUE_TYPE: "WORK" };
    formik.setFieldValue(type, [...formik.values[type], newItem]);
  };

  const handleRemoveField = (type, index) => {
    const newArray = [...formik.values[type]];
    newArray[index] = { ...newArray[index], DELETE: "Y" };
    formik.setFieldValue(type, newArray);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded shadow-md w-full max-w-3xl p-6 m-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {mode === "edit" ? "✏️ Cập nhật liên hệ" : "➕ Thêm liên hệ mới"}
        </h2>

        <form onSubmit={formik.handleSubmit} className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col">
            <label htmlFor="LAST_NAME" className="font-medium mb-1">Họ <span className="text-red-500">*</span></label>
            <input
              id="LAST_NAME"
              name="LAST_NAME"
              value={formik.values.LAST_NAME}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`border p-2 ${formik.touched.LAST_NAME && formik.errors.LAST_NAME ? 'border-red-500' : ''}`}
            />
            {formik.touched.LAST_NAME && formik.errors.LAST_NAME && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.LAST_NAME}</div>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="NAME" className="font-medium mb-1">Tên <span className="text-red-500">*</span></label>
            <input
              id="NAME"
              name="NAME"
              value={formik.values.NAME}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`border p-2 ${formik.touched.NAME && formik.errors.NAME ? 'border-red-500' : ''}`}
            />
            {formik.touched.NAME && formik.errors.NAME && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.NAME}</div>
            )}
          </div>

          <div className="col-span-2">
            <label className="font-medium mb-1">📧 Email <span className="text-red-500">*</span></label>
            {formik.values.EMAILS.filter((e) => !e.DELETE).map((email, index) => (
              <div key={email.id || index} className="flex gap-2 mt-1">
                <div className="flex-1">
                  <input
                    value={email.VALUE}
                    onChange={(e) => {
                      const newEmails = [...formik.values.EMAILS];
                      newEmails[index] = { ...newEmails[index], VALUE: e.target.value };
                      formik.setFieldValue('EMAILS', newEmails);
                    }}
                    onBlur={() => formik.setFieldTouched(`EMAILS.${index}.VALUE`, true)}
                    placeholder="Email"
                    className={`border p-2 w-full ${formik.touched.EMAILS?.[index]?.VALUE && formik.errors.EMAILS?.[index]?.VALUE ? 'border-red-500' : ''}`}
                  />
                  {formik.touched.EMAILS?.[index]?.VALUE && formik.errors.EMAILS?.[index]?.VALUE && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.EMAILS[index].VALUE}</div>
                  )}
                </div>
                <select
                  value={email.VALUE_TYPE}
                  onChange={(e) => {
                    const newEmails = [...formik.values.EMAILS];
                    newEmails[index] = { ...newEmails[index], VALUE_TYPE: e.target.value };
                    formik.setFieldValue('EMAILS', newEmails);
                  }}
                  onBlur={() => formik.setFieldTouched(`EMAILS.${index}.VALUE_TYPE`, true)}
                  className={`border p-2 ${formik.touched.EMAILS?.[index]?.VALUE_TYPE && formik.errors.EMAILS?.[index]?.VALUE_TYPE ? 'border-red-500' : ''}`}
                >
                  <option value="WORK">Công việc</option>
                  <option value="HOME">Cá nhân</option>
                  <option value="OTHER">Khác</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveField("EMAILS", index)}
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
            <label className="font-medium mb-1">📱 Số điện thoại <span className="text-red-500">*</span></label>
            {formik.values.PHONES.filter((p) => !p.DELETE).map((phone, index) => (
              <div key={phone.id || index} className="flex gap-2 mt-1">
                <div className="flex-1">
                  <input
                    value={phone.VALUE}
                    onChange={(e) => {
                      const newPhones = [...formik.values.PHONES];
                      newPhones[index] = { ...newPhones[index], VALUE: e.target.value };
                      formik.setFieldValue('PHONES', newPhones);
                    }}
                    onBlur={() => formik.setFieldTouched(`PHONES.${index}.VALUE`, true)}
                    placeholder="Số điện thoại"
                    className={`border p-2 w-full ${formik.touched.PHONES?.[index]?.VALUE && formik.errors.PHONES?.[index]?.VALUE ? 'border-red-500' : ''}`}
                  />
                  {formik.touched.PHONES?.[index]?.VALUE && formik.errors.PHONES?.[index]?.VALUE && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.PHONES[index].VALUE}</div>
                  )}
                </div>
                <select
                  value={phone.VALUE_TYPE}
                  onChange={(e) => {
                    const newPhones = [...formik.values.PHONES];
                    newPhones[index] = { ...newPhones[index], VALUE_TYPE: e.target.value };
                    formik.setFieldValue('PHONES', newPhones);
                  }}
                  onBlur={() => formik.setFieldTouched(`PHONES.${index}.VALUE_TYPE`, true)}
                  className={`border p-2 ${formik.touched.PHONES?.[index]?.VALUE_TYPE && formik.errors.PHONES?.[index]?.VALUE_TYPE ? 'border-red-500' : ''}`}
                >
                  <option value="WORK">Công việc</option>
                  <option value="HOME">Cá nhân</option>
                  <option value="OTHER">Khác</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveField("PHONES", index)}
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
            <label className="font-medium mb-1">🌐 Website <span className="text-red-500">*</span></label>
            {formik.values.WEBS.filter((w) => !w.DELETE).map((web, index) => (
              <div key={web.id || index} className="flex gap-2 mt-1">
                <div className="flex-1">
                  <input
                    value={web.VALUE}
                    onChange={(e) => {
                      const newWebs = [...formik.values.WEBS];
                      newWebs[index] = { ...newWebs[index], VALUE: e.target.value };
                      formik.setFieldValue('WEBS', newWebs);
                    }}
                    onBlur={() => formik.setFieldTouched(`WEBS.${index}.VALUE`, true)}
                    placeholder="URL website"
                    className={`border p-2 w-full ${formik.touched.WEBS?.[index]?.VALUE && formik.errors.WEBS?.[index]?.VALUE ? 'border-red-500' : ''}`}
                  />
                  {formik.touched.WEBS?.[index]?.VALUE && formik.errors.WEBS?.[index]?.VALUE && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.WEBS[index].VALUE}</div>
                  )}
                </div>
                <select
                  value={web.VALUE_TYPE}
                  onChange={(e) => {
                    const newWebs = [...formik.values.WEBS];
                    newWebs[index] = { ...newWebs[index], VALUE_TYPE: e.target.value };
                    formik.setFieldValue('WEBS', newWebs);
                  }}
                  onBlur={() => formik.setFieldTouched(`WEBS.${index}.VALUE_TYPE`, true)}
                  className={`border p-2 ${formik.touched.WEBS?.[index]?.VALUE_TYPE && formik.errors.WEBS?.[index]?.VALUE_TYPE ? 'border-red-500' : ''}`}
                >
                  <option value="WORK">Công việc</option>
                  <option value="HOME">Cá nhân</option>
                  <option value="OTHER">Khác</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleRemoveField("WEBS", index)}
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

          <div className="flex flex-col">
            <label htmlFor="ADDRESS_COUNTRY" className="font-medium mb-1">Quốc gia <span className="text-red-500">*</span></label>
            <input
              id="ADDRESS_COUNTRY"
              name="ADDRESS_COUNTRY"
              value={formik.values.ADDRESS_COUNTRY}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`border p-2 ${formik.touched.ADDRESS_COUNTRY && formik.errors.ADDRESS_COUNTRY ? 'border-red-500' : ''}`}
            />
            {formik.touched.ADDRESS_COUNTRY && formik.errors.ADDRESS_COUNTRY && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.ADDRESS_COUNTRY}</div>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="ADDRESS_PROVINCE" className="font-medium mb-1">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
            <input
              id="ADDRESS_PROVINCE"
              name="ADDRESS_PROVINCE"
              value={formik.values.ADDRESS_PROVINCE}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`border p-2 ${formik.touched.ADDRESS_PROVINCE && formik.errors.ADDRESS_PROVINCE ? 'border-red-500' : ''}`}
            />
            {formik.touched.ADDRESS_PROVINCE && formik.errors.ADDRESS_PROVINCE && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.ADDRESS_PROVINCE}</div>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="ADDRESS_CITY" className="font-medium mb-1">Quận/Huyện <span className="text-red-500">*</span></label>
            <input
              id="ADDRESS_CITY"
              name="ADDRESS_CITY"
              value={formik.values.ADDRESS_CITY}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`border p-2 ${formik.touched.ADDRESS_CITY && formik.errors.ADDRESS_CITY ? 'border-red-500' : ''}`}
            />
            {formik.touched.ADDRESS_CITY && formik.errors.ADDRESS_CITY && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.ADDRESS_CITY}</div>
            )}
          </div>

          <div className="flex flex-col">
            <label htmlFor="ADDRESS_REGION" className="font-medium mb-1">Phường/Xã <span className="text-red-500">*</span></label>
            <input
              id="ADDRESS_REGION"
              name="ADDRESS_REGION"
              value={formik.values.ADDRESS_REGION}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`border p-2 ${formik.touched.ADDRESS_REGION && formik.errors.ADDRESS_REGION ? 'border-red-500' : ''}`}
            />
            {formik.touched.ADDRESS_REGION && formik.errors.ADDRESS_REGION && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.ADDRESS_REGION}</div>
            )}
          </div>

          <div className="col-span-2 flex flex-col">
            <label htmlFor="ADDRESS" className="font-medium mb-1">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
            <input
              id="ADDRESS"
              name="ADDRESS"
              value={formik.values.ADDRESS}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Số nhà, đường..."
              className={`border p-2 ${formik.touched.ADDRESS && formik.errors.ADDRESS ? 'border-red-500' : ''}`}
            />
            {formik.touched.ADDRESS && formik.errors.ADDRESS && (
              <div className="text-red-500 text-xs mt-1">{formik.errors.ADDRESS}</div>
            )}
          </div>

          <div className="col-span-2">
            <label className="font-medium mb-1">🏦 Ngân hàng</label>
            {formik.values.BANKS.filter((b) => !b.DELETE).map((bank, index) => (
              <div key={bank.id || index} className="flex gap-2 mt-1">
                <div className="flex-1">
                  <input
                    value={bank.BANK_NAME}
                    onChange={(e) => {
                      const newBanks = [...formik.values.BANKS];
                      newBanks[index] = { ...newBanks[index], BANK_NAME: e.target.value };
                      formik.setFieldValue('BANKS', newBanks);
                    }}
                    onBlur={() => formik.setFieldTouched(`BANKS.${index}.BANK_NAME`, true)}
                    placeholder="Tên ngân hàng"
                    className={`border p-2 w-full ${formik.touched.BANKS?.[index]?.BANK_NAME && formik.errors.BANKS?.[index]?.BANK_NAME ? 'border-red-500' : ''}`}
                  />
                  {formik.touched.BANKS?.[index]?.BANK_NAME && formik.errors.BANKS?.[index]?.BANK_NAME && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.BANKS[index].BANK_NAME}</div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    value={bank.BANK_ACCOUNT}
                    onChange={(e) => {
                      const newBanks = [...formik.values.BANKS];
                      newBanks[index] = { ...newBanks[index], BANK_ACCOUNT: e.target.value };
                      formik.setFieldValue('BANKS', newBanks);
                    }}
                    onBlur={() => formik.setFieldTouched(`BANKS.${index}.BANK_ACCOUNT`, true)}
                    placeholder="Số tài khoản"
                    className={`border p-2 w-full ${formik.touched.BANKS?.[index]?.BANK_ACCOUNT && formik.errors.BANKS?.[index]?.BANK_ACCOUNT ? 'border-red-500' : ''}`}
                  />
                  {formik.touched.BANKS?.[index]?.BANK_ACCOUNT && formik.errors.BANKS?.[index]?.BANK_ACCOUNT && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.BANKS[index].BANK_ACCOUNT}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveField("BANKS", index)}
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

ContactModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    NAME: PropTypes.string,
    LAST_NAME: PropTypes.string,
    EMAIL_LIST: PropTypes.arrayOf(PropTypes.shape({
      ID: PropTypes.string,
      VALUE: PropTypes.string,
      VALUE_TYPE: PropTypes.string
    })),
    PHONE_LIST: PropTypes.arrayOf(PropTypes.shape({
      ID: PropTypes.string,
      VALUE: PropTypes.string,
      VALUE_TYPE: PropTypes.string
    })),
    WEBSITE_LIST: PropTypes.arrayOf(PropTypes.shape({
      ID: PropTypes.string,
      VALUE: PropTypes.string,
      VALUE_TYPE: PropTypes.string
    })),
    ADDRESS: PropTypes.string,
    ADDRESS_REGION: PropTypes.string,
    ADDRESS_CITY: PropTypes.string,
    ADDRESS_PROVINCE: PropTypes.string,
    ADDRESS_COUNTRY: PropTypes.string,
    BANK_LIST: PropTypes.arrayOf(PropTypes.shape({
      BANK_ID: PropTypes.string,
      BANK_NAME: PropTypes.string,
      BANK_ACCOUNT: PropTypes.string
    }))
  }),
  mode: PropTypes.oneOf(['edit', 'create'])
};

export default ContactModal;
