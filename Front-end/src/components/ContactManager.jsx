import React, { useEffect, useState } from 'react';
import contactApi from '../api/contactApi';
import ContactModal from './ContactModal';

const ContactManager = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);

  const fetchContacts = async () => {
    try {
      const res = await contactApi.getAll();
      setContacts(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá liên hệ này?")) return;
    try {
      await contactApi.delete(id);
      fetchContacts();
    } catch (err) {
      alert("❌ Lỗi khi xoá liên hệ: " + err.message);
    }
  };

  const handleAddClick = () => {
    setEditContact(null);
    setModalOpen(true);
  };

  const handleEdit = (contact) => {
    const parsedContact = {
      ID: contact.ID,
      NAME: contact.NAME,
      LAST_NAME: contact.LAST_NAME,
      EMAIL: contact.EMAIL?.[0]?.VALUE || '',
      EMAIL_ID: contact.EMAIL?.[0]?.ID || '',
      PHONE: contact.PHONE?.[0]?.VALUE || '',
      PHONE_ID: contact.PHONE?.[0]?.ID || '',
      WEBSITE: contact.WEB?.[0]?.VALUE || '',
      ADDRESS: contact.ADDRESS || '',
      BANK_NAME: contact.UF_CRM_1745240301139 || '',
      BANK_ACCOUNT: contact.UF_CRM_1745240317905 || '',
      // 👇 Thêm mảng đầy đủ
      EMAIL_LIST: contact.EMAIL || [],
      PHONE_LIST: contact.PHONE || [],
      WEBSITE_LIST: contact.WEB || [],
    };
    setEditContact(parsedContact);
    setModalOpen(true);
  };
  

  const handleModalClose = () => {
    setModalOpen(false);
    setEditContact(null);
  };

  const handleModalSubmit = async (formData) => {
    try {
      if (editContact) {
        await contactApi.update(editContact.ID, formData);
      } else {
        await contactApi.create(formData);
      }
      fetchContacts();
      handleModalClose();
    } catch (err) {
      alert("❌ Lỗi khi lưu liên hệ: " + err.message);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📇 Danh sách liên hệ</h1>

      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddClick}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ➕ Thêm liên hệ
        </button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Id</th>
              <th className="p-2 border">Họ</th>
              <th className="p-2 border">Tên</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">SĐT</th>
              <th className="p-2 border">Website</th>
              <th className="p-2 border">Địa chỉ</th>
              {/* <th className="p-2 border">Ngân hàng</th>
              <th className="p-2 border">Số tài khoản</th> */}
              <th className="p-2 border text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.ID} className="hover:bg-gray-50">
                <td className="p-2 border">{c.ID}</td>
                <td className="p-2 border">{c.LAST_NAME}</td>
                <td className="p-2 border">{c.NAME}</td>
                <td className="p-2 border">{c.EMAIL?.[0]?.VALUE || '-'}</td>
                <td className="p-2 border">{c.PHONE?.[0]?.VALUE || '-'}</td>
                <td className="p-2 border">{c.WEB?.[0]?.VALUE || '-'}</td>
                <td className="p-2 border">{c.ADDRESS}</td>
                {/* <td className="p-2 border">{c.UF_CRM_1745240301139 || '-'}</td>
                <td className="p-2 border">{c.UF_CRM_1745240317905 || '-'}</td> */}
                <td className="p-2 border text-center space-x-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    ✏
                  </button>
                  <button
                    onClick={() => handleDelete(c.ID)}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ContactModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editContact}
        mode={editContact ? 'edit' : 'create'}
      />
    </div>
  );
};

export default ContactManager;
