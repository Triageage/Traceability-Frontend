<?php
// Handle CORS and OPTIONS requests
if (isset($_SERVER['HTTP_ORIGIN'])) {
    // Allow the origin (replace with your frontend URL if necessary)
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true'); // Allow credentials (sessions)
    header('Access-Control-Max-Age: 86400'); // Cache for 1 day
}

// Handle OPTIONS requests (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    }

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }

    exit(0); // Preflight request returns no content
}

// Start session
session_start();

include 'connection.php'; // Include database connection

// Get the JSON body from the request
$data = json_decode(file_get_contents('php://input'), true);

// Check if email and password are provided
if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['error' => 'Email and password are required.']);
    exit();
}

$email = $data['email'];
$password = $data['password'];

// Prepare the SQL statement
$stmt = $conn->prepare("SELECT * FROM user WHERE email = ?");

if (!$stmt) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Database error: Failed to prepare the SQL statement.']);
    exit();
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

// Check if the user exists
if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    // Verify the password
    if (password_verify($password, $user['password'])) {
        // Store user information in session
        $_SESSION['email'] = $user['email'];
        $_SESSION['name'] = $user['name'];
        $_SESSION['role'] = $user['role'];

        // Return success response with user role and redirect path
        $response = ['success' => true, 'name' => $user['name'], 'role' => $user['role']];

        // Redirect based on the user's role
        if ($user['role'] === 'ingredient aggregator') {
            $response['redirect'] = 'product_reg';
        } elseif (in_array($user['role'], ['distributer', 'manufacturer', 'retailer'])) {
            $response['redirect'] = 'qrcode';
        } else {
            http_response_code(400); // Bad Request for invalid role
            echo json_encode(['error' => 'Invalid role specified.']);
            exit();
        }

        // Send response as JSON
        echo json_encode($response);
    } else {
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Invalid password.']);
    }
} else {
    http_response_code(404); // Not Found
    echo json_encode(['error' => 'No user found with that email.']);
}

// Close the statement and connection
$stmt->close();
$conn->close();
?>
