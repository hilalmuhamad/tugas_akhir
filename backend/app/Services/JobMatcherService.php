<?php

namespace App\Services;

use App\Models\Lowongan;
use Illuminate\Support\Collection;

class JobMatcherService
{
    private const LEVEL_RANK = [
        'intern' => 0,
        'fresh graduate' => 1,
        'junior' => 2,
        'menengah' => 3,
        'mid' => 3,
        'senior' => 4,
    ];

    private const LEVEL_LABEL = [
        0 => 'intern',
        1 => 'fresh graduate',
        2 => 'junior',
        3 => 'menengah',
        4 => 'senior',
    ];

    public function __construct(
        private readonly TfIdfService $tfidf,
        private readonly ProfileAnalyzerService $analyzer,
    ) {}

    /**
     * @param  Collection<int, Lowongan>|array<int, Lowongan>  $jobs
     * @return array{hasil: array<int, array<string, mixed>>, gap_skill: array<int, string>, abstain: bool, pesan: string|null}
     */
    public function match(array $analysis, Collection|array $jobs, ?string $query = null, ?string $lokasi = null, int $limit = 5): array
    {
        $jobs = collect($jobs)->filter(fn ($job) => $job instanceof Lowongan && $job->aktif);
        if ($jobs->isEmpty()) {
            return $this->kosong('Belum ada lowongan aktif yang dapat dicocokkan.');
        }

        if ($lokasi !== null && $lokasi !== '') {
            $jobs = $jobs->filter(
                fn (Lowongan $job) => $job->lokasi !== null
                    && mb_stripos($job->lokasi, $lokasi) !== false
            );
            if ($jobs->isEmpty()) {
                return $this->kosong("Belum ada lowongan aktif di lokasi {$lokasi}.");
            }
        }

        $profilSkill = $this->skillProfil($analysis);
        $profilDomain = $this->domainProfil($analysis);
        $profilLevel = $this->levelProfil($analysis);
        $profilRank = self::LEVEL_RANK[$profilLevel] ?? 1;

        $dokumen = [];
        $meta = [];
        foreach ($jobs as $job) {
            $jobSkills = $this->skillLowongan($job);
            $jobDomains = $this->analyzer->domainDariTeks($this->teksLowongan($job));
            $jobLevel = $this->levelLowongan($job);

            $meta[$job->id] = [
                'job' => $job,
                'skill' => $jobSkills,
                'domain' => $jobDomains,
                'level' => $jobLevel,
            ];

            $dokumen[] = [
                'id' => $job->id,
                'teks' => $this->dokumenBerbobot($job, $jobSkills),
            ];
        }

        $kueri = $this->kueri($analysis, $query, $profilSkill, $profilDomain, $profilLevel);
        $peringkat = collect($this->tfidf->skorKombinasi($kueri, $dokumen))
            ->keyBy('id');

        $hasil = [];
        foreach ($jobs as $job) {
            $item = $peringkat->get($job->id);
            if ($item === null) {
                continue;
            }

            $data = $meta[$job->id];
            $jobSkills = $data['skill'];
            $cocok = array_values(array_intersect($jobSkills, $profilSkill));
            $kurang = array_values(array_diff($jobSkills, $profilSkill));
            $generik = ['frontend', 'backend', 'fullstack', 'api', 'git', 'github', 'gitlab'];
            $cocokTampil = array_values(array_diff($cocok, $generik));
            $kurangTampil = array_values(array_diff($kurang, $generik));

            $coverage = empty($jobSkills)
                ? 0.45
                : count($cocok) / count($jobSkills);

            $cos = min(1.0, (float) $item['skor'] * 2.1);

            $domainFactor = 1.0;
            if (! empty($data['domain']) && ! empty($profilDomain)) {
                $domainFactor = count(array_intersect($data['domain'], $profilDomain)) > 0 ? 1.0 : 0.55;
            } elseif (! empty($data['domain'])) {
                $domainFactor = 0.85;
            }

            $levelFactor = 1.0;
            $jobRank = $data['level'];
            if ($jobRank !== null) {
                $diff = $jobRank - $profilRank;
                $levelFactor = match (true) {
                    $diff >= 2 => 0.15,
                    $diff === 1 => 0.60,
                    $diff === 0 => 1.0,
                    default => 0.90,
                };
            }

            $final = (0.55 * $coverage + 0.45 * $cos) * $domainFactor * $levelFactor;
            $final = max(0.0, min(1.0, $final));
            $kecocokan = (int) round(100 * ($final ** 0.65));
            $kecocokan = max(5, min(99, $kecocokan));

            if ($jobRank !== null && $jobRank - $profilRank >= 2) {
                continue;
            }

            if ($kecocokan < 10) {
                continue;
            }

            $hasil[] = [
                'id' => $job->id,
                'judul_posisi' => $job->judul_posisi,
                'perusahaan' => $job->perusahaan,
                'lokasi' => $job->lokasi,
                'skor' => round((float) $item['skor'], 6),
                'kecocokan' => $kecocokan,
                'skor_akhir' => round($final, 4),
                'level_posisi' => self::LEVEL_LABEL[$jobRank] ?? 'tidak disebutkan',
                'domain_posisi' => array_slice($data['domain'], 0, 2),
                'skill_cocok' => array_slice($cocokTampil, 0, 8),
                'skill_kurang' => array_slice($kurangTampil, 0, 8),
                'alasan' => $this->susunAlasan($cocokTampil, $kurangTampil, $jobRank, $profilRank, $data['domain'], $profilDomain),
                'metode' => 'tf-idf + cosine + kelayakan level',
                '_coverage' => $coverage,
            ];
        }

        $hasil = $this->dedup($hasil);
        usort($hasil, fn (array $a, array $b) => [$b['kecocokan'], $b['_coverage']] <=> [$a['kecocokan'], $a['_coverage']]);

        $gap = $this->gapSkill($hasil);
        $hasil = array_slice($hasil, 0, $limit);
        foreach ($hasil as &$row) {
            unset($row['_coverage']);
        }
        unset($row);

        if (empty($hasil)) {
            return $this->kosong('Belum ada lowongan yang cukup dekat dengan profil Anda.');
        }

        $terbaik = $hasil[0]['kecocokan'];
        if ($terbaik < 30) {
            return [
                'hasil' => [],
                'gap_skill' => $gap,
                'abstain' => true,
                'pesan' => 'Belum ada lowongan aktif yang cukup relevan dengan profil Anda. Tingkatkan skill inti atau perluas kata kunci pencarian.',
            ];
        }

        return [
            'hasil' => $hasil,
            'gap_skill' => $gap,
            'abstain' => false,
            'pesan' => null,
        ];
    }

    private function kueri(array $analysis, ?string $query, array $profilSkill, array $profilDomain, string $profilLevel): array
    {
        $profilTeks = trim(implode(' ', array_filter([
            implode(' ', $profilSkill),
            implode(' ', $profilDomain),
            $profilLevel,
            $analysis['headline'] ?? null,
            $analysis['ringkasan'] ?? null,
            collect($analysis['pengalaman'] ?? [])->implode(' '),
            collect($analysis['pendidikan'] ?? [])->implode(' '),
        ])));

        if ($query !== null && trim($query) !== '') {
            return [
                ['teks' => $query, 'bobot' => 0.6],
                ['teks' => $profilTeks, 'bobot' => 0.4],
            ];
        }

        return [
            ['teks' => implode(' ', $profilSkill), 'bobot' => 0.55],
            ['teks' => implode(' ', $profilDomain).' '.$profilLevel, 'bobot' => 0.25],
            ['teks' => collect($analysis['pengalaman'] ?? [])->implode(' ').' '.($analysis['ringkasan'] ?? ''), 'bobot' => 0.20],
        ];
    }

    private function skillProfil(array $analysis): array
    {
        $skills = $this->analyzer->kanonikDaftar($analysis['skill'] ?? []);

        if (in_array('fullstack', $skills, true)) {
            $skills[] = 'frontend';
            $skills[] = 'backend';
        }

        return array_slice(array_values(array_unique($skills)), 0, 30);
    }

    private function domainProfil(array $analysis): array
    {
        $domain = $analysis['domain'] ?? [];
        if (is_string($domain)) {
            $domain = [$domain];
        }

        return array_values(array_filter((array) $domain, fn ($item) => is_string($item) && $item !== ''));
    }

    private function levelProfil(array $analysis): string
    {
        $level = mb_strtolower((string) ($analysis['level_karier'] ?? 'fresh graduate'));

        return array_key_exists($level, self::LEVEL_RANK) ? $level : 'fresh graduate';
    }

    private function skillLowongan(Lowongan $job): array
    {
        $skills = $this->analyzer->kanonikDaftar($job->keahlian ?? []);
        $dariTeks = $this->analyzer->skillDariTeks($job->judul_posisi.' '.$job->deskripsi);

        return array_values(array_unique(array_merge($skills, $dariTeks)));
    }

    private function teksLowongan(Lowongan $job): string
    {
        return $job->judul_posisi.' '.$job->deskripsi.' '.implode(' ', $job->keahlian ?? []);
    }

    private function dokumenBerbobot(Lowongan $job, array $jobSkills): string
    {
        $judul = trim((string) $job->judul_posisi);
        $keahlian = implode(' ', $job->keahlian ?? []);
        $kanonik = implode(' ', $jobSkills);
        $deskripsi = trim((string) $job->deskripsi);

        return implode(' ', array_filter([
            $judul, $judul, $judul,
            $keahlian, $keahlian,
            $kanonik, $kanonik,
            $deskripsi,
        ]));
    }

    private function levelLowongan(Lowongan $job): ?int
    {
        $teks = mb_strtolower($job->judul_posisi.' '.$job->deskripsi, 'UTF-8');

        if (preg_match('/\b(intern|internship|magang)\b/u', $teks) === 1) {
            return 0;
        }
        if (preg_match('/\b(senior|sr\.?|lead|principal|head of|manager|architect|expert)\b/u', $teks) === 1) {
            return 4;
        }
        if (preg_match('/\b(junior|entry level|fresh graduate|freshgraduate)\b/u', $teks) === 1) {
            return 2;
        }
        if (preg_match('/(\d{1,2})\s*\+?\s*(tahun|years?)/u', $teks, $match) === 1) {
            $tahun = (int) $match[1];
            if ($tahun >= 5) {
                return 4;
            }
            if ($tahun >= 3) {
                return 3;
            }
            if ($tahun >= 1) {
                return 2;
            }
        }

        return null;
    }

    private function susunAlasan(
        array $cocok,
        array $kurang,
        ?int $jobRank,
        int $profilRank,
        array $jobDomain,
        array $profilDomain
    ): string {
        $bagian = [];

        if (! empty($cocok)) {
            $bagian[] = 'Skill yang cocok: '.implode(', ', array_slice($cocok, 0, 4));
        } else {
            $bagian[] = 'Belum ada skill utama yang cocok secara langsung';
        }

        if (! empty($jobDomain) && ! empty($profilDomain) && count(array_intersect($jobDomain, $profilDomain)) > 0) {
            $bagian[] = 'bidang '.implode('/', array_slice(array_intersect($jobDomain, $profilDomain), 0, 2)).' sejalan dengan profil';
        }

        if ($jobRank !== null) {
            $diff = $jobRank - $profilRank;
            if ($diff >= 2) {
                $bagian[] = 'posisi ini berada jauh di atas level Anda saat ini sehingga skor diturunkan';
            } elseif ($diff === 1) {
                $bagian[] = 'posisi ini satu tingkat di atas level Anda';
            }
        }

        if (! empty($kurang)) {
            $bagian[] = 'perlu dipelajari: '.implode(', ', array_slice($kurang, 0, 3));
        }

        return ucfirst(implode('; ', $bagian)).'.';
    }

    private function gapSkill(array $hasil): array
    {
        $generik = ['api', 'git', 'github', 'gitlab', 'frontend', 'backend', 'fullstack', 'linux'];
        $counter = [];
        foreach (array_slice($hasil, 0, 5) as $row) {
            foreach ($row['skill_kurang'] as $skill) {
                if (in_array($skill, $generik, true)) {
                    continue;
                }
                $counter[$skill] = ($counter[$skill] ?? 0) + 1;
            }
        }

        arsort($counter);

        return array_slice(array_keys($counter), 0, 5);
    }

    private function dedup(array $hasil): array
    {
        $unik = [];
        foreach ($hasil as $row) {
            $kunci = mb_strtolower(trim((string) $row['judul_posisi']).'|'.trim((string) $row['perusahaan']));
            if (! isset($unik[$kunci]) || $row['kecocokan'] > $unik[$kunci]['kecocokan']) {
                $unik[$kunci] = $row;
            }
        }

        return array_values($unik);
    }

    private function kosong(string $pesan): array
    {
        return [
            'hasil' => [],
            'gap_skill' => [],
            'abstain' => true,
            'pesan' => $pesan,
        ];
    }
}
