<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Registration</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        /* Add these styles to position the logout button */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }

        .logout-btn {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
        }

        .logout-btn:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <header class="header">
        <h1>Product Registration</h1>
        <a href="index.php" class="logout-btn">Logout</a>
    </header>

    <main>
        <?php if (isset($_GET['message'])): ?>
            <div class="message">
                <?php echo htmlspecialchars($_GET['message']); ?>
            </div>
        <?php endif; ?>

        <!-- Registration Form Section -->
        <div id="registrationSection">
            <h2>Register New Infant Food Product</h2>
            <form id="productForm" action="submit.php" method="post">
                <div class="form-group">
                    <label for="productName">Product Name:</label>
                    <input type="text" id="productName" name="productName" required>
                </div>

                <div class="form-group">
                    <label for="date">Date:</label>
                    <input type="date" id="date" name="date" required>
                </div>

                <div class="form-group">
                    <label for="ingredients">Ingredients:</label>
                    <table id="ingredientsTable">
                        <thead>
                            <tr>
                                <th>Ingredient Name</th>
                                <th>Location</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input type="text" name="ingredientName[]" required></td>
                                <td><input type="text" name="location[]" required></td>
                                <td><button type="button" class="add-row">+</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <button type="submit" class="submit-btn">Submit</button>
            </form>
        </div>

        <!-- Details Section -->
        <div id="detailsSection" style="display: none;">
            <h2>Submitted Product Details</h2>
            <div id="productDetails"></div>
            <button id="backButton" class="submit-btn">Back to Form</button>
        </div>
    </main>

    <script src="scripts.js"></script>
</body>
</html>
