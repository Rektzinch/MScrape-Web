# Cakupan Field Data Bisnis Google Maps

## Kesimpulan implementasi

Data hasil pencarian dasar dapat menampilkan identitas, lokasi, kontak, situs web, koordinat, rating, dan tautan sumber bila dikirim oleh respons pencarian. Namun, daftar lengkap yang diminta—khususnya kategori primer/sekunder, komponen alamat yang dapat dipisah, status operasional, jam reguler/real-time, Place ID, foto, harga, atribut layanan, dan aksesibilitas—merupakan kontrak **Place Details** dengan field mask. Field tersebut harus diperlakukan sebagai enrichment opsional, bukan dipalsukan saat tidak tersedia.[1][2]

| Kelompok | Field pengguna | Sumber Places resmi | Strategi MScrape |
|---|---|---|---|
| Identitas dan lokasi | Nama, alamat, kota/kabupaten, kecamatan, lat/lng, URL Maps, Place ID | `displayName`, `formattedAddress`, `addressComponents`, `location`, `googleMapsUri`, `id` | Normalisasi dari hasil scan bila ada; enrichment untuk detail yang hilang. |
| Kategori | Kategori utama dan tambahan | `primaryType`, `primaryTypeDisplayName`, `types` | Tampilan/CSV langsung bila tersedia; jangan simpulkan dari kata kunci. |
| Kontak dan situs | Telepon, website, domain | `nationalPhoneNumber`, `internationalPhoneNumber`, `websiteUri` | Pertahankan telepon/situs hasil scan; domain dihitung dari URL situs secara lokal. |
| Reputasi | Rating, jumlah ulasan | `rating`, `userRatingCount` | Pertahankan fallback transparan ketika respons scan tidak mengirim jumlah ulasan. |
| Operasional | Jam, buka/tutup, status bisnis | `regularOpeningHours`, `currentOpeningHours`, `businessStatus` | Hanya isi bila enrichment tersedia; status buka dapat berubah dan tidak boleh ditebak. |
| Media dan harga | Foto/logo, kisaran harga | `photos`, `priceLevel`, `priceRange` | Simpan referensi/foto sesuai ketentuan atribusi; kosongkan bila tidak tersedia. |
| Atribut | Delivery, dine-in, accessibility, parkir, pembayaran | `delivery`, `dineIn`, `takeout`, `accessibilityOptions`, dan atribut terkait | Bentuk daftar atribut boolean hanya dari respons detail resmi. |

> Google mensyaratkan field mask untuk Places API dan mengelompokkan field menurut SKU. Pemakaian wildcard untuk produksi tidak disarankan karena volume data dan biaya.[1]

## Batas yang harus dipertahankan

`addressComponents` dapat berubah dan sebuah komponen wilayah dapat tidak dikirim; kota/kabupaten serta kecamatan harus memiliki fallback kosong, bukan hasil tebak. Foto Google berupa metadata/referensi dan tunduk pada atribusi; MScrape tidak boleh menyatakan foto tersebut sebagai logo resmi. Atribut layanan dan status buka/tutup bersifat opsional serta kategori-spesifik.[2][3]

## Referensi

[1] [Google Maps Platform — Place Data Fields (New)](https://developers.google.com/maps/documentation/places/web-service/data-fields)

[2] [Google Maps Platform — Place Details (New)](https://developers.google.com/maps/documentation/places/web-service/place-details)

[3] [Google Maps Platform — Place Resource Reference](https://developers.google.com/maps/documentation/places/web-service/reference/rest/v1/places)
