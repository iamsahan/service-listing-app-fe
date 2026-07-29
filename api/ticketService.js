import { api } from "../utils/api";

export const ticketAPI = {
  sendContactEmail: (data) => api.post("/tickets/contact-us", data),
};
