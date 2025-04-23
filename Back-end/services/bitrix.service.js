const axios = require("axios");
const db = require("../db/db");
require("dotenv").config();


async function saveToken({ access_token, refresh_token, expires_in }) {
  
  const obtained_at = Date.now();
  await db.query("DELETE FROM tokens");
  await db.query(
    "INSERT INTO tokens (access_token, refresh_token, expires_in, obtained_at) VALUES (?, ?, ?, ?)",
    [access_token, refresh_token, expires_in, obtained_at]
  );
}

async function getToken() {
  const [rows] = await db.query("SELECT * FROM tokens LIMIT 1");
  return rows[0];
}

async function refreshToken(refresh_token) {
  try {
    const res = await axios.get("https://oauth.bitrix.info/oauth/token/", {
      params: {
        grant_type: "refresh_token",
        client_id: process.env.BITRIX_CLIENT_ID,
        client_secret: process.env.BITRIX_CLIENT_SECRET,
        refresh_token,
      },
    });
    await saveToken(res.data);
    console.log("OK")
    return res.data.access_token;
  } catch (err) {
    console.error("❌ Lỗi khi refresh token:", err.response?.data || err.message);
    throw err;
  }
}


async function getAccessToken() {
  const token = await getToken();
  const buffer = 60 * 1000; // chừa 1 phút
  const expired = Date.now() - token.obtained_at >= token.expires_in * 1000 - buffer;
  return expired ? await refreshToken(token.refresh_token) : token.access_token;
}

async function callBitrix(method, payload = {}) {
  try {
    const token = await getAccessToken();
    const url = `${process.env.BITRIX_API_DOMAIN}/rest/${method}`;
    // console.log(payload);
    const res = await axios.get(url, { params: { ...payload, auth: token } });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401)
      throw new Error("Token expired or invalid");
    if (err.code === "ECONNABORTED") throw new Error("Timeout");
    throw err;
  }
}

module.exports = {
  saveToken,
  getAccessToken,
  callBitrix,
};
