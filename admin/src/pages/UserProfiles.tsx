import { FormEvent, useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";
import Label from "../components/form/Label";
import {
  fetchCurrentUser,
  updateCurrentUserPassword,
  updateCurrentUserProfile,
  updateNotificationSettings,
} from "../service/alumniService";
import { useAuthUser } from "../hooks/useAuthUser";

function roleLabel(role: string | undefined) {
  if (role === "admin") return "Administrator";
  if (role === "alumni") return "Alumni";
  if (role === "viewer") return "Viewer";
  return "Pengguna";
}

function accountStatusLabel(status: string | undefined | null) {
  if (!status) return "Belum tersedia";
  if (status.toLowerCase() === "active") return "Akun aktif";
  return status;
}

function initials(name: string | undefined | null) {
  if (!name || !name.trim()) return "U";

  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";

  return `${first}${second}`.toUpperCase() || "U";
}

function formatDateTime(value: string | undefined | null) {
  if (!value) return "Belum tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Belum tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function UserProfiles() {
  const user = useAuthUser();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [emailNotification, setEmailNotification] = useState(true);
  const [systemNotification, setSystemNotification] = useState(true);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setLoadError(null);

      try {
        await fetchCurrentUser();
      } catch (err) {
        if (active) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Tidak dapat memuat informasi profile."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    setName(user.name ?? "");
    setEmail(user.email ?? "");
    setPhone(user.phone ?? "");
    setAvatarPreview(user.avatar_url ?? null);

    setEmailNotification(
      user.notification_settings?.email_notification ?? true
    );
    setSystemNotification(
      user.notification_settings?.system_notification ?? true
    );
  }, [user]);

  const avatarUrl = useMemo(() => {
    if (avatarFile) {
      return URL.createObjectURL(avatarFile);
    }

    return avatarPreview;
  }, [avatarFile, avatarPreview]);

  useEffect(() => {
    return () => {
      if (avatarUrl && avatarFile) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl, avatarFile]);

  const handleRetry = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      await fetchCurrentUser();
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Tidak dapat memuat informasi profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setProfileError(null);
    setProfileSuccess(null);
    setProfileSaving(true);

    try {
      await updateCurrentUserProfile({
        name,
        email,
        phone,
        avatarFile,
      });
      setAvatarFile(null);
      setProfileSuccess("Profil berhasil diperbarui.");
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Gagal menyimpan profil."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handleResetProfileForm = () => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPhone(user?.phone ?? "");
    setAvatarFile(null);
    setAvatarPreview(user?.avatar_url ?? null);
    setProfileError(null);
    setProfileSuccess(null);
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError("Password baru minimal 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setPasswordSaving(true);

    try {
      await updateCurrentUserPassword(
        currentPassword,
        newPassword,
        confirmPassword
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password berhasil diperbarui.");
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Gagal memperbarui password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    setNotifSaving(true);
    setNotifError(null);
    setNotifSuccess(null);

    try {
      await updateNotificationSettings(
        emailNotification,
        systemNotification
      );
      setNotifSuccess("Pengaturan notifikasi berhasil disimpan.");
    } catch (err) {
      setNotifError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan notifikasi."
      );
    } finally {
      setNotifSaving(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Profile | Sistem Tracer Study"
        description="Manajemen profile dan pengaturan akun pengguna"
      />

      <PageBreadcrumb pageTitle="Profile" />

      <div className="space-y-6">
        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="animate-pulse space-y-4">
              <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-56 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-64 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        )}

        {!loading && loadError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-500/30 dark:bg-rose-500/10">
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              Tidak dapat memuat informasi profile.
            </p>
            <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
              Silakan coba lagi.
            </p>
            <p className="mt-2 text-xs text-rose-500 dark:text-rose-400">
              {loadError}
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={handleRetry}>
                Coba Lagi
              </Button>
            </div>
          </div>
        )}

        {!loading && !loadError && user && (
          <>
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-lg font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={user.name ?? "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initials(user.name)
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                      {user.name || "Belum tersedia"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {roleLabel(user.role)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email || "Belum tersedia"}
                    </p>
                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                      ● {accountStatusLabel(user.status_akun)}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    const section = document.getElementById("edit-profile");
                    section?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  Edit Profile
                </Button>
              </div>
            </section>

            <section id="edit-profile" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Edit Profile
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Perbarui data profile akun yang sedang login.
              </p>

              <form className="mt-5 space-y-4" onSubmit={handleProfileSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Nama lengkap</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      disabled={profileSaving}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={profileSaving}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Nomor telepon</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      disabled={profileSaving}
                      placeholder="Belum tersedia"
                    />
                  </div>

                  <div>
                    <Label htmlFor="avatar">Foto profile</Label>
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      disabled={profileSaving}
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        setAvatarFile(file);
                      }}
                      className="block h-11 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:file:bg-brand-900/30 dark:file:text-brand-200"
                    />
                  </div>
                </div>

                {profileError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
                    {profileError}
                  </div>
                )}

                {profileSuccess && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {profileSuccess}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" size="sm" disabled={profileSaving}>
                    {profileSaving ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={profileSaving}
                    onClick={handleResetProfileForm}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Account Information
              </h3>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">User ID</p>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                    #{user.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                    {user.email || "Belum tersedia"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                    {roleLabel(user.role)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status akun</p>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                    {accountStatusLabel(user.status_akun)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                    {formatDateTime(user.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Last Login</p>
                  <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                    {formatDateTime(user.last_login_at)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Security
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Ubah password akun Anda secara aman.
              </p>

              <form className="mt-5 space-y-4" onSubmit={handlePasswordSubmit}>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="current-password">Password saat ini</Label>
                    <div className="flex gap-2">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        disabled={passwordSaving}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                      >
                        {showCurrentPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new-password">Password baru</Label>
                    <div className="flex gap-2">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        disabled={passwordSaving}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                      >
                        {showNewPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm-password">Konfirmasi password baru</Label>
                    <div className="flex gap-2">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        disabled={passwordSaving}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </div>
                </div>

                {passwordError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {passwordSuccess}
                  </div>
                )}

                <Button type="submit" size="sm" disabled={passwordSaving}>
                  {passwordSaving ? "Menyimpan..." : "Ubah Password"}
                </Button>
              </form>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Notification Settings
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Kelola preferensi notifikasi akun Anda.
              </p>

              <div className="mt-5 space-y-4">
                <label className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      Email Notification
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Terima informasi penting melalui email.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotification}
                    disabled={notifSaving}
                    onChange={(event) => setEmailNotification(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600"
                  />
                </label>

                <label className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-800">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      System Notification
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Terima notifikasi dari sistem.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemNotification}
                    disabled={notifSaving}
                    onChange={(event) => setSystemNotification(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600"
                  />
                </label>
              </div>

              {notifError && (
                <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
                  {notifError}
                </div>
              )}

              {notifSuccess && (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {notifSuccess}
                </div>
              )}

              <div className="mt-4">
                <Button size="sm" onClick={handleNotificationSave} disabled={notifSaving}>
                  {notifSaving ? "Menyimpan..." : "Simpan Notifikasi"}
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Support
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Butuh bantuan menggunakan sistem Tracer Study Alumni?
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <a
                  href="#"
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  Lihat Panduan
                </a>
                <a
                  href="#"
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  FAQ
                </a>
                <a
                  href="mailto:admin@tracer.local"
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  Hubungi Support
                </a>
                <a
                  href="mailto:admin@tracer.local?subject=Laporan%20Masalah"
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
                >
                  Laporkan Masalah
                </a>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
