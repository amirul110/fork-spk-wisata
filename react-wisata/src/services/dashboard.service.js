import api from "./api";

export const getDashboardWisata = () => {
  return api.get("/wisata");
};

export const getDashboardKriteria = () => {
  return api.get("/kriteria");
};
