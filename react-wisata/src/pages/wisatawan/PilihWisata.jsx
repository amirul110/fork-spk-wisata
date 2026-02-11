import { useEffect, useState } from "react";
import { getAllWisata } from "../../services/wisata.service";

export default function PilihWisata() {
  const [wisataList, setWisataList] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchWisata = async () => {
      try {
        const res = await getAllWisata();
        console.log("DATA WISATA:", res.data.data.list_wisata);
        setWisataList(res.data.data.list_wisata);
      } catch (err) {
        console.error("Gagal ambil data wisata", err);
      }
    };

    fetchWisata();
  }, []);

  return (
    <div>
      <h3>Memilih Wisata yang diminati</h3>

      {wisataList.length === 0 && <p>Loading wisata...</p>}

      {wisataList.map((w) => (
        <label key={w.id_alternatif} style={{ display: "block" }}>
          <input
            type="checkbox"
            value={w.id_alternatif}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelected((prev) =>
                e.target.checked
                  ? [...prev, id]
                  : prev.filter((x) => x !== id)
              );
            }}
          />
          {w.nama_wisata}
        </label>
      ))}
    </div>
  );
}
