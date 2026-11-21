<?php
// For shared hosting with PHP (cPanel). Change the password below before uploading.
$PASSWORD = 'change-me';
header('Content-Type: application/json');
$DATA = __DIR__ . '/data/data.json';
$BK   = __DIR__ . '/data/bookings.php';   // starts with a PHP guard line so it cannot be read from the web
function out($code, $o) { http_response_code($code); echo json_encode($o); exit; }
function rd_bk($f) { $r = @file_get_contents($f); if (!$r) return array(); $r = preg_replace('/^<\?php.*?\?>\s*/s', '', $r, 1); $a = json_decode($r, true); return is_array($a) ? $a : array(); }
function wr_bk($f, $a) { file_put_contents($f, "<?php http_response_code(403); exit; ?>\n" . json_encode(array_values($a), JSON_UNESCAPED_UNICODE), LOCK_EX); }
function s($v, $n) { return mb_substr(trim((string)$v), 0, $n); }
$j = json_decode(file_get_contents('php://input'), true);
if (!is_array($j) || !isset($j['op'])) out(400, array('ok' => false));
$op = $j['op'];
if ($op === 'book') {
  $k = array('id' => bin2hex(random_bytes(6)), 'ts' => time() * 1000, 'name' => s($j['name'] ?? '', 80), 'phone' => s($j['phone'] ?? '', 20), 'service' => s($j['service'] ?? '', 120), 'date' => s($j['date'] ?? '', 10), 'time' => s($j['time'] ?? '', 10), 'note' => s($j['note'] ?? '', 300), 'status' => 'new');
  $l = rd_bk($BK);
  if ($k['name'] === '' || !preg_match('/^[\d +()-]{7,20}$/', $k['phone']) || !preg_match('/^\d{4}-\d\d-\d\d$/', $k['date']) || count($l) >= 1000) out(400, array('ok' => false));
  $l[] = $k; wr_bk($BK, $l); out(200, array('ok' => true));
}
if (!isset($j['password']) || !hash_equals($PASSWORD, (string)$j['password'])) { usleep(500000); out(401, array('ok' => false)); }
if ($op === 'check') out(200, array('ok' => true));
if ($op === 'list') out(200, array('ok' => true, 'list' => rd_bk($BK)));
if ($op === 'setstatus' && in_array($j['status'] ?? '', array('new', 'confirmed', 'done'), true)) {
  $l = rd_bk($BK); foreach ($l as &$x) { if ($x['id'] === ($j['id'] ?? '')) $x['status'] = $j['status']; } unset($x); wr_bk($BK, $l); out(200, array('ok' => true));
}
if ($op === 'delbook') { $l = array_filter(rd_bk($BK), function ($x) use ($j) { return $x['id'] !== ($j['id'] ?? ''); }); wr_bk($BK, $l); out(200, array('ok' => true)); }
if ($op === 'save') {
  $d = $j['data'] ?? array();
  if (!isset($d['v']) || !is_array($d['v']) || !isset($d['g']) || !is_array($d['g'])) out(400, array('ok' => false));
  $g = array();
  foreach ($d['g'] as $x) { if (is_array($x) && isset($x['src']) && is_string($x['src']) && ($x['src'] === '' || (strpos($x['src'], 'data:image/') === 0 && strlen($x['src']) < 2000000))) $g[] = array('src' => $x['src'], 'cap' => s($x['cap'] ?? '', 80)); }
  $o = array('s' => (isset($d['s']) && is_array($d['s'])) ? $d['s'] : new stdClass, 'v' => $d['v'], 'g' => $g);
  file_put_contents($DATA, json_encode($o, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX); out(200, array('ok' => true));
}
out(400, array('ok' => false));
