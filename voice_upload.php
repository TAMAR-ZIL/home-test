<?php
// voice_upload.php
// Handles voice message uploads and saves them to assets/audio/

$targetDir = __DIR__ . '/assets/audio/';
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}

$response = ["success" => false];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['voice'])) {
    $file = $_FILES['voice'];
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'voice_msg_' . date('Y-m-d_H.i.s') . '_' . uniqid() . '.' . $ext;
    $targetFile = $targetDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $targetFile)) {
        // Here you can also save metadata to DB (sender, timestamp, filename)
        $response = [
            "success" => true,
            "filename" => $filename,
            "url" => 'assets/audio/' . $filename
        ];
    } else {
        $response['error'] = 'Failed to save file.';
    }
} else {
    $response['error'] = 'No file uploaded.';
}

header('Content-Type: application/json');
echo json_encode($response);
