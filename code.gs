/**
 * Fungsi Helper: Mengambil data Produksi (A, F-L) dan menyalinnya ke Sheet Pusat (DATA QUERY PRODUKSI).
 */
function queryProduksi() {
  const SPREADSHEET_ID_PUSAT = '199RUYluhnR0mtsO7RhWEEt-lwQbDYWbkz91zmw2oC5Y';
  const SPREADSHEET_ID_PRODUKSI = '1uKit_W_whr67Tubsx-SMwQhlVECOeQNA0zqdUy45ljM';
  const START_ROW_PRODUKSI = 143;
  
  try {
    const ssSumber = SpreadsheetApp.openById(SPREADSHEET_ID_PRODUKSI);
    const sheetSumber = ssSumber.getSheetByName('DATA_PRODUKSI');
    if (!sheetSumber) throw new Error("Sheet sumber 'DATA_PRODUKSI' tidak ditemukan.");

    const ssTujuan = SpreadsheetApp.openById(SPREADSHEET_ID_PUSAT);
    const sheetTujuan = ssTujuan.getSheetByName('DATA QUERY PRODUKSI');
    if (!sheetTujuan) throw new Error("Sheet tujuan 'DATA QUERY PRODUKSI' tidak ditemukan.");

    // 1. Ambil Data Sumber (Range A, F-L)
    const lastRow = sheetSumber.getLastRow();
    if (lastRow < START_ROW_PRODUKSI) {
      sheetTujuan.clear();
      sheetTujuan.appendRow(['TIDAK ADA DATA BARU SEJAK BARIS ' + START_ROW_PRODUKSI]);
      Logger.log("Tidak ada data baru di Produksi.");
      return;
    }

    // Range yang akan dibaca: A, F-L mulai dari baris 143
    const rangeToRead = `A${START_ROW_PRODUKSI}:L${lastRow}`; 
    const dataSumber = sheetSumber.getRange(rangeToRead).getValues();

    // Filter hanya kolom A, F, G, H, I, J, K, L (Index 0, 5, 6, 7, 8, 9, 10, 11)
    const filteredData = dataSumber.map(row => [
      row[0], row[5], row[6], row[7], row[8], row[9], row[10], row[11]
    ]);

    // 2. Tulis ke Sheet Tujuan (DATA QUERY PRODUKSI)
    sheetTujuan.clearContents(); // Hapus data lama
    
    // Tulis Header
    sheetTujuan.appendRow(['Timestamp', 'QTY Produksi (F)', 'NG Tipis (G)', 'NG Sobek (H)', 'Ambil Repack (I)', 'Hasil Repack (J)', 'Ambil Serut (K)', 'Hasil Serut (L)']);

    // Tulis data baru
    if (filteredData.length > 0) {
      sheetTujuan.getRange(sheetTujuan.getLastRow() + 1, 1, filteredData.length, filteredData[0].length).setValues(filteredData);
    }
    
    Logger.log('Query Produksi berhasil diupdate.');
    
  } catch (e) {
    Logger.log('ERROR QUERY PRODUKSI: ' + e.message);
  }
}

/**
 * Fungsi Helper: Mengambil data Penjualan (B, E) & L300 (A, D) dan menyalinnya ke Sheet Pusat (DATA QUERY PENJUALAN)
 * dalam format Side-by-Side (L300 dimulai di Kolom D).
 */
function queryPenjualan() {
  const SPREADSHEET_ID_PUSAT = '199RUYluhnR0mtsO7RhWEEt-lwQbDYWbkz91zmw2oC5Y';
  const SPREADSHEET_ID_PENJUALAN = '1HcWPZwayTIT17WFPqph5S4ff_kShefLi5LqKEuPxHMs';
  const START_ROW_PENJUALAN_UTAMA = 1843;
  const START_ROW_PENJUALAN_L300 = 785;
  
  try {
    const ssSumber = SpreadsheetApp.openById(SPREADSHEET_ID_PENJUALAN);
    const ssTujuan = SpreadsheetApp.openById(SPREADSHEET_ID_PUSAT);
    const sheetTujuan = ssTujuan.getSheetByName('DATA QUERY PENJUALAN');
    if (!sheetTujuan) throw new Error("Sheet tujuan 'DATA QUERY PENJUALAN' tidak ditemukan.");

    let dataPenjualanUtama = [];
    let dataL300 = [];

    // 1. Ambil Data Penjualan Utama (B, E)
    const sheetPenjualan = ssSumber.getSheetByName('DATA PENJUALAN');
    if (sheetPenjualan) {
        const lastRow = sheetPenjualan.getLastRow();
        if (lastRow >= START_ROW_PENJUALAN_UTAMA) {
            // Range B1843:E
            const rangeToRead = `B${START_ROW_PENJUALAN_UTAMA}:E${lastRow}`;
            const dataSumber = sheetPenjualan.getRange(rangeToRead).getValues();
            // Filter hanya kolom B (Index 0) dan E (Index 3)
            dataSumber.forEach(row => {
                dataPenjualanUtama.push([
                    row[0], // Tanggal/Timestamp (B)
                    row[3]  // QTY (E)
                ]);
            });
        }
    }

    // 2. Ambil Data L300 (A, D)
    const sheetL300 = ssSumber.getSheetByName('L300');
    if (sheetL300) {
        const lastRow = sheetL300.getLastRow();
        if (lastRow >= START_ROW_PENJUALAN_L300) {
            // Range A785:D
            const rangeToRead = `A${START_ROW_PENJUALAN_L300}:D${lastRow}`;
            const dataSumber = sheetL300.getRange(rangeToRead).getValues();
            // Filter hanya kolom A (Index 0) dan D (Index 3)
            dataSumber.forEach(row => {
                dataL300.push([
                    row[0], // Tanggal/Timestamp (A)
                    row[3]  // QTY (D)
                ]);
            });
        }
    }
    
    // 3. Gabungkan Data Side-by-Side (Kolom C dikosongkan)
    const maxLength = Math.max(dataPenjualanUtama.length, dataL300.length);
    let combinedData = [];

    for (let i = 0; i < maxLength; i++) {
        // Ambil data, jika baris tidak ada, gunakan string kosong
        const rowUtama = dataPenjualanUtama[i] || ['', '']; 
        const rowL300 = dataL300[i] || ['', '']; 

        // Gabungkan: [Tgl Utama, Qty Utama, EMPTY (C), Tgl L300 (D), Qty L300 (E)]
        combinedData.push([
            rowUtama[0],
            rowUtama[1],
            '', // Kolom C: Pemisah
            rowL300[0],
            rowL300[1]
        ]);
    }

    // 4. Tulis ke Sheet Tujuan (DATA QUERY PENJUALAN)
    sheetTujuan.clearContents(); 

    // Tulis Header A1:E1
    sheetTujuan.getRange('A1:E1').setValues([
      ['Tanggal Penjualan Utama', 'QTY Penjualan Utama', '', 'Tanggal L300', 'QTY L300']
    ]);

    // Tulis data baru, dimulai dari baris 2
    if (combinedData.length > 0) {
      sheetTujuan.getRange(2, 1, combinedData.length, combinedData[0].length).setValues(combinedData);
    }

    Logger.log('Query Penjualan berhasil diupdate dengan format side-by-side.');

  } catch (e) {
    Logger.log('ERROR QUERY PENJUALAN: ' + e.message);
  }
}

/**
 * Fungsi untuk menjalankan kedua Query Helper sekaligus.
 */
function runAllQueries() {
    queryProduksi();
    queryPenjualan();
    // kita akan periksa error plastik di sini nanti.
}
