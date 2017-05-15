<?php
include 'include/constants.php';
include 'include/database.php';
include 'include/password.php';

function report_puzzles_solved_by_user() {
	$conn = new mysqli(DATABASE_SERVERNAME, DATABASE_USERNAME, DATABASE_PASSWORD, DatabaseNames::Tactic);
	if ($stmt = $conn-> prepare ("CALL report_puzzles_solved_by_user ();")) {
		$stmt->execute();
		$resultSet = $stmt->get_result();
		$puzzles = $resultSet->fetch_all(MYSQLI_ASSOC);
	}

	$conn->close();
    return $puzzles;
}

function report_puzzles_summary() {
	$conn = new mysqli(DATABASE_SERVERNAME, DATABASE_USERNAME, DATABASE_PASSWORD, DatabaseNames::Tactic);
	if ($stmt = $conn-> prepare ("CALL report_puzzles_summary ();")) {
		$stmt->execute();
		$resultSet = $stmt->get_result();
		$puzzles = $resultSet->fetch_all(MYSQLI_ASSOC);
	}

	$conn->close();
    return $puzzles;
}



$action = $_GET["action"];
switch ($action) {
    case "summary":
        echo json_encode(report_puzzles_summary());
        break;
    case "by_user":
        echo json_encode(report_puzzles_solved_by_user());
        break;
}
?>