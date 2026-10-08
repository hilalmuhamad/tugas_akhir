import { useState, FormEvent } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { registerUser } from "../../service/alumniService";

/**
 * Form ini menggantikan SignUpForm lama. Bedanya:
 * - Diakses dari dalam dashboard (bukan halaman publik), oleh admin
 *   yang sedang login, untuk membuatkan akun untuk orang lain.
 * - Tidak ada Sign in with Google/X (tidak relevan untuk kasus ini).
 * - Ada field "Role" karena admin yang menentukan hak akses akun baru
 *   (admin / alumni / viewer), bukan default otomatis.
 * - Setelah sukses, TIDAK auto-login sebagai akun baru itu — admin tetap
 *   di sesinya sendiri. Cukup tampilkan pesan sukses & reset form (atau
 *   redirect ke halaman daftar user kalau kamu punya).
 *
 * PERLU DITAMBAHKAN ke src/service/alumniService.ts (belum ada, ini contoh):
 *
 *   export async function registerUser(payload: {
 *     name: string;
 *     email: string;
 *     password: string;
 *     password_confirmation: string;
 *     role: "admin" | "alumni" | "viewer";
 *   }) {
 *     const token = localStorage.getItem("auth_token");
 *     const res = await fetch(`${API_BASE_URL}/auth/register`, {
 *       method: "POST",
 *       headers: {
 *         "Content-Type": "application/json",
 *         Authorization: `Bearer ${token}`,
 *       },
 *       body: JSON.stringify(payload),
 *     });
 *     if (!res.ok) {
 *       const errorBody = await res.json();
 *       throw errorBody;
 *     }
 *     return res.json();
 *   }
 *
 * (Sesuaikan dengan pola fetch yang sudah kamu pakai di fetchAlumni(), biar
 * konsisten cara handle 401/error-nya.)
 */

const ROLE_OPTIONS = [
  { value: "viewer", label: "Viewer" },
  { value: "alumni", label: "Alumni" },
  { value: "admin", label: "Admin" },
] as const;

export default function CreateUserForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState<"admin" | "alumni" | "viewer">("viewer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPasswordConfirmation("");
    setRole("viewer");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== passwordConfirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerUser({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
      });
      setSuccess(`Akun "${result.user.name}" (${result.user.role}) berhasil dibuat.`);
      resetForm();
    } catch (err: unknown) {
      const errorPayload = err as {
        errors?: { email?: string[] };
        message?: string;
      };
      const message =
        errorPayload?.errors?.email?.[0] ??
        errorPayload?.message ??
        "Gagal membuat akun. Coba lagi.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-5 sm:mb-8">
        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
          Tambah User
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Buat akun baru untuk admin, alumni, atau viewer.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-5 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-600 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <Label>
              Nama <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              placeholder="Nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="nama@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label>
              Role <span className="text-error-500">*</span>
            </Label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              disabled={isLoading}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90 dark:bg-gray-900"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>
              Password <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}
              </span>
            </div>
          </div>

          <div>
            <Label>
              Konfirmasi Password <span className="text-error-500">*</span>
            </Label>
            <Input
              id="password_confirmation"
              name="password_confirmation"
              type={showPassword ? "text" : "password"}
              placeholder="Ulangi password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Button className="w-full" size="sm" type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Buat Akun"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}