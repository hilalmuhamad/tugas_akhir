import { alumniDummy } from "../data/alumniDummy";

/** Dua nilai status kerja. Tidak ada nilai lain di basis data. */
export type StatusBekerja = "Bekerja" | "Tidak Bekerja";

/** Dua kategori keselarasan sesuai istilah Kemendikti. */
export type KategoriKeselarasan = "Selaras" | "Tidak Selaras";

export interface AlumniRecord {
  id: number;
  nama: string;
  gender: "L" | "P";
  jenjang: "D3" | "S1" | null;
  tahunMasuk: number | null;
  programStudi: "Sci&Tech" | "Comm&Mgmt" | "Others";
  specialisasi: "Mkt&HR" | "Mkt&Fin";
  pengalamanKerja: "Ya" | "Tidak";
  tahunLulus: number;
  ipk: number;
  statusBekerja: StatusBekerja;
  masaTungguBulan: number | null;
  gajiJuta: number | null;
  jabatan?: string | null;
  bidangPekerjaan?: string | null;
  /** Keselarasan horizontal. Null bila alumni tidak bekerja. */
  kesesuaianBidang?: KategoriKeselarasan | null;
  /** Keselarasan vertikal. Null dengan alasan yang sama. */
  tingkatPendidikanSesuai?: KategoriKeselarasan | null;
}

export interface AuthUser {
  id: number;
  name: string;
  email?: string | null;
  role: "admin" | "alumni" | "viewer";
  phone?: string | null;
  avatar_url?: string | null;
  status_akun?: string | null;
  created_at?: string | null;
  last_login_at?: string | null;
  notification_settings?: {
    email_notification: boolean;
    system_notification: boolean;
  } | null;
}

// Sesuaikan dengan URL backend Laravel Anda (hasil `php artisan serve`)
const API_BASE_URL = "http://127.0.0.1:8000/api";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
export const AUTH_USER_UPDATED_EVENT = "auth-user-updated";

function emitUserUpdate(user: AuthUser | null): void {
  window.dispatchEvent(
    new CustomEvent(AUTH_USER_UPDATED_EVENT, {
      detail: user,
    })
  );
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  emitUserUpdate(user);
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
  emitUserUpdate(null);
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const isFormDataBody = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token tidak valid/kadaluarsa — bersihkan token & user lokal
    clearToken();
    clearUser();
    throw new Error("Sesi berakhir, silakan login kembali");
  }

  return response;
}

export async function login(email: string, password: string): Promise<void> {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login gagal, periksa email/password Anda");
  }

  const data = await response.json();
  // AuthController@login (backend) mengembalikan { message, token, user: {id,name,role} }
  setToken(data.token);
  setUser(data.user);
}

export async function logout(): Promise<void> {
  await apiFetch("/auth/logout", { method: "POST" });
  clearToken();
  clearUser();
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await apiFetch("/auth/me");

  if (!response.ok) {
    throw new Error("Gagal memuat profil pengguna.");
  }

  const json = (await response.json()) as {
    user?: AuthUser;
  };

  if (!json.user) {
    throw new Error("Data pengguna tidak tersedia.");
  }

  setUser(json.user);

  return json.user;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone?: string;
  avatarFile?: File | null;
}

export async function updateCurrentUserProfile(
  payload: UpdateProfilePayload
): Promise<AuthUser> {
  const body = new FormData();
  body.append("name", payload.name);
  body.append("email", payload.email);
  body.append("phone", payload.phone ?? "");

  if (payload.avatarFile) {
    body.append("avatar", payload.avatarFile);
  }

  const response = await apiFetch("/auth/profile", {
    method: "POST",
    body,
  });

  const json = (await response.json().catch(() => ({}))) as {
    message?: string;
    user?: AuthUser;
    errors?: Record<string, string[]>;
  };

  if (!response.ok) {
    const firstError = json.errors
      ? Object.values(json.errors)[0]?.[0]
      : null;

    throw new Error(firstError ?? json.message ?? "Gagal memperbarui profil.");
  }

  if (!json.user) {
    throw new Error("Respons profil tidak valid.");
  }

  setUser(json.user);

  return json.user;
}

export async function updateCurrentUserPassword(
  currentPassword: string,
  newPassword: string,
  newPasswordConfirmation: string
): Promise<void> {
  const response = await apiFetch("/auth/password", {
    method: "PUT",
    body: JSON.stringify({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPasswordConfirmation,
    }),
  });

  const json = (await response.json().catch(() => ({}))) as {
    message?: string;
    errors?: Record<string, string[]>;
  };

  if (!response.ok) {
    const firstError = json.errors
      ? Object.values(json.errors)[0]?.[0]
      : null;

    throw new Error(firstError ?? json.message ?? "Gagal memperbarui password.");
  }
}

export async function updateNotificationSettings(
  emailNotification: boolean,
  systemNotification: boolean
): Promise<AuthUser> {
  const response = await apiFetch("/auth/notifications", {
    method: "PUT",
    body: JSON.stringify({
      email_notification: emailNotification,
      system_notification: systemNotification,
    }),
  });

  const json = (await response.json().catch(() => ({}))) as {
    message?: string;
    user?: AuthUser;
    errors?: Record<string, string[]>;
  };

  if (!response.ok) {
    const firstError = json.errors
      ? Object.values(json.errors)[0]?.[0]
      : null;

    throw new Error(
      firstError ?? json.message ?? "Gagal memperbarui notifikasi."
    );
  }

  if (!json.user) {
    throw new Error("Respons notifikasi tidak valid.");
  }

  setUser(json.user);

  return json.user;
}

export interface FetchAlumniResult {
  data: AlumniRecord[];
  source: "api" | "dummy";
}

export async function fetchAlumniRaw(): Promise<FetchAlumniResult> {
  try {
    const response = await apiFetch("/alumni");

    if (!response.ok) {
      throw new Error(`Gagal mengambil data alumni: ${response.status}`);
    }

    const data = (await response.json()) as AlumniRecord[];
    if (Array.isArray(data) && data.length > 0) {
      return { data, source: "api" };
    }
  } catch {
    // Fallback ke data dummy lokal saat backend belum tersedia atau sedang offline.
  }

  return { data: alumniDummy, source: "dummy" };
}

export async function fetchAlumni(): Promise<AlumniRecord[]> {
  const result = await fetchAlumniRaw();
  return result.data;
}

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: "admin" | "alumni" | "viewer";
}

export interface RegisterUserResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "admin" | "alumni" | "viewer";
  };
}

export async function registerUser(
  payload: RegisterUserPayload
): Promise<RegisterUserResponse> {
  const response = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // Laravel validation error (422) atau 403 (bukan admin) -> lempar body
    // JSON-nya supaya CreateUserForm bisa baca err.errors.email dsb.
    const errorBody = await response.json().catch(() => ({}));
    throw errorBody;
  }

  return response.json();
}

export interface LowonganRecord {
  id: number;
  judul_posisi: string;
  perusahaan: string;
  lokasi: string | null;
  gaji_min: number | null;
  gaji_max: number | null;
  keahlian: string[];
  deskripsi: string | null;
  sumber_url: string | null;
  aktif: boolean;
}

export async function fetchJobs(): Promise<LowonganRecord[]> {
  const response = await apiFetch("/jobs?semua=1");
  if (!response.ok) {
    throw new Error(`Gagal mengambil data lowongan: ${response.status}`);
  }
  return response.json();
}

export interface CreateJobPayload {
  judul_posisi: string;
  perusahaan: string;
  lokasi?: string;
  gaji_min?: number;
  gaji_max?: number;
  deskripsi?: string;
  keahlian?: string[];
  sumber_url?: string;
}

export async function createJob(payload: CreateJobPayload): Promise<LowonganRecord> {
  const response = await apiFetch("/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Gagal menyimpan lowongan, periksa kembali isian");
  }
  return response.json();
}

export async function deleteJob(id: number): Promise<void> {
  const response = await apiFetch(`/jobs/${id}`, { method: "DELETE" });
  if (!response.ok) {
    throw new Error("Gagal menghapus lowongan");
  }
}

export async function toggleJobAktif(
  id: number,
  aktif: boolean,
): Promise<LowonganRecord> {
  const response = await apiFetch(`/jobs/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ aktif }),
  });
  if (!response.ok) {
    throw new Error("Gagal mengubah status lowongan");
  }
  return response.json();
}

export async function scrapeJobs(limit: number = 5, source?: string): Promise<{ diambil: number; tersimpan: number; diperbarui: number; total_database: number }> {
  const response = await apiFetch("/jobs/scrape", {
    method: "POST",
    body: JSON.stringify({ limit, source }),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || "Gagal scraping lowongan");
  return json.result;
}