import CreateUserForm from "../../components/auth/CreateUserForm";

/**
 * Halaman ini dipasang di route "/users/create", dibungkus <AppLayout />
 * (jadi otomatis dapat sidebar/header dashboard) dan <AdminRoute />
 * (jadi otomatis hanya bisa diakses admin).
 *
 * Kalau template kamu punya komponen PageMeta/PageBreadcrumb standar
 * (biasa dipakai di halaman lain seperti BasicTables), tinggal tambahkan
 * di sini supaya konsisten dengan halaman lainnya — saya skip karena
 * saya belum lihat komponen itu.
 */
export default function CreateUser() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <CreateUserForm />
    </div>
  );
}