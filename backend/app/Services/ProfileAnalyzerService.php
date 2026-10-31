<?php

namespace App\Services;

class ProfileAnalyzerService
{
    private const SKILLS = [
        'php' => ['php'],
        'laravel' => ['laravel'],
        'javascript' => ['javascript', 'java script'],
        'typescript' => ['typescript'],
        'python' => ['python'],
        'java' => ['java'],
        'c#' => ['c#', 'c sharp', 'csharp'],
        'c++' => ['c++', 'cpp'],
        'dotnet' => ['.net', 'dotnet', 'asp.net'],
        'golang' => ['golang', 'go language'],
        'kotlin' => ['kotlin'],
        'swift' => ['swift'],
        'dart' => ['dart'],
        'sql' => ['sql'],
        'ruby' => ['ruby'],
        'rust' => ['rust'],
        'html' => ['html'],
        'css' => ['css'],
        'react' => ['react', 'react.js', 'reactjs'],
        'vue' => ['vue', 'vue.js', 'vuejs'],
        'angular' => ['angular'],
        'svelte' => ['svelte'],
        'nextjs' => ['next.js', 'nextjs'],
        'nuxt' => ['nuxt', 'nuxt.js'],
        'tailwind' => ['tailwind', 'tailwindcss'],
        'bootstrap' => ['bootstrap'],
        'redux' => ['redux'],
        'zustand' => ['zustand'],
        'jquery' => ['jquery'],
        'codeigniter' => ['codeigniter'],
        'express' => ['express', 'express.js', 'expressjs'],
        'nodejs' => ['node.js', 'nodejs', 'node js'],
        'django' => ['django'],
        'flask' => ['flask'],
        'spring' => ['spring', 'spring boot'],
        'rails' => ['rails', 'ruby on rails'],
        'nestjs' => ['nestjs', 'nest.js'],
        'rest api' => ['rest api', 'restful api', 'rest-api', 'restful'],
        'graphql' => ['graphql'],
        'grpc' => ['grpc'],
        'api' => ['api', 'apis'],
        'microservices' => ['microservices', 'microservice'],
        'frontend' => ['frontend', 'front-end', 'front end'],
        'backend' => ['backend', 'back-end', 'back end'],
        'fullstack' => ['fullstack', 'full-stack', 'full stack'],
        'mysql' => ['mysql'],
        'postgresql' => ['postgresql', 'postgres', 'postgre sql'],
        'mongodb' => ['mongodb', 'mongo'],
        'redis' => ['redis'],
        'sqlite' => ['sqlite'],
        'oracle' => ['oracle'],
        'sqlserver' => ['sql server', 'sqlserver', 'mssql'],
        'git' => ['git'],
        'github' => ['github'],
        'gitlab' => ['gitlab'],
        'docker' => ['docker'],
        'kubernetes' => ['kubernetes', 'k8s'],
        'cicd' => ['ci/cd', 'ci cd', 'cicd', 'continuous integration', 'continuous delivery'],
        'jenkins' => ['jenkins'],
        'nginx' => ['nginx'],
        'apache' => ['apache'],
        'linux' => ['linux'],
        'bash' => ['bash', 'shell script'],
        'aws' => ['aws', 'amazon web services'],
        'azure' => ['azure'],
        'gcp' => ['gcp', 'google cloud'],
        'terraform' => ['terraform'],
        'ansible' => ['ansible'],
        'networking' => ['networking', 'network engineering', 'computer network', 'jaringan', 'network'],
        'tcpip' => ['tcp/ip', 'tcp ip'],
        'vlan' => ['vlan'],
        'qos' => ['qos'],
        'routing' => ['routing'],
        'switching' => ['switching'],
        'cisco' => ['cisco'],
        'mikrotik' => ['mikrotik'],
        'firewall' => ['firewall'],
        'voip' => ['voip'],
        'infrastructure' => ['infrastructure', 'infrastruktur'],
        'virtualization' => ['virtualization', 'virtualisasi', 'vmware'],
        'data analysis' => ['data analysis', 'analisis data'],
        'data science' => ['data science', 'data scientist'],
        'machine learning' => ['machine learning'],
        'deep learning' => ['deep learning'],
        'tensorflow' => ['tensorflow'],
        'pytorch' => ['pytorch'],
        'pandas' => ['pandas'],
        'numpy' => ['numpy'],
        'power bi' => ['power bi', 'powerbi'],
        'tableau' => ['tableau'],
        'excel' => ['excel', 'spreadsheet'],
        'etl' => ['etl', 'extract transform load'],
        'testing' => ['testing', 'software testing'],
        'qa' => ['qa', 'quality assurance'],
        'selenium' => ['selenium'],
        'cypress' => ['cypress'],
        'jest' => ['jest'],
        'phpunit' => ['phpunit'],
        'android' => ['android'],
        'ios' => ['ios'],
        'flutter' => ['flutter'],
        'react native' => ['react native'],
        'figma' => ['figma'],
        'uiux' => ['ui/ux', 'ui ux', 'user experience', 'user interface'],
        'cybersecurity' => ['cybersecurity', 'cyber security', 'keamanan siber'],
        'penetration testing' => ['penetration testing', 'pentest'],
        'communication' => ['communication', 'komunikasi'],
        'teamwork' => ['teamwork', 'team work', 'kerja sama tim'],
        'leadership' => ['leadership', 'kepemimpinan'],
        'problem solving' => ['problem solving', 'pemecahan masalah'],
        'project management' => ['project management', 'manajemen proyek'],
        'agile' => ['agile'],
        'scrum' => ['scrum'],
    ];

    private const SOFT_SKILLS = [
        'communication', 'teamwork', 'leadership', 'problem solving',
        'project management', 'agile', 'scrum',
    ];

    private const DOMAIN_SKILLS = [
        'Frontend Web' => [
            'react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'html', 'css',
            'tailwind', 'bootstrap', 'redux', 'zustand', 'jquery', 'frontend',
        ],
        'Backend Web' => [
            'laravel', 'php', 'express', 'nodejs', 'django', 'flask', 'spring',
            'rails', 'nestjs', 'rest api', 'graphql', 'grpc', 'microservices',
            'backend', 'api', 'codeigniter',
        ],
        'Database' => [
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sqlserver',
        ],
        'DevOps & Cloud' => [
            'docker', 'kubernetes', 'cicd', 'jenkins', 'nginx', 'apache', 'linux',
            'bash', 'aws', 'azure', 'gcp', 'terraform', 'ansible', 'git', 'github', 'gitlab',
        ],
        'Network & Infrastructure' => [
            'networking', 'tcpip', 'vlan', 'qos', 'routing', 'switching', 'cisco',
            'mikrotik', 'firewall', 'voip', 'infrastructure', 'virtualization',
        ],
        'Data & AI' => [
            'data analysis', 'data science', 'machine learning', 'deep learning',
            'tensorflow', 'pytorch', 'pandas', 'numpy', 'power bi', 'tableau', 'excel', 'etl',
        ],
        'Quality Assurance' => ['testing', 'qa', 'selenium', 'cypress', 'jest', 'phpunit'],
        'Mobile' => ['android', 'ios', 'flutter', 'react native', 'kotlin', 'swift', 'dart'],
        'UI/UX' => ['figma', 'uiux'],
        'Cybersecurity' => ['cybersecurity', 'penetration testing'],
    ];

    private const PRODI = [
        'teknik informatika' => 'Teknik Informatika',
        'informatics engineering' => 'Teknik Informatika',
        'informatika' => 'Teknik Informatika',
        'ilmu komputer' => 'Ilmu Komputer',
        'computer science' => 'Ilmu Komputer',
        'sistem informasi' => 'Sistem Informasi',
        'information system' => 'Sistem Informasi',
        'teknologi informasi' => 'Teknologi Informasi',
        'information technology' => 'Teknologi Informasi',
        'rekayasa perangkat lunak' => 'Rekayasa Perangkat Lunak',
        'software engineering' => 'Rekayasa Perangkat Lunak',
        'sistem informasi akuntansi' => 'Sistem Informasi Akuntansi',
    ];

    public function analyze(string $text): array
    {
        $lower = mb_strtolower($text, 'UTF-8');
        $found = $this->ekstrakSkill($lower);

        $technical = [];
        $soft = [];
        foreach ($found as $skill => $count) {
            if (in_array($skill, self::SOFT_SKILLS, true)) {
                $soft[] = $skill;
            } else {
                $technical[] = $skill;
            }
        }

        $programStudi = $this->deteksiProdi($lower);
        $pengalaman = $this->ekstrakPengalaman($text);
        $pendidikan = $this->ekstrakPendidikan($text, $programStudi);
        $tahun = $this->hitungTahunPengalaman($lower);
        $level = $this->deteksiLevel($lower, $tahun);
        $domain = $this->deteksiDomain($technical, $lower);
        $nama = $this->ekstrakNama($text);
        $headline = $this->ekstrakHeadline($text, $nama);

        $ringkasan = $this->susunRingkasan(
            $level, $programStudi, $domain, $technical, $pengalaman
        );

        return [
            'nama' => $nama ?? 'Kandidat',
            'headline' => $headline,
            'ringkasan' => $ringkasan,
            'program_studi' => $programStudi,
            'level_karier' => $level,
            'pengalaman_tahun' => $tahun,
            'domain' => $domain,
            'skill' => array_slice($technical, 0, 24),
            'skill_utama' => array_slice($technical, 0, 8),
            'skill_pendukung' => array_slice($technical, 8),
            'soft_skill' => $soft,
            'pengalaman' => $pengalaman,
            'pendidikan' => $pendidikan,
            'kekuatan' => $this->susunKekuatan($level, $programStudi, $domain, $technical, $pengalaman),
            'mode' => 'deterministik',
        ];
    }

    public function kanonikSkill(string $text): ?string
    {
        $lower = mb_strtolower(trim($text), 'UTF-8');
        if ($lower === '') {
            return null;
        }

        $best = null;
        $bestLength = 0;
        foreach (self::SKILLS as $canonical => $aliases) {
            foreach ($aliases as $alias) {
                $alias = mb_strtolower($alias, 'UTF-8');
                if ($alias === '') {
                    continue;
                }
                $pattern = '/(?<![\p{L}\p{N}])'.preg_quote($alias, '/').'(?![\p{L}\p{N}])/u';
                if (preg_match($pattern, $lower) === 1 && mb_strlen($alias) > $bestLength) {
                    $best = $canonical;
                    $bestLength = mb_strlen($alias);
                }
            }
        }

        return $best;
    }

    public function kanonikDaftar(array $items): array
    {
        $out = [];
        foreach ($items as $item) {
            if (! is_string($item)) {
                continue;
            }
            $canonical = $this->kanonikSkill($item);
            if ($canonical !== null) {
                $out[] = $canonical;
            }
        }

        return array_values(array_unique($out));
    }

    public function skillDariTeks(string $text): array
    {
        $found = $this->ekstrakSkill(mb_strtolower($text, 'UTF-8'));

        return array_keys($found);
    }

    public function domainDariTeks(string $text): array
    {
        $found = $this->ekstrakSkill(mb_strtolower($text, 'UTF-8'));
        $technical = [];
        foreach ($found as $skill => $count) {
            if (! in_array($skill, self::SOFT_SKILLS, true)) {
                $technical[] = $skill;
            }
        }

        return $this->deteksiDomain($technical, mb_strtolower($text, 'UTF-8'));
    }

    private function ekstrakSkill(string $lower): array
    {
        $found = [];
        foreach (self::SKILLS as $canonical => $aliases) {
            $count = 0;
            foreach ($aliases as $alias) {
                $alias = mb_strtolower($alias, 'UTF-8');
                if ($alias === '') {
                    continue;
                }
                $pattern = '/(?<![\p{L}\p{N}])'.preg_quote($alias, '/').'(?![\p{L}\p{N}])/u';
                $count += (int) preg_match_all($pattern, $lower);
            }
            if ($count > 0) {
                $found[$canonical] = $count;
            }
        }

        arsort($found);

        return $found;
    }

    private function deteksiProdi(string $lower): string
    {
        foreach (self::PRODI as $needle => $label) {
            if (str_contains($lower, $needle)) {
                return $label;
            }
        }

        return 'Umum';
    }

    private function deteksiLevel(string $lower, float $tahun): string
    {
        if (preg_match('/\b(fresh graduate|freshgraduate|lulusan baru|new graduate|entry level)\b/i', $lower) === 1) {
            return 'fresh graduate';
        }
        if ($tahun >= 5 || preg_match('/\b(senior|lead|principal|head of|manager|architect)\b/i', $lower) === 1) {
            return 'senior';
        }
        if ($tahun >= 3) {
            return 'menengah';
        }
        if ($tahun >= 1) {
            return 'junior';
        }
        if (preg_match('/\b(intern|internship|magang)\b/i', $lower) === 1) {
            return 'fresh graduate';
        }

        return 'fresh graduate';
    }

    private function hitungTahunPengalaman(string $lower): float
    {
        $intervals = [];
        $lines = preg_split('/\r\n|\r|\n/', $lower) ?: [];
        foreach ($lines as $line) {
            if (preg_match('/\b(universitas|university|institute|college|sekolah|sma|smk|sarjana|bachelor|degree|pendidikan|education|gpa|ipk)\b/u', $line) === 1) {
                continue;
            }
            if (preg_match('/\b(intern|internship|magang|work|working|bekerja|engineer|developer|programmer|analyst|staff|freelance|project|consultant|administrator|support|network|company|perusahaan)\b/u', $line) !== 1) {
                continue;
            }
            if (preg_match_all('/\b((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|sekarang|present|now|current)\b/iu', $line, $matches, PREG_SET_ORDER) === 0) {
                continue;
            }
            foreach ($matches as $row) {
                $start = (int) $row[1];
                $end = preg_match('/^\d{4}$/', $row[2]) === 1 ? (int) $row[2] : (int) date('Y');
                if ($end >= $start && ($end - $start) <= 40) {
                    $intervals[] = [$start, $end];
                }
            }
        }

        $years = 0;
        if (! empty($intervals)) {
            usort($intervals, fn ($a, $b) => $a[0] <=> $b[0]);
            $merged = [];
            foreach ($intervals as [$start, $end]) {
                $last = count($merged) - 1;
                if ($last >= 0 && $start <= $merged[$last][1]) {
                    $merged[$last][1] = max($merged[$last][1], $end);
                } else {
                    $merged[] = [$start, $end];
                }
            }
            foreach ($merged as [$start, $end]) {
                $years += $end - $start;
            }
        }

        if (preg_match('/(\d{1,2})\+?\s*(tahun|years?)\s*(of\s*)?(pengalaman|experience)/iu', $lower, $match) === 1) {
            $years = max($years, (float) $match[1]);
        }

        return round((float) $years, 1);
    }

    private function deteksiDomain(array $technical, string $lower): array
    {
        $technical = array_map(fn ($s) => mb_strtolower($s), $technical);
        $scores = [];
        foreach (self::DOMAIN_SKILLS as $domain => $skills) {
            $count = 0;
            foreach ($skills as $skill) {
                if (in_array($skill, $technical, true)) {
                    $count++;
                }
            }
            if ($count > 0) {
                $scores[$domain] = $count;
            }
        }

        $hasFrontend = isset($scores['Frontend Web']);
        $hasBackend = isset($scores['Backend Web']);
        if (in_array('fullstack', $technical, true) || ($hasFrontend && $hasBackend)) {
            $scores['Full-Stack Web'] = ($scores['Frontend Web'] ?? 0) + ($scores['Backend Web'] ?? 0);
        }

        arsort($scores);

        $domains = array_keys($scores);
        if (empty($domains)) {
            return ['Teknologi Informasi'];
        }

        return array_slice(array_values(array_unique($domains)), 0, 3);
    }

    private function ekstrakNama(string $text): ?string
    {
        if (preg_match('/^(?:nama|name)\s*[:\-]\s*(.+)$/im', $text, $match) === 1) {
            $name = trim($match[1]);
            if ($name !== '' && mb_strlen($name) <= 60) {
                return $name;
            }
        }

        $lines = preg_split('/\r\n|\r|\n/', trim($text)) ?: [];
        foreach (array_slice($lines, 0, 6) as $line) {
            $line = trim($line);
            if ($line === '' || mb_strlen($line) > 50) {
                continue;
            }
            if (preg_match('/\b(linkedin|engineer|developer|universitas|university|informatika|summary|pengalaman|skill|email|phone|profil)\b/i', $line) === 1) {
                continue;
            }
            if (preg_match("/^[\p{Lu}][\p{L}.'-]+(?:\s+[\p{Lu}][\p{L}.'-]+){1,3}$/u", $line) === 1) {
                return $line;
            }
        }

        return null;
    }

    private function ekstrakHeadline(string $text, ?string $nama): ?string
    {
        $lines = preg_split('/\r\n|\r|\n/', trim($text)) ?: [];
        foreach ($lines as $line) {
            $line = trim(preg_replace('/\s+/', ' ', $line));
            if ($line === '' || ($nama !== null && strcasecmp($line, $nama) === 0)) {
                continue;
            }
            if (mb_strlen($line) < 15) {
                continue;
            }

            return mb_strlen($line) > 160 ? mb_substr($line, 0, 157).'...' : $line;
        }

        return null;
    }

    private function ekstrakPengalaman(string $text): array
    {
        $lines = preg_split('/\r\n|\r|\n/', $text) ?: [];
        $out = [];
        foreach ($lines as $line) {
            $line = trim(preg_replace('/\s+/', ' ', $line));
            if (mb_strlen($line) < 12 || mb_strlen($line) > 220) {
                continue;
            }
            if (preg_match('/\b(universitas|university|institute|college|sekolah|sma|smk|degree|bachelor|sarjana|gpa|ipk|graduate with|proficient|skills?|keahlian)\b/i', $line) === 1) {
                continue;
            }

            $score = 0;
            if (preg_match('/\b((?:19|20)\d{2})\b/', $line) === 1) {
                $score += 2;
            }
            if (preg_match('/(\s[—–-]\s|\s\|\s|\s@\s|\bat\b)/i', $line) === 1) {
                $score += 1;
            }
            if (preg_match('/\b(intern|internship|magang|engineer|developer|programmer|analyst|staff|freelance|project|consultant|administrator|support|network)\b/i', $line) === 1) {
                $score += 1;
            }
            if ($score < 2) {
                continue;
            }

            $out[] = $this->rapikan($line);
        }

        $out = array_values(array_unique($out));
        if (empty($out)) {
            $sentences = preg_split('/(?<=[.!?])\s+/', trim($text)) ?: [];
            foreach ($sentences as $sentence) {
                $sentence = trim(preg_replace('/\s+/', ' ', $sentence));
                if (mb_strlen($sentence) < 20 || mb_strlen($sentence) > 220) {
                    continue;
                }
                if (preg_match('/(graduate with|proficient|objective|summary|about me)/i', $sentence) === 1) {
                    continue;
                }
                if (preg_match('/\b(intern|magang|engineer|developer|staff|freelance)\b/i', $sentence) === 1) {
                    $out[] = $this->rapikan($sentence);
                }
            }
        }

        return array_slice(array_values(array_unique($out)), 0, 4);
    }

    private function ekstrakPendidikan(string $text, string $prodi): array
    {
        $lines = preg_split('/\r\n|\r|\n/', $text) ?: [];
        $out = [];
        foreach ($lines as $line) {
            $line = trim(preg_replace('/\s+/', ' ', $line));
            if ($line === '' || mb_strlen($line) > 200) {
                continue;
            }
            if (preg_match('/\b(universitas|university|institute|college|sekolah tinggi|politeknik)\b/i', $line) === 1
                || preg_match('/^(S1|D3|D4|S2)\b/i', $line) === 1) {
                $out[] = $this->rapikan($line);
            }
        }

        $out = array_values(array_unique($out));
        if (empty($out) && $prodi !== 'Umum') {
            $out[] = $prodi;
        }

        return array_slice($out, 0, 3);
    }

    private function susunRingkasan(
        string $level,
        string $prodi,
        array $domain,
        array $technical,
        array $pengalaman
    ): string {
        $levelLabel = ucfirst($level);
        $prodiText = $prodi === 'Umum' ? 'bidang teknologi informasi' : $prodi;
        $domainText = implode(' dan ', array_slice($domain, 0, 2));
        $skillText = implode(', ', array_slice($technical, 0, 5));

        $text = "{$levelLabel} {$prodiText} dengan fokus {$domainText}.";
        if ($skillText !== '') {
            $text .= " Menguasai {$skillText}.";
        }
        if (! empty($pengalaman)) {
            $text .= ' Pengalaman tercatat: '.$pengalaman[0].'.';
        }

        $target = in_array($level, ['fresh graduate', 'junior'], true)
            ? 'posisi entry-level atau junior'
            : 'posisi yang sesuai dengan pengalaman yang dimiliki';
        $text .= " Profil paling relevan diarahkan ke {$target} pada bidang {$domainText}.";

        return $text;
    }

    private function susunKekuatan(
        string $level,
        string $prodi,
        array $domain,
        array $technical,
        array $pengalaman
    ): array {
        $out = [];

        if (count($technical) >= 5) {
            $out[] = 'Menguasai '.count($technical).' skill teknis inti, termasuk '
                .implode(', ', array_slice($technical, 0, 5)).'.';
        } elseif (! empty($technical)) {
            $out[] = 'Menguasai '.implode(', ', $technical).'.';
        }

        if (in_array('Full-Stack Web', $domain, true)) {
            $out[] = 'Kombinasi kemampuan frontend dan backend yang mendukung pekerjaan full-stack.';
        }
        if (in_array('Network & Infrastructure', $domain, true) && in_array('Full-Stack Web', $domain, true)) {
            $out[] = 'Kombinasi pengembangan aplikasi dan infrastruktur jaringan yang jarang dimiliki fresh graduate.';
        }
        if (! empty($pengalaman)) {
            $out[] = 'Pengalaman kerja/magang: '.$pengalaman[0].'.';
        }
        if ($prodi !== 'Umum') {
            $out[] = 'Latar belakang pendidikan '.$prodi.' relevan dengan bidang teknologi.';
        }
        if (in_array($level, ['fresh graduate', 'junior'], true)) {
            $out[] = 'Siap untuk posisi entry-level dengan pendampingan dan pengembangan berkelanjutan.';
        }

        return array_slice(array_values(array_unique($out)), 0, 4);
    }

    private function rapikan(string $text): string
    {
        $text = trim(preg_replace('/\s+/', ' ', $text));

        return mb_strlen($text) > 180 ? mb_substr($text, 0, 177).'...' : $text;
    }
}
