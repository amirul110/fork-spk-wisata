-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 17, 2026 at 01:01 PM
-- Server version: 8.0.30
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `spk_wisata_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id_admin` int UNSIGNED NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id_admin`, `username`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'admin@wisata.com', '$2b$10$MI9y/2ogOvEMNinI/HI4KeVix8M9/.Sa/hJmiTTW.BmrlrTBPGySK', '2026-02-17 13:00:38', '2026-02-17 13:00:38');

-- --------------------------------------------------------

--
-- Table structure for table `alternatif_wisata`
--

CREATE TABLE `alternatif_wisata` (
  `id_alternatif` int UNSIGNED NOT NULL,
  `nama_wisata` varchar(100) NOT NULL,
  `deskripsi` text,
  `gambar` varchar(255) DEFAULT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `rating_gmaps` double NOT NULL,
  `harga_tiket` double NOT NULL,
  `fasilitas` text NOT NULL,
  `waktu_kunjungan` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `alternatif_wisata`
--

INSERT INTO `alternatif_wisata` (`id_alternatif`, `nama_wisata`, `deskripsi`, `gambar`, `latitude`, `longitude`, `rating_gmaps`, `harga_tiket`, `fasilitas`, `waktu_kunjungan`, `created_at`, `updated_at`) VALUES
(1, 'Telaga Sarangan', 'Telaga alami di lereng Gunung Lawu dengan pemandangan indah. Pengunjung bisa menikmati perahu, kuliner khas, dan suasana pegunungan yang sejuk.', 'telaga-sarangan.jpg', -7.6696, 111.2123, 4.6, 20000, 'Toilet, Parkir, Perahu, Penginapan, Kuliner', '06:00 - 18:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(2, 'Gunung Lawu (Cemoro Sewu)', 'Gunung berketinggian 3.265 mdpl yang populer untuk pendakian. Jalur Cemoro Sewu menjadi pintu masuk utama dari sisi Magetan.', 'gunung-lawu.jpg', -7.64, 111.194, 4.7, 30000, 'Basecamp, Parkir, Jalur Pendakian', '24 Jam', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(3, 'Telaga Wahyu', 'Telaga kecil yang tenang di kawasan Sarangan dengan spot foto menarik dan warung kuliner di sekitarnya.', 'telaga-wahyu.jpg', -7.6643, 111.2135, 4.3, 10000, 'Parkir, Spot Foto, Warung', '07:00 - 17:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(4, 'Air Terjun Tirtosari', 'Air terjun bertingkat dengan suasana hutan yang asri. Cocok untuk pecinta alam dan fotografi.', 'air-terjun-tirtosari.jpg', -7.6468, 111.2036, 4.4, 10000, 'Parkir, Toilet, Spot Foto', '07:00 - 17:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(5, 'Air Terjun Pundak Kiwo', 'Air terjun tersembunyi di lereng Gunung Lawu. Perjalanan trekking menuju lokasi menjadi daya tarik tersendiri.', 'air-terjun-pundak-kiwo.jpg', -7.6201, 111.1897, 4.5, 10000, 'Parkir, Trekking', '07:00 - 16:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(6, 'Mojosemi Forest Park', 'Taman hutan wisata dengan berbagai wahana outbound, area camping, dan jalur trekking di tengah hutan pinus.', 'mojosemi-forest-park.jpg', -7.6517, 111.1996, 4.4, 30000, 'Camping, Toilet, Parkir, Outbound', '08:00 - 17:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(7, 'Taman Wisata Genilangit', 'Destinasi wisata alam dengan berbagai spot foto instagramable dan pemandangan pegunungan yang memukau.', 'taman-wisata-genilangit.jpg', -7.6419, 111.1769, 4.3, 15000, 'Spot Foto, Parkir, Toilet', '08:00 - 17:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(8, 'Air Terjun Jomblang', 'Air terjun yang dikelilingi tebing dan hutan lebat. Suasananya masih sangat alami dan cocok untuk petualangan.', 'air-terjun-jomblang.jpg', -7.6178, 111.1794, 4.2, 10000, 'Parkir, Trekking', '07:00 - 16:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(9, 'Taman Rekreasi Refugia', 'Taman bunga refugia yang berwarna-warni dengan berbagai jenis bunga. Ideal untuk bersantai dan berfoto.', 'taman-rekreasi-refugia.jpg', -7.6709, 111.211, 4.5, 15000, 'Toilet, Parkir, Taman Bunga', '07:00 - 17:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(10, 'Bukit Sekipan Magetan', 'Kawasan wisata perbukitan dengan berbagai wahana, spot foto, dan pemandangan alam yang menawan.', 'bukit-sekipan.jpg', -7.6513, 111.1983, 4.4, 30000, 'Spot Foto, Toilet, Parkir', '08:00 - 18:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(11, 'Waduk Gonggang', 'Waduk dengan pemandangan perairan luas yang tenang. Cocok untuk memancing dan menikmati senja.', 'waduk-gonggang.jpg', -7.5301, 111.4048, 4.3, 5000, 'Parkir, Spot Foto', '06:00 - 18:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(12, 'Air Terjun Kedung Grujug', 'Air terjun dengan kolam alami di dasarnya. Perjalanan trekking yang menantang menjadi bagian dari pengalaman.', 'air-terjun-kedung-grujug.jpg', -7.5962, 111.1824, 4.2, 10000, 'Parkir, Trekking', '07:00 - 16:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(13, 'Air Terjun Sumuran Seloprojo', 'Air terjun yang masih alami di kawasan Seloprojo dengan suasana hutan tropis yang rimbun.', 'air-terjun-sumuran.jpg', -7.5937, 111.1911, 4.4, 10000, 'Parkir, Toilet', '07:00 - 17:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(14, 'Taman Wisata Umbul', 'Taman wisata air dengan kolam renang alami berair jernih dari sumber mata air pegunungan.', 'taman-wisata-umbul.jpg', -7.6551, 111.2156, 4.1, 10000, 'Kolam Renang, Toilet, Parkir', '08:00 - 17:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(15, 'Cemorosewu Park', 'Taman wisata di kawasan Cemoro Sewu dengan spot foto dan pemandangan lereng Gunung Lawu.', 'cemorosewu-park.jpg', -7.6408, 111.1932, 4.3, 15000, 'Spot Foto, Parkir', '07:00 - 17:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(16, 'Gunung Bancak', 'Gunung kecil yang cocok untuk pendakian ringan dengan pemandangan kota Magetan dari puncak.', 'gunung-bancak.jpg', -7.6225, 111.1764, 4.4, 10000, 'Trekking, Parkir', '24 Jam', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(17, 'Taman Wisata Tirto Gumarang', 'Taman wisata air dengan kolam renang dan area bermain anak di lingkungan alam yang asri.', 'tirto-gumarang.jpg', -7.6718, 111.2089, 4.2, 10000, 'Kolam Renang, Parkir', '08:00 - 17:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(18, 'Air Terjun Krecekan Denu', 'Air terjun alami dengan debit air yang deras di tengah hutan. Suasananya sangat sejuk dan menyegarkan.', 'air-terjun-krecekan-denu.jpg', -7.6056, 111.1674, 4.3, 10000, 'Parkir, Trekking', '07:00 - 16:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(19, 'Taman Bunga Refugia Plaosan', 'Taman bunga yang cantik di Plaosan dengan aneka bunga refugia berwarna-warni. Tempat favorit untuk foto.', 'taman-bunga-refugia-plaosan.jpg', -7.6723, 111.2129, 4.5, 15000, 'Spot Foto, Parkir, Toilet', '07:00 - 17:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(20, 'Bukit Bintang Magetan', 'Destinasi wisata malam hari dengan pemandangan lampu kota Magetan dari ketinggian. Romantis dan instagramable.', 'bukit-bintang.jpg', -7.6548, 111.2017, 4.4, 10000, 'Spot Foto, Parkir', '16:00 - 22:00', '2026-02-17 13:00:38', '2026-02-17 13:00:38');

-- --------------------------------------------------------

--
-- Table structure for table `hasil_rekomendasi`
--

CREATE TABLE `hasil_rekomendasi` (
  `id_hasil` int UNSIGNED NOT NULL,
  `id_preferensi` int UNSIGNED DEFAULT NULL,
  `id_alternatif` int UNSIGNED DEFAULT NULL,
  `jarak_km_hasil` double NOT NULL,
  `skor_akhir_wp` double NOT NULL,
  `ranking` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `hasil_rekomendasi`
--

INSERT INTO `hasil_rekomendasi` (`id_hasil`, `id_preferensi`, `id_alternatif`, `jarak_km_hasil`, `skor_akhir_wp`, `ranking`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 12.5, 0.875, 1, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(2, 1, 1, 5.2, 0.75, 2, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(3, 1, 3, 25, 0.62, 3, '2026-02-17 13:00:38', '2026-02-17 13:00:38');

-- --------------------------------------------------------

--
-- Table structure for table `knex_migrations`
--

CREATE TABLE `knex_migrations` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `batch` int DEFAULT NULL,
  `migration_time` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `knex_migrations`
--

INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES
(1, '20260112002013_create_admin_table.js', 1, '2026-02-17 12:58:45'),
(2, '20260112002041_create_wisatawan_table.js', 1, '2026-02-17 12:58:45'),
(3, '20260112002112_create_alternatif_wisata_table.js', 1, '2026-02-17 12:58:45'),
(4, '20260112002137_create_kriteria_table.js', 1, '2026-02-17 12:58:45'),
(5, '20260112002230_create_sub_kriteria_table.js', 1, '2026-02-17 12:58:45'),
(6, '20260112002248_create_preferensi_wisatawan_table.js', 1, '2026-02-17 12:58:45'),
(7, '20260112002304_create_hasil_rekomendasi_table.js', 1, '2026-02-17 12:58:45'),
(8, '20260117051129_create_riwayat_pencarian_table.js', 1, '2026-02-17 12:58:45'),
(9, '20260117051202_create_token_blacklist_table.js', 1, '2026-02-17 12:58:45'),
(10, '20260217011346_create_pertanyaan_preferensi_table.js', 1, '2026-02-17 12:58:45'),
(11, '20260217081500_fix_kriteria_auto_increment.js', 1, '2026-02-17 12:58:45');

-- --------------------------------------------------------

--
-- Table structure for table `knex_migrations_lock`
--

CREATE TABLE `knex_migrations_lock` (
  `index` int UNSIGNED NOT NULL,
  `is_locked` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `knex_migrations_lock`
--

INSERT INTO `knex_migrations_lock` (`index`, `is_locked`) VALUES
(1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `kriteria`
--

CREATE TABLE `kriteria` (
  `id_kriteria` int UNSIGNED NOT NULL,
  `nama_kriteria` varchar(50) NOT NULL,
  `bobot_prioritas` float(8,2) NOT NULL,
  `jenis` enum('cost','benefit') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deskripsi` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `kriteria`
--

INSERT INTO `kriteria` (`id_kriteria`, `nama_kriteria`, `bobot_prioritas`, `jenis`, `created_at`, `updated_at`, `deskripsi`) VALUES
(1, 'Harga Tiket', 0.30, 'cost', '2026-02-17 13:00:38', '2026-02-17 13:00:38', 'Seberapa penting harga tiket bagi Anda?'),
(2, 'Fasilitas', 0.25, 'benefit', '2026-02-17 13:00:38', '2026-02-17 13:00:38', 'Seberapa penting fasilitas wisata bagi Anda?'),
(3, 'Jarak', 0.20, 'cost', '2026-02-17 13:00:38', '2026-02-17 13:00:38', 'Seberapa penting jarak dari lokasi Anda?'),
(4, 'Rating', 0.15, 'benefit', '2026-02-17 13:00:38', '2026-02-17 13:00:38', 'Seberapa penting rating Google Maps?'),
(5, 'Waktu Kunjungan', 0.10, 'benefit', '2026-02-17 13:00:38', '2026-02-17 13:00:38', 'Seberapa penting jam operasional wisata?');

-- --------------------------------------------------------

--
-- Table structure for table `preferensi_wisatawan`
--

CREATE TABLE `preferensi_wisatawan` (
  `id_preferensi` int UNSIGNED NOT NULL,
  `id_wisatawan` int UNSIGNED NOT NULL,
  `waktu_akses` datetime DEFAULT CURRENT_TIMESTAMP,
  `user_latitude` double NOT NULL,
  `user_longitude` double NOT NULL,
  `data_preferensi` text,
  `id_sub_harga` int UNSIGNED DEFAULT NULL,
  `id_sub_fasilitas` int UNSIGNED DEFAULT NULL,
  `id_sub_waktu_kunjungan` int UNSIGNED DEFAULT NULL,
  `id_sub_rating` int UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `preferensi_wisatawan`
--

INSERT INTO `preferensi_wisatawan` (`id_preferensi`, `id_wisatawan`, `waktu_akses`, `user_latitude`, `user_longitude`, `data_preferensi`, `id_sub_harga`, `id_sub_fasilitas`, `id_sub_waktu_kunjungan`, `id_sub_rating`, `created_at`, `updated_at`) VALUES
(1, 1, '2026-02-17 20:00:38', -8.65, 115.21, NULL, 2, 7, 23, 17, '2026-02-17 13:00:38', '2026-02-17 13:00:38');

-- --------------------------------------------------------

--
-- Table structure for table `riwayat_pencarian`
--

CREATE TABLE `riwayat_pencarian` (
  `id_riwayat` int UNSIGNED NOT NULL,
  `id_wisatawan` int UNSIGNED NOT NULL,
  `detail_pencarian` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sub_kriteria`
--

CREATE TABLE `sub_kriteria` (
  `id_sub` int UNSIGNED NOT NULL,
  `code_kriteria` varchar(10) NOT NULL,
  `id_kriteria` int UNSIGNED DEFAULT NULL,
  `nama_sub_kriteria` varchar(100) NOT NULL,
  `nilai_bobot` int NOT NULL,
  `batas_bawah` double DEFAULT NULL,
  `batas_atas` double DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sub_kriteria`
--

INSERT INTO `sub_kriteria` (`id_sub`, `code_kriteria`, `id_kriteria`, `nama_sub_kriteria`, `nilai_bobot`, `batas_bawah`, `batas_atas`, `created_at`, `updated_at`) VALUES
(1, 'C1', 1, 'Sangat Murah (< 20rb)', 1, 0, 20000, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(2, 'C1', 1, 'Murah (20rb - 50rb)', 2, 20001, 50000, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(3, 'C1', 1, 'Sedang (50rb - 100rb)', 3, 50001, 100000, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(4, 'C1', 1, 'Mahal (100rb - 200rb)', 4, 100001, 200000, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(5, 'C1', 1, 'Sangat Mahal (> 200rb)', 5, 200001, 10000000, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(6, 'C2', 2, 'Sangat Lengkap (> 5 item)', 5, 6, 100, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(7, 'C2', 2, 'Lengkap (4-5 item)', 4, 4, 5, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(8, 'C2', 2, 'Cukup (3 item)', 3, 3, 3, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(9, 'C2', 2, 'Kurang (2 item)', 2, 2, 2, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(10, 'C2', 2, 'Sangat Kurang (< 2 item)', 1, 0, 1, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(11, 'C3', 3, 'Sangat Dekat (< 5 km)', 1, 0, 5, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(12, 'C3', 3, 'Dekat (5 - 15 km)', 2, 5.1, 15, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(13, 'C3', 3, 'Sedang (15 - 30 km)', 3, 15.1, 30, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(14, 'C3', 3, 'Jauh (30 - 50 km)', 4, 30.1, 50, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(15, 'C3', 3, 'Sangat Jauh (> 50 km)', 5, 50.1, 10000, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(16, 'C4', 4, 'Sangat Baik (4.5 - 5.0)', 5, 4.5, 5, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(17, 'C4', 4, 'Baik (4.0 - 4.4)', 4, 4, 4.4, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(18, 'C4', 4, 'Cukup (3.5 - 3.9)', 3, 3.5, 3.9, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(19, 'C4', 4, 'Buruk (3.0 - 3.4)', 2, 3, 3.4, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(20, 'C4', 4, 'Sangat Buruk (< 3.0)', 1, 0, 2.9, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(21, 'C5', 5, 'Pagi (08:00 - 12:00)', 5, 8, 12, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(22, 'C5', 5, 'Siang (12:00 - 15:00)', 4, 12.1, 15, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(23, 'C5', 5, 'Sore (15:00 - 18:00)', 3, 15.1, 18, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(24, 'C5', 5, 'Malam (18:00 - 22:00)', 2, 18.1, 22, '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(25, 'C5', 5, 'Bebas / 24 Jam', 1, 0, 24, '2026-02-17 13:00:38', '2026-02-17 13:00:38');

-- --------------------------------------------------------

--
-- Table structure for table `token_blacklist`
--

CREATE TABLE `token_blacklist` (
  `id` int UNSIGNED NOT NULL,
  `token` varchar(500) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wisatawan`
--

CREATE TABLE `wisatawan` (
  `id_wisatawan` int UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `wisatawan`
--

INSERT INTO `wisatawan` (`id_wisatawan`, `username`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Budi Traveler', 'budi@gmail.com', '$2b$10$MI9y/2ogOvEMNinI/HI4KeVix8M9/.Sa/hJmiTTW.BmrlrTBPGySK', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(2, 'Siti Petualang', 'siti@gmail.com', '$2b$10$MI9y/2ogOvEMNinI/HI4KeVix8M9/.Sa/hJmiTTW.BmrlrTBPGySK', '2026-02-17 13:00:38', '2026-02-17 13:00:38'),
(3, 'Andi Backpacker', 'andi@gmail.com', '$2b$10$MI9y/2ogOvEMNinI/HI4KeVix8M9/.Sa/hJmiTTW.BmrlrTBPGySK', '2026-02-17 13:00:38', '2026-02-17 13:00:38');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id_admin`);

--
-- Indexes for table `alternatif_wisata`
--
ALTER TABLE `alternatif_wisata`
  ADD PRIMARY KEY (`id_alternatif`);

--
-- Indexes for table `hasil_rekomendasi`
--
ALTER TABLE `hasil_rekomendasi`
  ADD PRIMARY KEY (`id_hasil`),
  ADD KEY `hasil_rekomendasi_id_preferensi_foreign` (`id_preferensi`),
  ADD KEY `hasil_rekomendasi_id_alternatif_foreign` (`id_alternatif`);

--
-- Indexes for table `knex_migrations`
--
ALTER TABLE `knex_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `knex_migrations_lock`
--
ALTER TABLE `knex_migrations_lock`
  ADD PRIMARY KEY (`index`);

--
-- Indexes for table `kriteria`
--
ALTER TABLE `kriteria`
  ADD PRIMARY KEY (`id_kriteria`);

--
-- Indexes for table `preferensi_wisatawan`
--
ALTER TABLE `preferensi_wisatawan`
  ADD PRIMARY KEY (`id_preferensi`),
  ADD KEY `preferensi_wisatawan_id_wisatawan_foreign` (`id_wisatawan`),
  ADD KEY `preferensi_wisatawan_id_sub_harga_foreign` (`id_sub_harga`),
  ADD KEY `preferensi_wisatawan_id_sub_fasilitas_foreign` (`id_sub_fasilitas`),
  ADD KEY `preferensi_wisatawan_id_sub_waktu_kunjungan_foreign` (`id_sub_waktu_kunjungan`),
  ADD KEY `preferensi_wisatawan_id_sub_rating_foreign` (`id_sub_rating`);

--
-- Indexes for table `riwayat_pencarian`
--
ALTER TABLE `riwayat_pencarian`
  ADD PRIMARY KEY (`id_riwayat`),
  ADD KEY `riwayat_pencarian_id_wisatawan_foreign` (`id_wisatawan`);

--
-- Indexes for table `sub_kriteria`
--
ALTER TABLE `sub_kriteria`
  ADD PRIMARY KEY (`id_sub`),
  ADD KEY `sub_kriteria_id_kriteria_foreign` (`id_kriteria`);

--
-- Indexes for table `token_blacklist`
--
ALTER TABLE `token_blacklist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `token_blacklist_token_index` (`token`);

--
-- Indexes for table `wisatawan`
--
ALTER TABLE `wisatawan`
  ADD PRIMARY KEY (`id_wisatawan`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id_admin` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `alternatif_wisata`
--
ALTER TABLE `alternatif_wisata`
  MODIFY `id_alternatif` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `hasil_rekomendasi`
--
ALTER TABLE `hasil_rekomendasi`
  MODIFY `id_hasil` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `knex_migrations`
--
ALTER TABLE `knex_migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `knex_migrations_lock`
--
ALTER TABLE `knex_migrations_lock`
  MODIFY `index` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `kriteria`
--
ALTER TABLE `kriteria`
  MODIFY `id_kriteria` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `preferensi_wisatawan`
--
ALTER TABLE `preferensi_wisatawan`
  MODIFY `id_preferensi` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `riwayat_pencarian`
--
ALTER TABLE `riwayat_pencarian`
  MODIFY `id_riwayat` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sub_kriteria`
--
ALTER TABLE `sub_kriteria`
  MODIFY `id_sub` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `token_blacklist`
--
ALTER TABLE `token_blacklist`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wisatawan`
--
ALTER TABLE `wisatawan`
  MODIFY `id_wisatawan` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `hasil_rekomendasi`
--
ALTER TABLE `hasil_rekomendasi`
  ADD CONSTRAINT `hasil_rekomendasi_id_alternatif_foreign` FOREIGN KEY (`id_alternatif`) REFERENCES `alternatif_wisata` (`id_alternatif`) ON DELETE CASCADE,
  ADD CONSTRAINT `hasil_rekomendasi_id_preferensi_foreign` FOREIGN KEY (`id_preferensi`) REFERENCES `preferensi_wisatawan` (`id_preferensi`) ON DELETE CASCADE;

--
-- Constraints for table `preferensi_wisatawan`
--
ALTER TABLE `preferensi_wisatawan`
  ADD CONSTRAINT `preferensi_wisatawan_id_sub_fasilitas_foreign` FOREIGN KEY (`id_sub_fasilitas`) REFERENCES `sub_kriteria` (`id_sub`),
  ADD CONSTRAINT `preferensi_wisatawan_id_sub_harga_foreign` FOREIGN KEY (`id_sub_harga`) REFERENCES `sub_kriteria` (`id_sub`),
  ADD CONSTRAINT `preferensi_wisatawan_id_sub_rating_foreign` FOREIGN KEY (`id_sub_rating`) REFERENCES `sub_kriteria` (`id_sub`),
  ADD CONSTRAINT `preferensi_wisatawan_id_sub_waktu_kunjungan_foreign` FOREIGN KEY (`id_sub_waktu_kunjungan`) REFERENCES `sub_kriteria` (`id_sub`),
  ADD CONSTRAINT `preferensi_wisatawan_id_wisatawan_foreign` FOREIGN KEY (`id_wisatawan`) REFERENCES `wisatawan` (`id_wisatawan`) ON DELETE CASCADE;

--
-- Constraints for table `riwayat_pencarian`
--
ALTER TABLE `riwayat_pencarian`
  ADD CONSTRAINT `riwayat_pencarian_id_wisatawan_foreign` FOREIGN KEY (`id_wisatawan`) REFERENCES `wisatawan` (`id_wisatawan`) ON DELETE CASCADE;

--
-- Constraints for table `sub_kriteria`
--
ALTER TABLE `sub_kriteria`
  ADD CONSTRAINT `sub_kriteria_id_kriteria_foreign` FOREIGN KEY (`id_kriteria`) REFERENCES `kriteria` (`id_kriteria`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
