<?php
include 'constants.php';
include 'database.php';
include 'password.php';

class user {
    public $username;
    public $user_key;
    public $is_authenticated = False;
    public $is_first = False;
    public $is_active = False;
    public $login_token_key = null;
    public $token = null;

    function authenticate ($username, $password) {
        $this->is_authenticated = False;
        $conn = new mysqli(DATABASE_SERVERNAME, DATABASE_USERNAME, DATABASE_PASSWORD, DatabaseNames::Tactic);
        if ($stmt = $conn->prepare ("CALL user_by_name (?);")) {
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $stmt->bind_result($user_key, $answer, $is_active, $is_first);
            if($stmt->fetch()){
                $this->username = $username;
                if($is_first && $password == $answer){
                    $this->is_first = True;
                } elseif (!$is_first && $is_active && password_verify ($password, $answer)) {
                    $this->user_key = $user_key;
                    $this->is_active = True;
                    $this->is_authenticated = True;
                }
            }
        }

        $conn->close();
        if ($this->is_authenticated) {
            // Get a token to use for future requests - valid for 12hrs
            $conn = new mysqli(DATABASE_SERVERNAME, DATABASE_USERNAME, DATABASE_PASSWORD, DatabaseNames::Tactic);
            $token = bin2hex(openssl_random_pseudo_bytes(24));
            if ($stmt = $conn->prepare ("CALL login_token_add (?, ?);")) {
                $stmt->bind_param("is",
                    $this->user_key,
                    $token);
                $stmt->execute();
                $stmt->bind_result($this->login_token_key);
                $stmt->fetch();
            }

            $conn->close();
            if ($this->login_token_key > 0) {
                $this->token = $token;
            }
        }
    }
}

$action = $_GET["action"];
switch ($action) {
    case "authenticate":
        $un = $_POST["un"];
        $pw = $_POST["an"];
        if (isset($un) && isset($pw)) {
            $user = new User();
            $user->authenticate($un, $pw);
            echo json_encode(get_object_vars($user));
        }
        break;
}
?>