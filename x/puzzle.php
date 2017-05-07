<?php
include 'security.php';

function randBoardLocation($players, $goal) {
    $noSpace = array_merge (array(119,120,135,136), $players);
    array_push ($noSpace, $goal);

    $space = null;
    $attemptCount = 0;
    $attemptCountMax = 20;
    while ($space == null and $attemptCount < $attemptCountMax):
        $attemptCount++;
        $s = rand(0, 16*16-1);
        if (!in_array ($s, $noSpace)) {
            $space = $s;
        }
    endwhile;

    return $space;
}

function goalsRotate($goals) {
    $goalsRotated = array();
    for ($i = 0; $i < count($goals); $i++) {
        $g = $goals[$i];
        $goalsRotated[] = array(8-1-$g[1], $g[0]);
    }
    return $goalsRotated;
}

function xy2index($x, $y) {
    return $x + $y * 16;
}

function puzzle_add($user_key) {
    $boardSections = json_decode('[
	{
		"key": 1,
		"id": "A1",
		"type": "classic",
		"walls":[[1, 0, "E"],[4, 1, "NW"],[1, 2, "NE"],[6, 3, "SE"],[0, 5, "S"],[3, 6, "SW"]],
		"goals":[[4, 1, "R"],[1, 2, "G"],[6, 3, "Y"],[3, 6, "B"]]
	},
	{
		"key": 2,
		"id": "A2",
		"type": "classic",
		"walls":[[3, 0, "E"],[5, 1, "SE"],[1, 2, "SW"],[0, 3, "S"],[6, 4, "NW"],[2, 6, "NE"]],
		"goals":[[5, 1, "G"],[1, 2, "R"],[6, 4, "Y"],[2, 6, "B"]]
	},
	{
		"key": 3,
		"id": "A3",
		"type": "classic",
		"walls":[[3, 0, "E"],[5, 2, "SE"],[0, 4, "S"],[2, 4, "NE"],[7, 5, "SW"],[1, 6, "NW"]],
		"goals":[[5, 2, "B"],[2, 4, "G"],[7, 5, "R"],[1, 6, "Y"]]
	},
	{
		"key": 4,
		"id": "A4",
		"type": "classic",
		"walls":[[3, 0, "E"],[6, 1, "SW"],[1, 3, "NE"],[5, 4, "NW"],[2, 5, "SE"],[7, 5, "SE"],[0, 6, "S"]],
		"goals":[[6, 1, "B"],[1, 3, "Y"],[5, 4, "G"],[2, 5, "R"],[7, 5, "BYGR"]]
	},
	{
		"key": 5,
		"id": "B1",
		"type": "classic",
		"walls":[[4, 0, "E"],[6, 1, "SE"],[1, 2, "NW"],[0, 5, "S"],[6, 5, "NE"],[3, 6, "SW"]],
		"goals":[[6, 1, "Y"],[1, 2, "G"],[6, 5, "B"],[3, 6, "R"]]
	},
	{
		"key": 6,
		"id": "B2",
		"type": "classic",
		"walls":[[4, 0, "E"],[2, 1, "NW"],[6, 3, "SW"],[0, 4, "S"],[4, 5, "NE"],[1, 6, "SE"]],
		"goals":[[2, 1, "Y"],[6, 3, "B"],[4, 5, "R"],[1, 6, "G"]]
	},
	{
		"key": 7,
		"id": "B3",
		"type": "classic",
		"walls":[[3, 0, "E"],[1, 1, "SW"],[6, 2, "NE"],[2, 4, "SE"],[0, 5, "S"],[7, 5, "NW"]],
		"goals":[[1, 1, "R"],[6, 2, "G"],[2, 4, "B"],[7, 5, "Y"]]
	},
	{
		"key": 8,
		"id": "B4",
		"type": "classic",
		"walls":[[4, 0, "E"],[2, 1, "SE"],[1, 3, "SW"],[0, 4, "S"],[6, 4, "NW"],[5, 6, "NE"],[3, 7, "SE"]],
		"goals":[[2, 1, "R"],[1, 3, "G"],[6, 4, "Y"],[5, 6, "B"],[3, 7, "RGYB"]]
	},
	{
		"key": 9,
		"id": "C1",
		"type": "classic",
		"walls":[[1, 0, "E"],[3, 1, "NW"],[6, 3, "SE"],[1, 4, "SW"],[0, 6, "S"],[4, 6, "NE"]],
		"goals":[[3, 1, "G"],[6, 3, "Y"],[1, 4, "R"],[4, 6, "B"]]
	},
	{
		"key": 10,
		"id": "C2",
		"type": "classic",
		"walls":[[5, 0, "E"],[3, 2, "NW"],[0, 3, "S"],[5, 3, "SW"],[2, 4, "NE"],[4, 5, "SE"]],
		"goals":[[3, 2, "Y"],[5, 3, "B"],[2, 4, "R"],[4, 5, "G"]]
	},
	{
		"key": 11,
		"id": "C3",
		"type": "classic",
		"walls":[[1, 0, "E"],[4, 1, "NE"],[1, 3, "SW"],[0, 5, "S"],[5, 5, "NW"],[3, 6, "SE"]],
		"goals":[[4, 1, "G"],[1, 3, "R"],[5, 5, "Y"],[3, 6, "B"]]
	},
	{
		"key": 12,
		"id": "C4",
		"type": "classic",
		"walls":[[2, 0, "E"],[5, 1, "SW"],[7, 2, "SE"],[0, 3, "S"],[3, 4, "SE"],[6, 5, "NW"],[1, 6, "NE"]],
		"goals":[[5, 1, "B"],[7, 2, "BRGY"],[3, 4, "R"],[6, 5, "G"],[1, 6, "Y"]]
	},
	{
		"key": 13,
		"id": "D1",
		"type": "classic",
		"walls":[[5, 0, "E"],[1, 3, "NW"],[6, 4, "SE"],[0, 5, "S"],[2, 6, "NE"],[3, 6, "SW"]],
		"goals":[[1, 3, "R"],[6, 4, "Y"],[2, 6, "G"],[3, 6, "B"]]
	},
	{
		"key": 14,
		"id": "D2",
		"type": "classic",
		"walls":[[2, 0, "E"],[5, 2, "SE"],[6, 2, "NW"],[1, 5, "SW"],[0, 6, "S"],[4, 7, "NE"]],
		"goals":[[5, 2, "G"],[6, 2, "Y"],[1, 5, "R"],[4, 7, "B"]]
	},
	{
		"key": 15,
		"id": "D3",
		"type": "classic",
		"walls":[[4, 0, "E"],[0, 2, "S"],[6, 2, "SE"],[2, 4, "NE"],[3, 4, "SW"],[5, 6, "NW"]],
		"goals":[[6, 2, "B"],[2, 4, "G"],[3, 4, "R"],[5, 6, "Y"]]
	},
	{
		"key": 16,
		"id": "D4",
		"type": "classic",
		"walls":[[4, 0, "E"],[6, 2, "NW"],[2, 3, "NE"],[3, 3, "SW"],[1, 5, "SE"],[0, 6, "S"],[5, 7, "SE"]],
		"goals":[[6, 2, "Y"],[2, 3, "B"],[3, 3, "G"],[1, 5, "R"],[5, 7, "YBGR"]]
	}
]', true);
    $boardSectionsLength = count($boardSections);
    $boardKey1 = rand(1, $boardSectionsLength);
    $boardKey2 = rand(1, $boardSectionsLength);
    $boardKey3 = rand(1, $boardSectionsLength);
    $boardKey4 = rand(1, $boardSectionsLength);

    $goals = array();
    $goals1 = $boardSections[$boardKey1-1]["goals"];
    $goals2 = $boardSections[$boardKey2-1]["goals"];
    $goals3 = $boardSections[$boardKey3-1]["goals"];
    $goals4 = $boardSections[$boardKey4-1]["goals"];

    $thisBoardWidth = 8;
    for ($i = 0; $i < count($goals1); $i++) {
        $g = $goals1[$i];
        array_push ($goals, xy2index($g[0], $g[1]));
    }

    $goals2 = goalsRotate($goals2);
    for ($i = 0; $i < count($goals2); $i++) {
        $g = $goals2[$i];
        array_push ($goals, xy2index($g[0] + $thisBoardWidth, $g[1]));
    }

    $goals3 = goalsRotate($goals3);
    $goals3 = goalsRotate($goals3);
    for ($i = 0; $i < count($goals3); $i++) {
        $g = $goals3[$i];
        array_push ($goals, xy2index($g[0] + $thisBoardWidth, $g[1] + $thisBoardWidth));
    }

    $goals4 = goalsRotate($goals4);
    $goals4 = goalsRotate($goals4);
    $goals4 = goalsRotate($goals4);
    for ($i = 0; $i < count($goals4); $i++) {
        $g = $goals4[$i];
        array_push ($goals, xy2index($g[0], $g[1] + $thisBoardWidth));
    }

    $g = $goals[rand(0, count($goals)-1)];
	$p = array();
    array_push($p, randBoardLocation($p, $g));
    array_push($p, randBoardLocation($p, $g));
    array_push($p, randBoardLocation($p, $g));
    array_push($p, randBoardLocation($p, $g));
	$goal_player = array_shift($p);
	sort($p);
	array_unshift($p, $goal_player);

    $seed = array(
        "b" => array($boardKey1, $boardKey2, $boardKey3, $boardKey4),
        "g" => $g,
        "p" => $p
    );

	$conn = new mysqli(DATABASE_SERVERNAME, DATABASE_USERNAME, DATABASE_PASSWORD, DatabaseNames::Tactic);
	if ($stmt = $conn->prepare ("CALL puzzle_create (?,?,?,?,?,?,?,?,?);")) {
		$stmt->bind_param("iiiiiiiii",
			$seed["b"][0], $seed["b"][1], $seed["b"][2], $seed["b"][3], 
			$seed["g"],
			$seed["p"][0], $seed["p"][1], $seed["p"][2], $seed["p"][3]);
		$stmt->execute();
		$stmt->bind_result($puzzle_key);
		if($stmt->fetch()){
			$seed["puzzle"] = $puzzle_key;
		}
	}

	$conn->close();
	$conn = new mysqli(DATABASE_SERVERNAME, DATABASE_USERNAME, DATABASE_PASSWORD, DatabaseNames::Tactic);
	if ($stmt = $conn->prepare ("CALL puzzle_user_create (?,?);")) {
		$stmt->bind_param("ii", $seed["puzzle"], $user_key);
		$stmt->execute();
		$stmt->bind_result($puzzle_user_key);
		if($stmt->fetch()){
			$seed["instance"] = $puzzle_user_key;
		}
	}

	$conn->close();
    return $seed;
}

function puzzle_user_update($puzzle_user_key, $is_solved, $move_count) {
	$conn = new mysqli(DATABASE_SERVERNAME, DATABASE_USERNAME, DATABASE_PASSWORD, DatabaseNames::Tactic);
	if ($stmt = $conn->prepare ("CALL puzzle_user_update (?,?,?);")) {
		$stmt->bind_param("iii", $puzzle_user_key, $is_solved, $move_count);
		$stmt->execute();
	}

	$conn->close();
}

function puzzle_move_add($puzzle_user_key, $move_number, $piece, $direction, $start, $end) {
	$conn = new mysqli(DATABASE_SERVERNAME, DATABASE_USERNAME, DATABASE_PASSWORD, DatabaseNames::Tactic);
	if ($stmt = $conn->prepare ("CALL puzzle_move_history_add (?,?,?,?,?,?);")) {
		$stmt->bind_param("iiiiii", $puzzle_user_key, $move_number, $piece, $direction, $start, $end);
		$stmt->execute();
	}

	$conn->close();
}

$token = $_POST["token"];
$user_key = user_authenticate_by_token($token);

if (isset($token) && $user_key > 0) {
    $action = $_GET["action"];
    switch ($action) {
        case "get":
            $puzzle_key = $_POST["key"];
            if (isset($puzzle_key) && $puzzle_key > 0) {
                echo json_encode(puzzle_get());
            } else {
                echo json_encode(puzzle_add($user_key));
            }
            break;
		case "update":
			$puzzle_user_key = $_POST["key"];
			$is_solved = $_POST["s"];
			$move_count = $_POST["m"];
            puzzle_user_update($puzzle_user_key, $is_solved, $move_count);
			break;
		case "addMove":
			$puzzle_user_key = $_POST["key"];
			$move_number = $_POST["m"];
			$piece = $_POST["p"];
			$direction = $_POST["d"];
			$start = $_POST["s"];
			$end = $_POST["e"];
			puzzle_move_add($puzzle_user_key, $move_number, $piece, $direction, $start, $end);
			break;
    }
} else {
    echo "not authorized";
    return;
}
?>