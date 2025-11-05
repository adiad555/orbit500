<?php
// Ganti dengan URL Firebase kamu
define('FIREBASE_URL', 'https://antamgrow-default-rtdb.firebaseio.com/');
define('ACCESS_TOKEN', ''); // Jika perlu auth token

function getFirebaseData($path) {
    $url = FIREBASE_URL . $path . '.json' . ACCESS_TOKEN;
    $json = file_get_contents($url);
    return json_decode($json, true);
}

function patchFirebaseData($path, $data) {
    $url = FIREBASE_URL . $path . '.json' . ACCESS_TOKEN;
    $options = [
        'http' => [
            'method' => 'PATCH',
            'header' => "Content-Type: application/json\r\n",
            'content' => json_encode($data),
        ]
    ];
    $context = stream_context_create($options);
    return file_get_contents($url, false, $context);
}

function pushToFirebase($path, $data) {
    $url = FIREBASE_URL . $path . '.json' . ACCESS_TOKEN;
    $options = [
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => json_encode($data),
        ]
    ];
    $context = stream_context_create($options);
    return file_get_contents($url, false, $context);
}

date_default_timezone_set("Asia/Jakarta");
$users = getFirebaseData("produk_aktif");

foreach ($users as $nohp => $produkList) {
    $user = getFirebaseData("users/$nohp");
    $saldo = $user['saldo'] ?? 0;
    $totalProfit = 0;

    foreach ($produkList as $key => $produk) {
        if (($produk['status'] ?? '') !== 'aktif') continue;

        $hariKe = $produk['hari_ke'] ?? 0;
        $profitHarian = $produk['profit_per_hari'] ?? 0;
        $terakhir = isset($produk['terakhir_profit']) ? strtotime($produk['terakhir_profit']) : 0;
        $now = time();

        $selisihHari = floor(($now - $terakhir) / (60 * 60 * 24));

        if ($selisihHari > 0 && $profitHarian > 0) {
            $profit = $profitHarian * $selisihHari;
            $totalProfit += $profit;

            $hariBaru = $hariKe + $selisihHari;
            $statusBaru = $hariBaru >= 32 ? "selesai" : "aktif";

            patchFirebaseData("produk_aktif/$nohp/$key", [
                "hari_ke" => $hariBaru,
                "terakhir_profit" => date("c"),
                "status" => $statusBaru
            ]);

            pushToFirebase("riwayat_profit/$nohp", [
                "nama_produk" => $produk["nama"] ?? "Produk",
                "profit" => $profit,
                "hari_ke" => $hariBaru,
                "waktu" => date("c"),
                "catatan" => "Profit otomatis $selisihHari hari"
            ]);
        }
    }

    if ($totalProfit > 0) {
        $saldo += $totalProfit;
        patchFirebaseData("users/$nohp", ["saldo" => $saldo]);
    }
}

echo "Profit otomatis berhasil dijalankan!";
?>
