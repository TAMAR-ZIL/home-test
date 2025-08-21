<?php
define("a328763fe27bba", true);
header('Content-Type: application/json');
ini_set('display_errors', 0);

require_once 'modules/mysql.php';
require_once 'modules/json_utilities.php';
require_once 'config.php';

$input = json_decode(file_get_contents('php://input'), true);
$username = $input['username'] ?? '';
$otp = $input['otp'] ?? '';

if (!$username || !$otp) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing parameters']);
    exit;
}

// Lookup user
$rows = mysql_fetch_array("SELECT * FROM users WHERE username=?", [$username], MYSQLI_ASSOC);
$user = $rows[0] ?? null;

if (!$user) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'User not found']);
    exit;
}

// Check OTP validity
if ($user['otp_code'] !== $otp) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Invalid OTP']);
    exit;
}
if (!$user['otp_expires_at'] || strtotime($user['otp_expires_at']) < time()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'OTP expired']);
    exit;
}

// Generate token
$token = bin2hex(random_bytes(32));
mysql_update(
    "users",
    ["login_token" => $token, "otp_code" => null, "otp_expires_at" => null],
    ["id" => $user['id']]
);

echo json_encode(['success' => true, 'token' => $token]);
?>
