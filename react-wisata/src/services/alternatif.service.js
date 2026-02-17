import api from "./api";

export const getAllAlternatif = () => {
  return api.get("/admin/wisata");
};

export const getAlternatifById = (id) => {
  return api.get(`/admin/wisata/${id}`);
};

export const createAlternatif = (data) => {
  return api.post("/admin/wisata", data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateAlternatif = (id, data) => {
  return api.put(`/admin/wisata/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteAlternatif = (id) => {
  return api.delete(`/admin/wisata/${id}`);
};
