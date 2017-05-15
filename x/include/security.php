<?php
include 'constants.php';
include 'database.php';
include 'password.php';

function user_authenticate_by_token($token) {
    $user_key = null;
    $conn = new mysqli(DATABASE_SERVERNAME, DATABASE_USERNAME, DATABASE_PASSWORD, DatabaseNames::Tactic);
    if ($stmt = $conn->prepare ("CALL login_token_by_token (?);")) {
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $stmt->bind_result($user_key);
        $stmt->fetch();
    }

    $conn->close();
    if(isset($user_key) && $user_key > 0) {
        return $user_key;
    }

    return False;
}
?>