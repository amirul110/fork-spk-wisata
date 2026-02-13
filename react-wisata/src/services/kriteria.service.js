import api from "./api";

export const getAllKriteria = () => {
  return api.get("/kriteria");
};

export const createKriteria = (data) => {
  return api.post("/admin/kriteria", data);
};

export const updateKriteria = (id, data) => {
  return api.put(`/admin/kriteria/${id}`, data);
};

export const deleteKriteria = (id) => {
  return api.delete(`/admin/kriteria/${id}`);
};
