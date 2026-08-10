// Nama tampilan program studi (kode internal dari data -> nama laporan).
export const PRODI_LABEL = {
  "Sci&Tech": "Teknik Informatika",
  "Comm&Mgmt": "Manajemen",
  Others: "Akuntansi",
};

export const prodiLabel = (key) => PRODI_LABEL[key] ?? key;
