<?php
include 'include/constants.php';
include 'include/database.php';
include 'include/password.php';

function report_puzzles_solved_by_user($move_key) {
	$conn = new mysqli(DATABASE_SERVERNAME, DATABASE_USERNAME, DATABASE_PASSWORD, DatabaseNames::Tactic);
	if ($stmt = $conn-> prepare ("CALL report_puzzles_solved_by_user ();")) {
		$stmt->execute();
		$resultSet = $stmt->get_result();
		$property_result = $resultSet->fetch_all(MYSQLI_ASSOC);
	}

	$conn->close();
    return $property_result;
}

function report_puzzles_summary($move_key) {
	$conn = new mysqli(DATABASE_SERVERNAME, DATABASE_USERNAME, DATABASE_PASSWORD, DatabaseNames::Tactic);
	if ($stmt = $conn-> prepare ("CALL report_puzzles_summary ();")) {
		$stmt->execute();
		$resultSet = $stmt->get_result();
		$property_result = $resultSet->fetch_all(MYSQLI_ASSOC);
	}

	$conn->close();
    return $property_result;
}



$action = $_GET["action"];
switch ($action) {
    case "summary":
        echo json_encode(report_puzzles_summary($user));
        break;
    case "by_user":
        echo json_encode(report_puzzles_solved_by_user($user));
        break;
}
?>