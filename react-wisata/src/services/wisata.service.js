import api from "./api";

export const getAllWisata = () => {
  return api.get("/wisata");
};
