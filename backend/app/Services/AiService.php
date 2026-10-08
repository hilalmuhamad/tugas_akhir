<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class AiService
{
    private string $baseUrl;

    private string $apiKey;

    private string $model;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.github_models.base_url'), '/');
        $this->apiKey = (string) config('services.github_models.api_key');
        $this->model = (string) config('services.github_models.model');
    }

    /**
     * Kirim percakapan ke model AI (OpenAI-compatible /chat/completions)
     * dan kembalikan teks balasan.
     *
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    public function chat(array $messages, float $temperature = 0.7): string
    {
        if ($this->apiKey === '') {
            throw new RuntimeException(
                'API key AI belum diatur. Isi GITHUB_MODELS_API_KEY di backend/.env'
            );
        }

        // Model reasoning bisa merespons lama (>30 dtk); jangan sampai
        // request dipotong oleh max_execution_time PHP.
        set_time_limit(0);

        try {
            $response = Http::timeout(120)
                ->withToken($this->apiKey)
                ->post("{$this->baseUrl}/chat/completions", [
                    'model' => $this->model,
                    'messages' => $messages,
                    'temperature' => $temperature,
                ]);
        } catch (ConnectionException $e) {
            throw new RuntimeException("Gagal terhubung ke server AI: {$e->getMessage()}");
        }

        if ($response->failed()) {
            throw new RuntimeException(
                'Server AI mengembalikan error: '.$response->body()
            );
        }

        // Router lokal kadang menempelkan artefak SSE "data: [DONE]"
        // di akhir body JSON sehingga json_decode biasa menjadi gagal.
        $json = $response->json();
        if (! is_array($json)) {
            $body = trim($response->body());
            if (str_contains($body, 'data: [DONE]')) {
                $body = substr($body, 0, strpos($body, 'data: [DONE]'));
            }
            $json = json_decode(trim($body), true);
            if (! is_array($json) && preg_match('/\{.*\}/s', $body, $match)) {
                $json = json_decode($match[0], true);
            }
        }

        $content = $json['choices'][0]['message']['content'] ?? null;

        if (! is_string($content) || $content === '') {
            throw new RuntimeException(
                'Respons AI tidak valid: '.substr((string) $response->body(), 0, 300)
            );
        }

        return $content;
    }
}
