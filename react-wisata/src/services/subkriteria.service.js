import api from "./api";

export const getAllKriteria = () => {
  return api.get("/kriteria");
};

export const getSubKriteriaByKriteria = (idKriteria) => {
  return api.get(`/subkriteria/${idKriteria}`);
};

export const createSubKriteria = (data) => {
  return api.post("/admin/subkriteria", data);
};

export const updateSubKriteria = (id, data) => {
  return api.put(`/admin/subkriteria/${id}`, data);
};

export const deleteSubKriteria = (id) => {
  return api.delete(`/admin/subkriteria/${id}`);
};
