<?php
if (isset($_GET['file'])) {
    $file_path = $_GET['file'];
    $file_path = '../' . $file_path;
    $file_name = basename($file_path);

    if (file_exists($file_path) && is_readable($file_path)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $file_name . '"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file_path));

        ob_clean();
        flush();

        readfile($file_path);

        echo '<script>window.close();</script>';
        exit;
    } else {
        http_response_code(404);
        echo 'File not found or not readable.';
        exit;
    }
} else {
    http_response_code(400);
    echo 'File path not provided.';
    exit;
}
?>
