<?php
include 'connection.php';

if (isset($_SERVER['HTTP_ORIGIN'])) {
    // Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
    // you want to allow, and if so:
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        // may also be using PUT, PATCH, HEAD etc
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

// Fetch raw JSON data from the request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Check if all required fields are present
if (!isset($data['name'], $data['email'], $data['password'], $data['role'], $data['company_name'], $data['company_location'])) {
    echo json_encode(["success" => false, "error" => "Missing required fields."]);
    exit();
}

$name = $data['name'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_DEFAULT); // Hash the password
$role = $data['role'];
$company_name = $data['company_name'];
$company_location = $data['company_location'];

// Prepare SQL statement to insert user into the database
$stmt = $conn->prepare("INSERT INTO user (name, email, password, company_name, company_location, role) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssss", $name, $email, $password, $company_name, $company_location, $role);

if ($stmt->execute()) {
    echo json_encode(["success" => true]); // Return success response
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]); // Return error message
}

$stmt->close();
$conn->close();
?>
