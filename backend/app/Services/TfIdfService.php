<?php

namespace App\Services;

/**
 * TF-IDF + Cosine Similarity — Pencocokan lowongan berbasis teks (murni lokal, tanpa LLM).
 *
 * Pipeline 4 tahap (208 baris historis):
 * 1. Tokenisasi Unicode \p{L}\p{N}
 * 2. Stopword ID+EN (60+ kata)
 * 3. Normalisasi sinonim ID->EN (70+ pasangan) untuk menjembatani kueri Indonesia vs deskripsi Inggris
 * 4. Pembobotan TF sublinear 1+log(tf) + IDF smoothed + Cosine
 *
 * Dipakai dua jalur:
 * - cari()            : single query (CareerController rekomendasiLowongan)
 * - skorKombinasi()   : weighted 60% query + 40% profil (JobController search)
 */
class TfIdfService
{
    /** 60+ stopword ID & EN */
    private const STOPWORDS = [
        'yang','dan','di','ke','dari','untuk','dengan','pada','atau','ini','itu','adalah','akan','tidak','para','dalam','agar','bisa','dapat','juga','saat','the','and','for','with','from','that','this','are','you','your','our','will','have','has','had','can','may','must','not','but','all','any','per','job','jobs','work','role','position','positions','candidate','ideal','requirement','qualifications','responsibilities','experience','ability','satu','bagi','lebih','karena','sebuah','sangat','harus','oleh','sebagai','tentang','hingga','antara','setelah','telah','sudah','masih','hanya','perlu','melalui','secara','terhadap','kepada','menjadi','melakukan','bahasa','inggris','indonesia',
    ];

    /** 70+ sinonim ID -> EN (lowercase) */
    private const SINONIM = [
        'gaji' => 'salary','upah' => 'salary','kompensasi' => 'salary',
        'kerja' => 'work','bekerja' => 'work','pekerjaan' => 'work',
        'lowongan' => 'job','loker' => 'job',
        'pemasaran' => 'marketing','pengembang' => 'developer','pengembangan' => 'developer',
        'perangkat' => 'software','lunak' => 'software',
        'keuangan' => 'finance','akuntansi' => 'accounting','akuntan' => 'accounting',
        'penjualan' => 'sales','jual' => 'sales',
        'sumber' => 'human','daya' => 'human','manusia' => 'human','rekrutmen' => 'recruitment',
        'logistik' => 'logistics','gudang' => 'warehouse','kargo' => 'cargo','rantai' => 'chain','pasok' => 'supply',
        'teknologi' => 'technology','informasi' => 'information',
        'data' => 'data','analis' => 'analyst','jaringan' => 'network','sistem' => 'system',
        'keamanan' => 'security','aplikasi' => 'application','situs' => 'web','web' => 'web','situsweb' => 'web',
        'ponsel' => 'mobile','seluler' => 'mobile',
        'desain' => 'design','desainer' => 'designer',
        'penjualan' => 'sales','pemasaran' => 'marketing','iklan' => 'advertising',
        'konten' => 'content','seo' => 'seo',
        'admin' => 'admin','administrasi' => 'administration','sekretaris' => 'secretary',
        'kantor' => 'office','dukungan' => 'support','pelanggan' => 'customer',
        'manajemen' => 'management','manajer' => 'manager','proyek' => 'project','proyek' => 'project',
        'operasi' => 'operations','operasional' => 'operational',
        'kesehatan' => 'health','perawat' => 'nurse','dokter' => 'doctor',
        'pendidikan' => 'education','guru' => 'teacher','dosen' => 'lecturer',
        'penelitian' => 'research','peneliti' => 'researcher',
        'hukum' => 'legal','pengacara' => 'lawyer',
        'backend' => 'backend','frontend' => 'frontend','fullstack' => 'fullstack','tumpukan' => 'stack',
        'basis' => 'database','data' => 'data','awan' => 'cloud',
        'keahlian' => 'skill','keterampilan' => 'skill','kemampuan' => 'skill',
        'pengalaman' => 'experience','pendidikan' => 'education','kualifikasi' => 'qualification',
        'perusahaan' => 'company','industri' => 'industry','bisnis' => 'business',
    ];

    /**
     * Single query — dipakai CareerController::rekomendasiLowongan
     * @param string $profil teks gabungan profil kandidat
     * @param array<int,array{id:int,teks:string}> $dokumen
     * @return array<int,array{id:int,skor:float}> desc skor
     */
    public function cari(string $profil, array $dokumen): array
    {
        return $this->skorKombinasi([['teks' => $profil, 'bobot' => 1.0]], $dokumen);
    }

    /**
     * Weighted multi-query — dipakai JobController::search
     * @param array<int,array{teks:string,bobot:float}> $kueri
     * @param array<int,array{id:int,teks:string}> $dokumen
     * @return array<int,array{id:int,skor:float}> desc
     */
    public function skorKombinasi(array $kueri, array $dokumen): array
    {
        if (empty($dokumen) || empty($kueri)) return [];

        // Tokenisasi & normalisasi semua teks
        $tokensKueri = [];
        foreach ($kueri as $q) {
            $tokensKueri[] = [
                'tokens' => $this->normalisasi($q['teks']),
                'bobot' => (float) ($q['bobot'] ?? 1.0),
            ];
        }

        $tokensDokumen = [];
        $docIds = [];
        foreach ($dokumen as $d) {
            $tokensDokumen[] = $this->normalisasi($d['teks'] ?? '');
            $docIds[] = $d['id'];
        }

        // Bangun vocab & DF
        $allTokens = [];
        foreach ($tokensDokumen as $t) foreach (array_unique($t) as $tok) $allTokens[$tok] = true;
        foreach ($tokensKueri as $q) foreach (array_unique($q['tokens']) as $tok) $allTokens[$tok] = true;
        $vocab = array_keys($allTokens);
        if (empty($vocab)) return [];

        $vocabIndex = array_flip($vocab);
        $N = count($tokensDokumen);
        $df = array_fill(0, count($vocab), 0);
        foreach ($tokensDokumen as $t) {
            foreach (array_unique($t) as $tok) {
                if (isset($vocabIndex[$tok])) $df[$vocabIndex[$tok]]++;
            }
        }
        // IDF smoothed log((N+1)/(df+1))+1
        $idf = [];
        foreach ($df as $i => $freq) {
            $idf[$i] = log(($N + 1) / ($freq + 1)) + 1;
        }

        // TF-IDF dokumen
        $docVectors = [];
        $docNorms = [];
        foreach ($tokensDokumen as $tokens) {
            $vec = array_fill(0, count($vocab), 0.0);
            $tf = array_count_values($tokens);
            foreach ($tf as $tok => $cnt) {
                if (!isset($vocabIndex[$tok])) continue;
                $idx = $vocabIndex[$tok];
                $tfWeight = 1 + log((float) $cnt);
                $vec[$idx] = $tfWeight * $idf[$idx];
            }
            $norm = sqrt(array_sum(array_map(fn($x) => $x*$x, $vec)));
            $docVectors[] = $vec;
            $docNorms[] = $norm;
        }

        // Skor kombinasi berbobot
        $skor = array_fill(0, $N, 0.0);
        foreach ($tokensKueri as $q) {
            $qTokens = $q['tokens'];
            if (empty($qTokens)) continue;
            $qVec = array_fill(0, count($vocab), 0.0);
            $tf = array_count_values($qTokens);
            foreach ($tf as $tok => $cnt) {
                if (!isset($vocabIndex[$tok])) continue;
                $idx = $vocabIndex[$tok];
                $tfWeight = 1 + log((float) $cnt);
                $qVec[$idx] = $tfWeight * $idf[$idx];
            }
            $qNorm = sqrt(array_sum(array_map(fn($x) => $x*$x, $qVec)));
            if ($qNorm == 0) continue;
            $bobot = $q['bobot'];
            for ($i=0; $i<$N; $i++) {
                $dot = 0.0;
                for ($j=0; $j<count($vocab); $j++) $dot += $qVec[$j] * $docVectors[$i][$j];
                $den = $qNorm * ($docNorms[$i] ?: 1);
                $cos = $den > 0 ? $dot / $den : 0;
                $skor[$i] += $cos * $bobot;
            }
        }

        $hasil = [];
        foreach ($skor as $i => $s) $hasil[] = ['id' => $docIds[$i], 'skor' => (float) $s];
        usort($hasil, fn($a,$b) => $b['skor'] <=> $a['skor']);
        return $hasil;
    }

    /** Tokenisasi + stopword + sinonim */
    private function normalisasi(string $teks): array
    {
        $teks = mb_strtolower($teks, 'UTF-8');
        // Split Unicode letters/numbers
        $parts = preg_split('/[^\p{L}\p{N}]+/u', $teks, -1, PREG_SPLIT_NO_EMPTY);
        if (!$parts) return [];
        $out = [];
        foreach ($parts as $tok) {
            if (mb_strlen($tok, 'UTF-8') <= 1) continue;
            if (in_array($tok, self::STOPWORDS, true)) continue;
            $tok = self::SINONIM[$tok] ?? $tok;
            $out[] = $tok;
        }
        return $out;
    }
}
