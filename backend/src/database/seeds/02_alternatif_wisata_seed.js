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
      deskripsi: 'Telaga Sarangan merupakan destinasi wisata unggulan di Kabupaten Magetan yang terletak di lereng Gunung Lawu pada ketinggian 1.200 mdpl. Dengan udara sejuk dan pemandangan alam yang indah, telaga ini menjadi tujuan favorit wisatawan setiap tahunnya.',
      gambar: 'telaga-sarangan.jpg',
      latitude: -7.6713,
      longitude: 111.2215,
      rating_gmaps: 4.6,
      harga_tiket: 20000,
      atraksi_wisata: 'Telaga dengan view pegunungan asri, Pengunjung dapat menikmati sarangan dengan berkuda, , mengendarai speedboat, terdapat beberapa objek fotografi'
    },
    {
      id_alternatif: 2,
      nama_wisata: 'Telaga Wahyu',
      deskripsi: 'Telaga Wahyu merupakan wisata alam di lereng Gunung Lawu yang menawarkan suasana sejuk, dikelilingi pepohonan cemara dan perbukitan hijau. Lokasinya dekat dengan Telaga Sarangan sehingga mudah dijangkau wisatawan..',
      gambar: 'telaga-wahyu.jpg',
      latitude: -7.6749,
      longitude: 111.2384,
      rating_gmaps: 4.4,
      harga_tiket: 10000,
      atraksi_wisata: 'Di sekitar telaga telah dikembangkan kebun dengan berbagai jenis tanaman seperti buah-buahan, sayuran, tembakau dan kopi serta tanaman hias, terdapat hewan rusa tutul, Pengunjung dapat mengelilingi telaga dengan menaiki becak air , spot memancing, Terdapat spot berfoto (objek fotografi) , harga tiket terjangkau'
    },
    {
      id_alternatif: 3,
      nama_wisata: 'Air Terjun Tirtosari',
      deskripsi: 'Air Terjun Tirtosari adalah destinasi alam dengan ketinggian air terjun sekitar 50 meter yang berada di kawasan Telaga Sarangan. Udara sejuk dan panorama pegunungan menjadikannya tempat yang cocok untuk bersantai..',
      gambar: 'mojosemi.jpg',
      latitude: -7.6690,
      longitude: 111.2132,
      rating_gmaps: 4.5,
      harga_tiket: 25000,
      atraksi_wisata: 'Terdapat banyak spot untuk menyaksikan keindahan air terjun, yakni pada tangga kanan dan kiri, serta pada jembatan di tengah aliran air, terdapat areal berfoto (objek fotografi), Harga tiket terjangkau'
    },
    {
      id_alternatif: 4,
      nama_wisata: 'Hargo Dumilah via Cemoro Sewu',
      deskripsi: 'Hargo Dumilah merupakan puncak tertinggi Gunung Lawu dengan ketinggian 3.265 mdpl. Destinasi ini menjadi tujuan favorit pendaki karena menawarkan pemandangan alam yang spektakuler..',
      gambar: 'sendang-kamal.jpg',
      latitude: -7.5935,
      longitude: 111.4398,
      rating_gmaps: 4.3,
      harga_tiket: 0,
      atraksi_wisata: 'Terdapat banyak spot untuk menyaksikan keindahan alam dari puncak gunung ,Terdapat areal berfoto (objek fotografi) Tugu trianggulasi di puncak gunung sebagai penanda puncak gunung'
    },
    {
      id_alternatif: 5,
      nama_wisata: 'Mojosemi Forest Park',
      deskripsi: 'Mojosemi Forest Park adalah wisata keluarga di lereng Gunung Lawu yang memadukan keindahan hutan pinus dengan berbagai wahana rekreasi dan edukasi yang menarik.',
      gambar: 'dewi-sri.jpg',
      latitude: -7.6253,
      longitude: 111.4586,
      rating_gmaps: 4.4,
      harga_tiket: 5000,
      atraksi_wisata: 'Outbond (paintball, high rope adventure, flying fox) , Terdapat camping ground (deck camp, container forest camp, Lawu forest camp) , Terdapat Mojosemi Dinosaurus Park , Mengelilingi hutan dengan ATV, Menunggang kuda, Wahana memanah, Offroad dengan mobil jeep, Taman dan istana bola , Terdapat spot foto (objek fotografi) '
    },
    {
      id_alternatif: 6,
      nama_wisata: 'Kebun Refugia Magetan',
      deskripsi: 'Kebun Refugia menghadirkan hamparan bunga warna-warni di kaki Gunung Lawu. Selain menjadi tempat wisata favorit, kawasan ini juga berfungsi sebagai sarana edukasi pertanian.',
      gambar: 'kebun-refugia.jpg',
      latitude: -7.6534,
      longitude: 111.2589,
      rating_gmaps: 4.5,
      harga_tiket: 15000,
      atraksi_wisata: 'Kebun bunga dan tanaman hias yang beragam jenis serta warnanya, terdapat lebih dari 60 jenis bunga yang ditanam di sini , Pemandangan alam sekitar sangat indah yakni view area pertanian, perkebunan, serta udara yang sejuk khas dataran tinggi, Di seberang Kebun Bunga Refugia terdapat Pasar Agrobisnis Plaosan yang menyediakan bermacam sayur hasil pertanian sekitar , Terdapat spot foto (objek fotografi)'
    },
    {
      id_alternatif: 7,
      nama_wisata: 'Lawu Green Forest',
      deskripsi: 'Lawu Green Forest menawarkan wisata alam dengan berbagai wahana seru, taman tematik, dan spot foto menarik yang cocok untuk liburan bersama keluarga..',
      gambar: 'genilangit.jpg',
      latitude: -7.7025,
      longitude: 111.2169,
      rating_gmaps: 4.6,
      harga_tiket: 15000,
      atraksi_wisata: 'Tersedia beragam wahana seru, seperti Tamiya Coaster, Luge Cart, Gondola, Jeep dan Rainbow Slide, Area Outbond , Terdapat taman tematik yakni Kampung Salju dan Taman Sakura , Camping ala Korea di Forest Glamour Camp , Kolam renang, Terdapat spot foto (objek fotografi)'
    },
    {
      id_alternatif: 8,
      nama_wisata: 'Tirto Gumarang',
      deskripsi: 'Tirto Gumarang merupakan destinasi wisata di kawasan Cemoro Sewu yang menggabungkan konsep alam, petualangan, dan tempat bersantai dengan latar pemandangan Gunung Lawu.',
      gambar: 'tirtosari.jpg',
      latitude: -7.6775,
      longitude: 111.2163,
      rating_gmaps: 4.5,
      harga_tiket: 15000,
      atraksi_wisata: 'Wahana bermain ATV offroad menyusuri hutan , Kebun stroberi , Camping ground , Terdapat spot foto (objek fotografi)'
    },
    {
      id_alternatif: 9,
      nama_wisata: 'Banyu Biru',
      deskripsi: 'Banyu Biru adalah kolam renang populer di Magetan yang menyediakan berbagai wahana air dan fasilitas rekreasi keluarga dengan harga terjangkau..',
      gambar: 'gunung-blego.jpg',
      latitude: -7.7410,
      longitude: 111.3650,
      rating_gmaps: 4.6,
      harga_tiket: 10000,
      atraksi_wisata: 'Kolam renang anak (kedalaman 0,25 - 1 meter), Kolam renang dewasa (kedalaman 1,25- 2 meter) ,Mini Zoo, Taman bermain anak dan mandi bola,Agrowisata Kebun Anggur , Arena outbound ,Gedung pemutaran film 3 Dimensi,Pemancingan ikan'
    },
    {
      id_alternatif: 10,
      nama_wisata: 'Magetan Green Garden',
      deskripsi: 'Magetan Green Garden merupakan agrowisata edukatif yang memperkenalkan berbagai tanaman unggulan serta aktivitas belajar bercocok tanam dan outbound.',
      gambar: 'puncak-lawu.jpg',
      latitude: -7.6258,
      longitude: 111.1925,
      rating_gmaps: 4.8,
      harga_tiket: 20000,
      atraksi_wisata: '  Terdapat tanaman unik seperti padi hitam, nangka merah, durian merah, hingga beragam sayur dan buah organik , Terkenal dengan keindahan taman buatannya dengan beraneka tanaman yang menjadi daya tarik wisatawan, salah satunya adalah bunga matahari , Terdapat spot foto yang kekinian ,Memiliki wahana outbond , Memiliki ikon agrowisata yakni tanaman buah kurma '
    },
    {
      id_alternatif: 11,
      nama_wisata: 'Parang Hill',
      deskripsi: 'Parang Hill menawarkan panorama alam pegunungan dan menjadi salah satu spot terbaik untuk menikmati keindahan matahari terbit di Magetan.',
      gambar: 'sentra-kulit.jpg',
      latitude: -7.6508,
      longitude: 111.3262,
      rating_gmaps: 4.5,
      harga_tiket: 0,
      atraksi_wisata: 'Obyek wisata Magetan ini juga menyediakan penginapan, dan dua kolam renang terpisah yang sudah support untuk anak anak atau bahkan dewasa , Terdapat spot foto instagenic dan cocok untuk mengabadikan momen saat sunset dan sunrise berupa jembatan '
    },
    {
      id_alternatif: 12,
      nama_wisata: 'Taman Wisata Genilangit',
      deskripsi: 'Taman Wisata Genilangit menyuguhkan keindahan alam kaki Gunung Lawu dengan berbagai spot foto, wahana alam, serta edukasi tentang flora dan fauna.',
      gambar: 'magetan-park.jpg',
      latitude: -7.6481,
      longitude: 111.3308,
      rating_gmaps: 4.3,
      harga_tiket: 25000,
      atraksi_wisata: ' Wisatawan dapat menikmtebing, menawarkan pemandangan dramatis dan adrenalin tinggi saat berfoto ,Terdapat bunga Sakura buatan yang menyajikan suasana musim semi ala Jepang, dilengkapi dengan Japan Corner yang memungkinkan pengunjung merasakan suasana Jepang dengan kostum tradisional kimono beserta properti seperti payung dan pedang yang tersedia untuk disewa , Sky walk yang memungkinkan pengunjung berjalan di ketinggian sambil menikmati pemandangan luas perbukitan hijau di bawahnya,Hutan Pinus yang dilengkapi dengan hammock yang digantung di antara pohon-pohon  '
    },
    {
      id_alternatif: 13,
      nama_wisata: ' Prasasti Sendang Kamal',
      deskripsi: 'Sendang Kamal adalah situs bersejarah peninggalan masa lampau yang menawarkan suasana asri, kolam bersejarah, dan area wisata yang cocok untuk keluarga.',
      gambar: 'randugede.jpg',
      latitude: -7.6432,
      longitude: 111.2845,
      rating_gmaps: 4.4,
      harga_tiket: 10000,
      atraksi_wisata: 'Wisatawan dapat berfoto dengan latar belakang bangunan kolonial bersejarah ,Berwisata sekaligus menambah wawasan sejarah prasasti, Terdapat pasar ramah lingkungan yakni Pasar Nilowati di dalam areal destinasi wisata yang menjajakan kuliner tradisional khas Magetan dengan penjualnya yang menggunakan baju lurik dan pembayaran yang unik menggunakan koin khusus yang dapat dibeli di lokasi , Wisatawan dapat berinteraksi langsung dengan ikan yang ada di Kolam Pemandian Sendang Kamal dan bisa membeli pakan ikan '
    },
    {
      id_alternatif: 14,
      nama_wisata: 'Petirtaan Dewi Sri ',
      deskripsi: 'Petirtaan Dewi Sri merupakan situs budaya dan sejarah berupa pemandian kuno yang menjadi simbol kemakmuran serta sering digunakan dalam berbagai tradisi adat.',
      gambar: 'alun-alun-magetan.jpg',
      latitude: -7.6450,
      longitude: 111.3259,
      rating_gmaps: 4.6,
      harga_tiket: 0,
      atraksi_wisata: 'Air yang mengalir dari arca Dewi Sri konon dipercaya masyarakat sekitar dapat menyembuhkan penyakit , Di sekitar situs terdapat peninggalan arkeologi berupa tujuh miniatur lumbung tujuh fragmen arca satu palung batu satu fragmen yoni satu sumur kuno dan satu fragmen kemuncak, Terdapat agenda festival tahunan yakni Festival Dewi Sri yang meningkatkan kunjungan wisatawan ,   '
    },
    {
      id_alternatif: 15,
      nama_wisata: 'Makam GKR Maduretno',
      deskripsi: 'Makam GKR Maduretno atau Sarean Ratu merupakan destinasi wisata religi yang memiliki nilai sejarah tinggi dan banyak dikunjungi peziarah dari berbagai daerah..',
      gambar: 'gkr-maduretno.jpg',
      latitude: -7.6621,
      longitude: 111.3831,
      rating_gmaps: 4.5,
      harga_tiket: 0,
      atraksi_wisata: 'Adalah wisata sejarah-budaya yang merupakan cagar budaya, Terdapat gazebo yang dapat digunakan untuk istirahat wisatawan,'
    }
  ]);
};