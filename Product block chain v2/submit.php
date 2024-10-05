<?php
// Include the database connection file
include 'connection.php';

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO product (product_name, date, ingredient_name, location) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $product_name, $date, $ingredient_name, $location);

// Get form data
$product_name = $_POST['productName'];
$date = $_POST['date'];

// Handle multiple ingredients
$ingredient_names = $_POST['ingredientName'];
$locations = $_POST['location'];

foreach ($ingredient_names as $index => $ingredient_name) {
    $location = $locations[$index];
    $stmt->execute();
}

$stmt->close();
$conn->close();

// Redirect to the registration page with a success message
header("Location: product_reg.php?message=PRODUCT HAS BEEN REGISTERED");
exit();
?>
