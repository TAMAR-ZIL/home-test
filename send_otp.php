<?php
define("a328763fe27bba", true);
header('Content-Type: application/json');
ini_set('display_errors', 0);
// send_otp.php - Standalone endpoint for OTP login flow
require_once 'modules/mysql.php';
require_once 'modules/json_utilities.php';
require_once 'config.php';

// Helper: Generate random OTP
function generate_otp($length = 6) {
    return str_pad(strval(random_int(0, pow(10, $length)-1)), $length, '0', STR_PAD_LEFT);
}

// Helper: Call Brevo API to send OTP
function send_otp_email($email, $otp) {
    $apiKey = BREVO_API_KEY;  // define in config.php
    $url = 'https://api.brevo.com/v3/smtp/email';
    $data = [
        'sender' => ['name' => 'myself project', 'email' => 'practicum123456@gmail.com'],
        'to' => [['email' => $email]],
        'subject' => 'Your OTP Code',
        'htmlContent' => '<p>Your OTP code is: <b>' . $otp . '</b></p>'
    ];
    $headers = [
        'api-key: ' . $apiKey,
        'Content-Type: application/json'
    ];
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // Fix SSL certificate issue for Windows/XAMPP
    // Use double backslashes for Windows path
    // $cacertPath = 'C:/xampp/php/extras/ssl/cacert.pem';
    // curl_setopt($ch, CURLOPT_CAINFO, $cacertPath);
    // // Check if cURL supports SSL
    // if (!defined('CURL_VERSION_SSL')) {
    //     error_log('send_otp.php: cURL does not support SSL.');
    //     return json_encode(['error' => 'cURL does not support SSL']);
    // }

    // השבתת אימות SSL
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    $response = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);
        if ($curlError) {
            error_log('send_otp.php: cURL error: ' . $curlError);
            return json_encode(['error' => 'cURL error', 'details' => $curlError]);
        }
        return $response;
}

// Main logic
// Get and validate input
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!$input || !isset($input['username'])) {
    error_log('send_otp.php: Invalid or missing input: ' . $rawInput);
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request']);
    exit;
}
$username = $input['username'] ?? '';
$honeypot = $input['honeypot'] ?? '';

if ($honeypot !== '') {
    http_response_code(400);
    echo json_encode(['error' => 'Bot detected']);
    exit;
}

// Lookup user

// Use PDO for user lookup if sql_query_assoc is not available
if (!function_exists('sql_query_assoc')) {
    try {
        $config = json_decode(file_get_contents(__DIR__ . '/config.json'), true);
        $mysql = $config['mysql'];
        $pdo = new PDO(
            'mysql:host=' . $mysql['servername'] . ';dbname=' . $mysql['dbname'],
            $mysql['username'],
            $mysql['password'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
        $stmt = $pdo->prepare('SELECT * FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();
    } catch (Exception $e) {
        error_log('send_otp.php: PDO error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
        exit;
    }
} else {
    $user = sql_query_assoc("SELECT * FROM users WHERE username=?", [$username]);
}
if (!$user) {
    error_log('send_otp.php: User not found for username: ' . $username);
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}

// Rate limiting
$now = new DateTime();
$lastRequest = $user['otp_last_request_time'] ? new DateTime($user['otp_last_request_time']) : null;
$hourCount = $user['otp_request_count_hour'] ?? 0;
$dayCount = $user['otp_request_count_day'] ?? 0;
if ($lastRequest && $now->getTimestamp() - $lastRequest->getTimestamp() < 30) {
    http_response_code(429);
    echo json_encode(['error' => 'Please wait 30 seconds before requesting another OTP']);
    exit;
}
if ($hourCount >= 4) {
    http_response_code(429);
    echo json_encode(['error' => 'Max 4 OTPs per hour']);
    exit;
}
if ($dayCount >= 10) {
    http_response_code(429);
    echo json_encode(['error' => 'Max 10 OTPs per day']);
    exit;
}

// Generate OTP
$otp = generate_otp();
$expires = (clone $now)->modify('+10 minutes')->format('Y-m-d H:i:s');

// Send OTP via Brevo

$email = $user['email'];
if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'No email found for user']);
    exit;
}
// Send OTP via Brevo and check response
$brevoResponse = send_otp_email($email, $otp);
error_log('send_otp.php: Brevo API response: ' . $brevoResponse);
$brevoJson = json_decode($brevoResponse, true);
if (!$brevoJson || (isset($brevoJson['code']) && $brevoJson['code'] != 'success' && $brevoJson['code'] != 200)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send OTP email', 'brevo_response' => $brevoResponse]);
    exit;
}


// Update user record using PDO
try {
    $updateStmt = $pdo->prepare(
        "UPDATE users SET otp_code=?, otp_expires_at=?, otp_last_request_time=?, otp_request_count_hour=otp_request_count_hour+1, otp_request_count_day=otp_request_count_day+1, honeypot_value=? WHERE id=?"
    );
    $updateStmt->execute([$otp, $expires, $now->format('Y-m-d H:i:s'), $honeypot, $user['id']]);
} catch (Exception $e) {
    error_log('send_otp.php: PDO update error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database update error']);
    exit;
}

echo json_encode(['success' => true, 'message' => 'OTP sent']);
?>
