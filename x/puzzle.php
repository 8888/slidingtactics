<?php
include 'security.php';

function puzzle_add() {
    $board_key_1 = rand(1,16);
    $board_key_2 = rand(1,16);
    $board_key_3 = rand(1,16);
    $board_key_4 = rand(1,16);



    $conn = new mysqli(DATABASE_SERVERNAME, DATABASE_USERNAME, DATABASE_PASSWORD, DatabaseNames::RealEstate);
    if ($stmt = $conn->prepare ("CALL puzzle_add (?,?,?,?,?,?,?,?,?,?,?);")) {
        $stmt->bind_param("sssiissssss",
                $thread_id,
                $message_id,
                $message_date,
                $price,
                $mls,
                $status,
                $line_1,
                $line_2,
                $city,
                $state,
                $zipcode);
        $stmt->execute();
        $stmt->bind_result($listing_key);
        $stmt->fetch();
    }

    $conn->close();
    return $listing_key;
}

$token = $_POST["token"];
$user_key = user_authenticate_by_token($token);

if (isset($token) && $user_key > 0) {
    $action = $_GET["action"];
    switch ($action) {
        case "get":
            $puzzle_key = $_POST["key"];
            if (isset($puzzle_key)) {
                
                echo json_encode(puzzle_get());
            } else {
                echo json_encode(puzzle_add());
            }
            break;
    }
} else {
    echo "not authorized";
    return;
}
?>