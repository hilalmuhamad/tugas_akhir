<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! in_array($user->role, ['admin', 'alumni', 'viewer'], true)) {
            throw ValidationException::withMessages([
                'role' => ['The provided role is invalid.'],
            ]);
        }

        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Authenticated successfully.',
            'token' => $token,
            'user' => $this->mapUser($user),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $this->mapUser($request->user()),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone' => ['nullable', 'string', 'max:25'],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('avatar')) {
            if (! empty($user->avatar_path)) {
                $oldPath = public_path($user->avatar_path);
                if (is_file($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $file = $request->file('avatar');
            $fileName = sprintf(
                'avatar-%d-%d.%s',
                $user->id,
                time(),
                $file->getClientOriginalExtension()
            );

            $destination = public_path('uploads/avatars');
            if (! is_dir($destination)) {
                mkdir($destination, 0755, true);
            }

            $file->move($destination, $fileName);
            $validated['avatar_path'] = 'uploads/avatars/'.$fileName;
        }

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'avatar_path' => $validated['avatar_path'] ?? $user->avatar_path,
        ]);
        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user' => $this->mapUser($user->fresh()),
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini tidak sesuai.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        return response()->json([
            'message' => 'Password berhasil diperbarui.',
        ]);
    }

    public function updateNotifications(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'email_notification' => ['required', 'boolean'],
            'system_notification' => ['required', 'boolean'],
        ]);

        $user->fill([
            'email_notifications' => (bool) $validated['email_notification'],
            'system_notifications' => (bool) $validated['system_notification'],
        ]);
        $user->save();

        return response()->json([
            'message' => 'Preferensi notifikasi berhasil diperbarui.',
            'user' => $this->mapUser($user->fresh()),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Pendaftaran akun:
     * - Publik (tanpa login): hanya boleh mendaftar sebagai "alumni".
     * - Dari dashboard: hanya admin yang boleh membuat akun admin/alumni/viewer.
     */
    public function register(Request $request)
    {
        // Route bersifat publik, jadi user di-resolve manual dari Bearer token
        // bila ada (mis. panggilan dari dashboard admin).
        $user = $request->user();
        if ($user === null && $request->bearerToken() !== null) {
            $user = Auth::guard('sanctum')->user();
        }
        $isAdmin = $user !== null && $user->role === 'admin';

        if (! $isAdmin) {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ]);
            $validated['role'] = 'alumni';
        } else {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'role' => ['required', 'string', 'in:admin,alumni,viewer'],
            ]);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return response()->json([
            'message' => 'Akun berhasil dibuat.',
            'user' => $this->mapUser($user),
        ], 201);
    }

    private function mapUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => $user->phone,
            'avatar_url' => $user->avatar_path
                ? asset($user->avatar_path)
                : null,
            'status_akun' => 'active',
            'created_at' => $user->created_at?->toIso8601String(),
            'last_login_at' => $user->last_login_at?->toIso8601String(),
            'notification_settings' => [
                'email_notification' => (bool) ($user->email_notifications ?? true),
                'system_notification' => (bool) ($user->system_notifications ?? true),
            ],
        ];
    }
}