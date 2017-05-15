<?php
include 'include/constants.php';
include 'include/database.php';
include 'include/password.php';

function puzzle_moves_by_user($user_key) {
	$conn = new mysqli(DATABASE_SERVERNAME, DATABASE_USERNAME, DATABASE_PASSWORD, DatabaseNames::Tactic);
	if ($stmt = $conn-> prepare ("CALL puzzle_moves_by_user (?);")) {
        $stmt->bind_param("i", $user_key);
		$stmt->execute();
		$resultSet = $stmt->get_result();
		$puzzle_moves = $resultSet->fetch_all(MYSQLI_ASSOC);
	}

	$conn->close();
    return $puzzle_moves;
}

$action = $_GET["action"];
switch ($action) {
    case "puzzle_moves":
        $user_key = $_GET["player_key"];
        if (isset($user_key)) {
            echo json_encode(puzzle_moves_by_user($user_key));
        }
        break;
}
?>