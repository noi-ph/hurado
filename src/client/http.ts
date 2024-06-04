import axios from "axios";

const http = new axios.Axios({
  // Some CSRF magic
  // See: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#employing-custom-request-headers-for-ajaxapi
  // Counterpart: middleware.ts
  headers: {
    "X-XSRF-PROTECTION": "1",
  },
  withCredentials: true,
});

export default http;
