/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('alternatif_wisata').del();

  await knex('alternatif_wisata').insert([
    {
      id_alternatif: 1,
      nama_wisata: 'Tanah Lot',
      deskripsi: 'Pura ikonik yang berdiri di atas batu karang di tepi laut. Terkenal dengan pemandangan sunset yang spektakuler dan arsitektur tradisional Bali yang memukau.',
      gambar: 'tanah-lot.jpg',
      latitude: -8.6211,
      longitude: 115.0868,
      rating_gmaps: 4.6,
      harga_tiket: 60000,
      fasilitas: 'Toilet, Parkir, Restoran, Toko Souvenir, Spot Foto',
      waktu_kunjungan: '07:00 - 19:00'
    },
    {
      id_alternatif: 2,
      nama_wisata: 'Pura Uluwatu',
      deskripsi: 'Pura yang terletak di tepi tebing setinggi 70 meter dengan pemandangan Samudra Hindia. Terkenal dengan pertunjukan Tari Kecak saat sunset.',
      gambar: 'pura-uluwatu.jpg',
      latitude: -8.8290,
      longitude: 115.0849,
      rating_gmaps: 4.7,
      harga_tiket: 50000,
      fasilitas: 'Toilet, Parkir, Pertunjukan Tari Kecak, Restoran',
      waktu_kunjungan: '09:00 - 19:00'
    },
    {
      id_alternatif: 3,
      nama_wisata: 'Ubud Monkey Forest',
      deskripsi: 'Hutan lindung yang menjadi habitat alami ratusan monyet ekor panjang Bali. Dilengkapi dengan pura-pura kuno dan jalur trekking yang asri.',
      gambar: 'monkey-forest.jpg',
      latitude: -8.5192,
      longitude: 115.2586,
      rating_gmaps: 4.5,
      harga_tiket: 80000,
      fasilitas: 'Toilet, Parkir, Cafeteria, Spot Foto',
      waktu_kunjungan: '08:30 - 18:00'
    },
    {
      id_alternatif: 4,
      nama_wisata: 'Pantai Kuta',
      deskripsi: 'Pantai terkenal dengan pasir putih yang lembut dan ombak yang cocok untuk surfing pemula. Destinasi favorit untuk menikmati sunset.',
      gambar: 'pantai-kuta.jpg',
      latitude: -8.7184,
      longitude: 115.1686,
      rating_gmaps: 4.4,
      harga_tiket: 0,
      fasilitas: 'Toilet, Parkir, Restoran, Rental Surfboard, Toko',
      waktu_kunjungan: '24 Jam'
    },
    {
      id_alternatif: 5,
      nama_wisata: 'Tegallalang Rice Terrace',
      deskripsi: 'Sawah terasering yang indah dengan sistem subak tradisional Bali. Spot foto Instagram yang sangat populer dengan pemandangan hijau nan asri.',
      gambar: 'tegallalang.jpg',
      latitude: -8.4351,
      longitude: 115.2826,
      rating_gmaps: 4.3,
      harga_tiket: 20000,
      fasilitas: 'Spot Foto, Parkir, Cafeteria, Ayunan',
      waktu_kunjungan: '08:00 - 18:00'
    },
    {
      id_alternatif: 6,
      nama_wisata: 'Tirta Empul',
      deskripsi: 'Pura dengan mata air suci yang digunakan untuk ritual pembersihan. Air yang jernih dan suasana spiritual yang kuat.',
      gambar: 'tirta-empul.jpg',
      latitude: -8.4153,
      longitude: 115.3151,
      rating_gmaps: 4.6,
      harga_tiket: 50000,
      fasilitas: 'Toilet, Parkir, Sarung, Locker, Area Ritual',
      waktu_kunjungan: '08:00 - 18:00'
    },
    {
      id_alternatif: 7,
      nama_wisata: 'Pantai Seminyak',
      deskripsi: 'Pantai dengan beach club mewah dan suasana yang lebih eksklusif. Cocok untuk bersantai sambil menikmati makanan dan minuman.',
      gambar: 'seminyak.jpg',
      latitude: -8.6919,
      longitude: 115.1679,
      rating_gmaps: 4.5,
      harga_tiket: 0,
      fasilitas: 'Beach Club, Restoran, Toilet, Parkir, Spa',
      waktu_kunjungan: '24 Jam'
    },
    {
      id_alternatif: 8,
      nama_wisata: 'Gunung Batur',
      deskripsi: 'Gunung berapi aktif yang populer untuk trekking sunrise. Pemandangan danau Batur dan kaldera yang menakjubkan dari puncak.',
      gambar: 'gunung-batur.jpg',
      latitude: -8.2421,
      longitude: 115.3753,
      rating_gmaps: 4.7,
      harga_tiket: 100000,
      fasilitas: 'Basecamp, Guide, Parkir, Warung',
      waktu_kunjungan: '02:00 - 07:00'
    },
    {
      id_alternatif: 9,
      nama_wisata: 'Nusa Penida',
      deskripsi: 'Pulau eksotis dengan tebing-tebing dramatis dan pantai-pantai tersembunyi. Destinasi favorit untuk snorkeling dan diving.',
      gambar: 'nusa-penida.jpg',
      latitude: -8.7293,
      longitude: 115.5442,
      rating_gmaps: 4.6,
      harga_tiket: 25000,
      fasilitas: 'Penyeberangan, Rental Motor, Toilet, Snorkeling Gear',
      waktu_kunjungan: '08:00 - 17:00'
    },
    {
      id_alternatif: 10,
      nama_wisata: 'Campuhan Ridge Walk',
      deskripsi: 'Jalur trekking di Ubud dengan pemandangan bukit hijau dan lembah yang menenangkan. Cocok untuk jogging atau jalan santai pagi.',
      gambar: 'campuhan-ridge.jpg',
      latitude: -8.5025,
      longitude: 115.2575,
      rating_gmaps: 4.5,
      harga_tiket: 0,
      fasilitas: 'Jalur Trekking, Spot Foto, Warung',
      waktu_kunjungan: '06:00 - 18:00'
    },
    {
      id_alternatif: 11,
      nama_wisata: 'Pantai Sanur',
      deskripsi: 'Pantai yang tenang dengan suasana yang lebih santai. Ideal untuk melihat sunrise dan aktivitas keluarga.',
      gambar: 'sanur.jpg',
      latitude: -8.6873,
      longitude: 115.2620,
      rating_gmaps: 4.4,
      harga_tiket: 0,
      fasilitas: 'Toilet, Parkir, Restoran, Jogging Track, Perahu',
      waktu_kunjungan: '24 Jam'
    },
    {
      id_alternatif: 12,
      nama_wisata: 'Taman Ayun',
      deskripsi: 'Pura kerajaan dengan arsitektur klasik Bali dan taman yang indah. UNESCO World Heritage Site dengan kolam teratai yang menawan.',
      gambar: 'taman-ayun.jpg',
      latitude: -8.5277,
      longitude: 115.1742,
      rating_gmaps: 4.5,
      harga_tiket: 30000,
      fasilitas: 'Toilet, Parkir, Museum, Taman',
      waktu_kunjungan: '08:00 - 18:00'
    },
    {
      id_alternatif: 13,
      nama_wisata: 'Air Terjun Tegenungan',
      deskripsi: 'Air terjun yang mudah diakses dengan kolam alami di dasarnya. Cocok untuk berenang dan berfoto dengan latar air terjun.',
      gambar: 'tegenungan.jpg',
      latitude: -8.5799,
      longitude: 115.2892,
      rating_gmaps: 4.3,
      harga_tiket: 20000,
      fasilitas: 'Toilet, Parkir, Warung, Gazebo',
      waktu_kunjungan: '06:30 - 18:30'
    },
    {
      id_alternatif: 14,
      nama_wisata: 'Pantai Pandawa',
      deskripsi: 'Pantai tersembunyi dengan air jernih dan pasir putih. Diapit oleh tebing-tebing kapur dengan patung lima Pandawa.',
      gambar: 'pandawa.jpg',
      latitude: -8.8461,
      longitude: 115.1817,
      rating_gmaps: 4.5,
      harga_tiket: 15000,
      fasilitas: 'Toilet, Parkir, Warung, Payung, Kanoe',
      waktu_kunjungan: '07:00 - 19:00'
    },
    {
      id_alternatif: 15,
      nama_wisata: 'Pura Besakih',
      deskripsi: 'Pura terbesar dan tersucidi Bali yang terletak di lereng Gunung Agung. Kompleks pura dengan arsitektur megah dan nilai spiritual tinggi.',
      gambar: 'besakih.jpg',
      latitude: -8.3742,
      longitude: 115.4507,
      rating_gmaps: 4.4,
      harga_tiket: 60000,
      fasilitas: 'Toilet, Parkir, Guide, Sarung, Warung',
      waktu_kunjungan: '08:00 - 17:00'
    },
    {
      id_alternatif: 16,
      nama_wisata: 'Jatiluwih Rice Terrace',
      deskripsi: 'Hamparan sawah terasering terluas di Bali, UNESCO World Heritage Site. Pemandangan hijau yang memanjakan mata dengan sistem subak tradisional.',
      gambar: 'jatiluwih.jpg',
      latitude: -8.3664,
      longitude: 115.1325,
      rating_gmaps: 4.6,
      harga_tiket: 40000,
      fasilitas: 'Toilet, Parkir, Restoran, Spot Foto, Trekking',
      waktu_kunjungan: '08:00 - 18:00'
    },
    {
      id_alternatif: 17,
      nama_wisata: 'Pantai Jimbaran',
      deskripsi: 'Pantai dengan deretan restoran seafood di pinggir pantai. Terkenal dengan makan malam romantis sambil menikmati sunset.',
      gambar: 'jimbaran.jpg',
      latitude: -8.7689,
      longitude: 115.1635,
      rating_gmaps: 4.5,
      harga_tiket: 0,
      fasilitas: 'Restoran Seafood, Toilet, Parkir, Spot Foto',
      waktu_kunjungan: '24 Jam'
    },
    {
      id_alternatif: 18,
      nama_wisata: 'Pura Luhur Batukaru',
      deskripsi: 'Pura yang tersembunyi di hutan pegunungan Batukaru. Suasana yang tenang dan mistis dengan kabut pegunungan yang sering menyelimuti.',
      gambar: 'batukaru.jpg',
      latitude: -8.3639,
      longitude: 115.0956,
      rating_gmaps: 4.6,
      harga_tiket: 30000,
      fasilitas: 'Toilet, Parkir, Sarung, Spot Foto',
      waktu_kunjungan: '08:00 - 17:00'
    },
    {
      id_alternatif: 19,
      nama_wisata: 'Pantai Padang Padang',
      deskripsi: 'Pantai kecil yang cantik dengan akses melalui gua di antara batu karang. Populer untuk surfing dan spot film "Eat Pray Love".',
      gambar: 'padang-padang.jpg',
      latitude: -8.8229,
      longitude: 115.1044,
      rating_gmaps: 4.5,
      harga_tiket: 15000,
      fasilitas: 'Toilet, Parkir, Warung, Rental Surfboard',
      waktu_kunjungan: '08:00 - 18:00'
    },
    {
      id_alternatif: 20,
      nama_wisata: 'Garuda Wisnu Kencana (GWK)',
      deskripsi: 'Taman budaya dengan patung Garuda Wisnu Kencana raksasa setinggi 121 meter. Destinasi wisata budaya dengan berbagai pertunjukan seni.',
      gambar: 'gwk.jpg',
      latitude: -8.8101,
      longitude: 115.1669,
      rating_gmaps: 4.5,
      harga_tiket: 125000,
      fasilitas: 'Toilet, Parkir, Restoran, Museum, Theater, Toko',
      waktu_kunjungan: '08:00 - 22:00'
    }
  ]);
};
