
<?php

if (!defined("a328763fe27bba")) {
    define("a328763fe27bba", true);
}

$targetDir = "uploaded_files/";
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

$response = ["success" => false, "message" => ""];

if (isset($_FILES["image"])) {
    $file = $_FILES["image"];
    $allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!in_array($file["type"], $allowedTypes)) {
        $response["message"] = "Invalid file type.";
    } elseif ($file["size"] > 5 * 1024 * 1024) {
        $response["message"] = "File too large (max 5MB).";
    } else {
        $ext = pathinfo($file["name"], PATHINFO_EXTENSION);
        $filename = "img_" . date("Ymd_His") . "_" . uniqid() . "." . $ext;
        $targetFile = $targetDir . $filename;
        if (move_uploaded_file($file["tmp_name"], $targetFile)) {
            // Save image message in DB for sender only
            require_once("config.php");
            require_once("modules/mysql.php");
            $belongs_to_username = $_POST['username'] ?? 'assaf';
            $contact_id = $_POST['contact_id'] ?? '1';
            $msg_type = 'image';
            $msg_body = $targetFile;
            $msg_datetime = date('Y-m-d H:i:s');
            $creation_datetime = $msg_datetime;
            $insert = mysql_insert('messages', [
                'belongs_to_username' => $belongs_to_username,
                'msg_datetime' => $msg_datetime,
                'contact_id' => $contact_id,
                'is_from_me' => 1,
                'msg_type' => $msg_type,
                'msg_body' => $msg_body,
                'creation_datetime' => $creation_datetime
            ]);
            if (!$insert || (is_array($insert) && isset($insert['error']) && $insert['error'])) {
                $response["message"] = "DB insert error: " . ($insert['error'] ?? 'Unknown');
            } else {
                $response["success"] = true;
                $response["message"] = "Upload successful.";
                $response["url"] = $targetFile;
                $response["db"] = $insert;
            }
        } else {
            $response["message"] = "Failed to move uploaded file.";
        }
    }
} else {
    $response["message"] = "No file uploaded.";
}

header("Content-Type: application/json");
echo json_encode($response);
