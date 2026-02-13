/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('alternatif_wisata').del();

  await knex('alternatif_wisata').insert([
    {
      id_alternatif: 1,
      nama_wisata: 'Telaga Sarangan',
      deskripsi: 'Telaga alami di lereng Gunung Lawu dengan pemandangan indah. Pengunjung bisa menikmati perahu, kuliner khas, dan suasana pegunungan yang sejuk.',
      gambar: 'telaga-sarangan.jpg',
      latitude: -7.6696,
      longitude: 111.2123,
      rating_gmaps: 4.6,
      harga_tiket: 20000,
      fasilitas: 'Toilet, Parkir, Perahu, Penginapan, Kuliner',
      waktu_kunjungan: '06:00 - 18:00'
    },
    {
      id_alternatif: 2,
      nama_wisata: 'Gunung Lawu (Cemoro Sewu)',
      deskripsi: 'Gunung berketinggian 3.265 mdpl yang populer untuk pendakian. Jalur Cemoro Sewu menjadi pintu masuk utama dari sisi Magetan.',
      gambar: 'gunung-lawu.jpg',
      latitude: -7.6400,
      longitude: 111.1940,
      rating_gmaps: 4.7,
      harga_tiket: 30000,
      fasilitas: 'Basecamp, Parkir, Jalur Pendakian',
      waktu_kunjungan: '24 Jam'
    },
    {
      id_alternatif: 3,
      nama_wisata: 'Telaga Wahyu',
      deskripsi: 'Telaga kecil yang tenang di kawasan Sarangan dengan spot foto menarik dan warung kuliner di sekitarnya.',
      gambar: 'telaga-wahyu.jpg',
      latitude: -7.6643,
      longitude: 111.2135,
      rating_gmaps: 4.3,
      harga_tiket: 10000,
      fasilitas: 'Parkir, Spot Foto, Warung',
      waktu_kunjungan: '07:00 - 17:00'
    },
    {
      id_alternatif: 4,
      nama_wisata: 'Air Terjun Tirtosari',
      deskripsi: 'Air terjun bertingkat dengan suasana hutan yang asri. Cocok untuk pecinta alam dan fotografi.',
      gambar: 'air-terjun-tirtosari.jpg',
      latitude: -7.6468,
      longitude: 111.2036,
      rating_gmaps: 4.4,
      harga_tiket: 10000,
      fasilitas: 'Parkir, Toilet, Spot Foto',
      waktu_kunjungan: '07:00 - 17:00'
    },
    {
      id_alternatif: 5,
      nama_wisata: 'Air Terjun Pundak Kiwo',
      deskripsi: 'Air terjun tersembunyi di lereng Gunung Lawu. Perjalanan trekking menuju lokasi menjadi daya tarik tersendiri.',
      gambar: 'air-terjun-pundak-kiwo.jpg',
      latitude: -7.6201,
      longitude: 111.1897,
      rating_gmaps: 4.5,
      harga_tiket: 10000,
      fasilitas: 'Parkir, Trekking',
      waktu_kunjungan: '07:00 - 16:00'
    },
    {
      id_alternatif: 6,
      nama_wisata: 'Mojosemi Forest Park',
      deskripsi: 'Taman hutan wisata dengan berbagai wahana outbound, area camping, dan jalur trekking di tengah hutan pinus.',
      gambar: 'mojosemi-forest-park.jpg',
      latitude: -7.6517,
      longitude: 111.1996,
      rating_gmaps: 4.4,
      harga_tiket: 30000,
      fasilitas: 'Camping, Toilet, Parkir, Outbound',
      waktu_kunjungan: '08:00 - 17:00'
    },
    {
      id_alternatif: 7,
      nama_wisata: 'Taman Wisata Genilangit',
      deskripsi: 'Destinasi wisata alam dengan berbagai spot foto instagramable dan pemandangan pegunungan yang memukau.',
      gambar: 'taman-wisata-genilangit.jpg',
      latitude: -7.6419,
      longitude: 111.1769,
      rating_gmaps: 4.3,
      harga_tiket: 15000,
      fasilitas: 'Spot Foto, Parkir, Toilet',
      waktu_kunjungan: '08:00 - 17:00'
    },
    {
      id_alternatif: 8,
      nama_wisata: 'Air Terjun Jomblang',
      deskripsi: 'Air terjun yang dikelilingi tebing dan hutan lebat. Suasananya masih sangat alami dan cocok untuk petualangan.',
      gambar: 'air-terjun-jomblang.jpg',
      latitude: -7.6178,
      longitude: 111.1794,
      rating_gmaps: 4.2,
      harga_tiket: 10000,
      fasilitas: 'Parkir, Trekking',
      waktu_kunjungan: '07:00 - 16:00'
    },
    {
      id_alternatif: 9,
      nama_wisata: 'Taman Rekreasi Refugia',
      deskripsi: 'Taman bunga refugia yang berwarna-warni dengan berbagai jenis bunga. Ideal untuk bersantai dan berfoto.',
      gambar: 'taman-rekreasi-refugia.jpg',
      latitude: -7.6709,
      longitude: 111.2110,
      rating_gmaps: 4.5,
      harga_tiket: 15000,
      fasilitas: 'Toilet, Parkir, Taman Bunga',
      waktu_kunjungan: '07:00 - 17:00'
    },
    {
      id_alternatif: 10,
      nama_wisata: 'Bukit Sekipan Magetan',
      deskripsi: 'Kawasan wisata perbukitan dengan berbagai wahana, spot foto, dan pemandangan alam yang menawan.',
      gambar: 'bukit-sekipan.jpg',
      latitude: -7.6513,
      longitude: 111.1983,
      rating_gmaps: 4.4,
      harga_tiket: 30000,
      fasilitas: 'Spot Foto, Toilet, Parkir',
      waktu_kunjungan: '08:00 - 18:00'
    },
    {
      id_alternatif: 11,
      nama_wisata: 'Waduk Gonggang',
      deskripsi: 'Waduk dengan pemandangan perairan luas yang tenang. Cocok untuk memancing dan menikmati senja.',
      gambar: 'waduk-gonggang.jpg',
      latitude: -7.5301,
      longitude: 111.4048,
      rating_gmaps: 4.3,
      harga_tiket: 5000,
      fasilitas: 'Parkir, Spot Foto',
      waktu_kunjungan: '06:00 - 18:00'
    },
    {
      id_alternatif: 12,
      nama_wisata: 'Air Terjun Kedung Grujug',
      deskripsi: 'Air terjun dengan kolam alami di dasarnya. Perjalanan trekking yang menantang menjadi bagian dari pengalaman.',
      gambar: 'air-terjun-kedung-grujug.jpg',
      latitude: -7.5962,
      longitude: 111.1824,
      rating_gmaps: 4.2,
      harga_tiket: 10000,
      fasilitas: 'Parkir, Trekking',
      waktu_kunjungan: '07:00 - 16:00'
    },
    {
      id_alternatif: 13,
      nama_wisata: 'Air Terjun Sumuran Seloprojo',
      deskripsi: 'Air terjun yang masih alami di kawasan Seloprojo dengan suasana hutan tropis yang rimbun.',
      gambar: 'air-terjun-sumuran.jpg',
      latitude: -7.5937,
      longitude: 111.1911,
      rating_gmaps: 4.4,
      harga_tiket: 10000,
      fasilitas: 'Parkir, Toilet',
      waktu_kunjungan: '07:00 - 17:00'
    },
    {
      id_alternatif: 14,
      nama_wisata: 'Taman Wisata Umbul',
      deskripsi: 'Taman wisata air dengan kolam renang alami berair jernih dari sumber mata air pegunungan.',
      gambar: 'taman-wisata-umbul.jpg',
      latitude: -7.6551,
      longitude: 111.2156,
      rating_gmaps: 4.1,
      harga_tiket: 10000,
      fasilitas: 'Kolam Renang, Toilet, Parkir',
      waktu_kunjungan: '08:00 - 17:00'
    },
    {
      id_alternatif: 15,
      nama_wisata: 'Cemorosewu Park',
      deskripsi: 'Taman wisata di kawasan Cemoro Sewu dengan spot foto dan pemandangan lereng Gunung Lawu.',
      gambar: 'cemorosewu-park.jpg',
      latitude: -7.6408,
      longitude: 111.1932,
      rating_gmaps: 4.3,
      harga_tiket: 15000,
      fasilitas: 'Spot Foto, Parkir',
      waktu_kunjungan: '07:00 - 17:00'
    },
    {
      id_alternatif: 16,
      nama_wisata: 'Gunung Bancak',
      deskripsi: 'Gunung kecil yang cocok untuk pendakian ringan dengan pemandangan kota Magetan dari puncak.',
      gambar: 'gunung-bancak.jpg',
      latitude: -7.6225,
      longitude: 111.1764,
      rating_gmaps: 4.4,
      harga_tiket: 10000,
      fasilitas: 'Trekking, Parkir',
      waktu_kunjungan: '24 Jam'
    },
    {
      id_alternatif: 17,
      nama_wisata: 'Taman Wisata Tirto Gumarang',
      deskripsi: 'Taman wisata air dengan kolam renang dan area bermain anak di lingkungan alam yang asri.',
      gambar: 'tirto-gumarang.jpg',
      latitude: -7.6718,
      longitude: 111.2089,
      rating_gmaps: 4.2,
      harga_tiket: 10000,
      fasilitas: 'Kolam Renang, Parkir',
      waktu_kunjungan: '08:00 - 17:00'
    },
    {
      id_alternatif: 18,
      nama_wisata: 'Air Terjun Krecekan Denu',
      deskripsi: 'Air terjun alami dengan debit air yang deras di tengah hutan. Suasananya sangat sejuk dan menyegarkan.',
      gambar: 'air-terjun-krecekan-denu.jpg',
      latitude: -7.6056,
      longitude: 111.1674,
      rating_gmaps: 4.3,
      harga_tiket: 10000,
      fasilitas: 'Parkir, Trekking',
      waktu_kunjungan: '07:00 - 16:00'
    },
    {
      id_alternatif: 19,
      nama_wisata: 'Taman Bunga Refugia Plaosan',
      deskripsi: 'Taman bunga yang cantik di Plaosan dengan aneka bunga refugia berwarna-warni. Tempat favorit untuk foto.',
      gambar: 'taman-bunga-refugia-plaosan.jpg',
      latitude: -7.6723,
      longitude: 111.2129,
      rating_gmaps: 4.5,
      harga_tiket: 15000,
      fasilitas: 'Spot Foto, Parkir, Toilet',
      waktu_kunjungan: '07:00 - 17:00'
    },
    {
      id_alternatif: 20,
      nama_wisata: 'Bukit Bintang Magetan',
      deskripsi: 'Destinasi wisata malam hari dengan pemandangan lampu kota Magetan dari ketinggian. Romantis dan instagramable.',
      gambar: 'bukit-bintang.jpg',
      latitude: -7.6548,
      longitude: 111.2017,
      rating_gmaps: 4.4,
      harga_tiket: 10000,
      fasilitas: 'Spot Foto, Parkir',
      waktu_kunjungan: '16:00 - 22:00'
    }
  ]);
};
