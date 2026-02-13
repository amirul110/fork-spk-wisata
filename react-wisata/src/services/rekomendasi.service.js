import api from "./api";

export const getHasilRekomendasiGlobal = () => {
  return api.get("/rekomendasi/riwayat");
};
