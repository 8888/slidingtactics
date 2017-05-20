""" SOLUTION GENERATOR MODULE """
import copy
import time
import json
from collections import deque
import requests
from login import server_authenticate as auth
from boardGenerator import BoardGenerator

N = NORTH = 1
E = EAST = 2
S = SOUTH = 4
W = WEST = 8
DIRECTIONS = [N, E, S, W]
DIRECTIONWORD = {
    N: "North",
    E: "East",
    S: "South",
    W: "West"
}

class SolutionGenerator(object):
    """ SOLUTION GENERATOR CLASS """
    direction_reverse = {}
    direction_delta = {}
    board = None

    def __init__(self, directions):
        self.board_width = 16
        self.directions = directions
        self.direction_reverse = {N: S, S: N, E: W, W: E}
        self.direction_delta = {N: -self.board_width, S: +self.board_width, E: +1, W: -1}

    def cell_move(self, index, direction, node):
        """ Advance `index` along `direction` """
        while True:
            if self.board[index] & direction == direction:
                break
            advanced_index = index + self.direction_delta[direction]
            for robot in node:
                if advanced_index == robot[0]:
                    break
            else:
                index = advanced_index
                continue
            break
        return index

    def generate(self, board, robots, goal_index, verbose=False):
        """ Solve for `robots` to `goal_index` on `board` """
        self.board = board
        assert len(robots) == 4
        time_start = time.clock()
        minx = maxx = miny = maxy = None
        for direction in self.directions:
            # Which walls are on the goal, so you know what direction you need to come from.
            # then min and max distance in that direction depending on walls.
            # If a goal robot lands wihtin range of x or y then puzzle is solved
            if self.board[goal_index] & self.direction_reverse[direction]:
                new_cell = self.cell_move(goal_index, direction, [])
                if new_cell != goal_index:
                    if direction in (E, W):
                        minx = new_cell if new_cell < goal_index else goal_index
                        maxx = new_cell if new_cell > goal_index else goal_index
                    elif direction in (N, S):
                        miny = new_cell if new_cell < goal_index else goal_index
                        maxy = new_cell if new_cell > goal_index else goal_index
        if miny is not None:
            minymod = miny % self.board_width
        positions_seen = {}
        #directory of seen positions
        path_length = 1
        total_seen_count = 0
        seen_count = 0
        skipped_count = 0
        queue = deque()
        queue.append([robots])
        while queue:
            path = queue.popleft() #pops the next node that is to be searched from
            node = path[-1] #list of tuples with (robot_index, last_direction)
            if len(path) != path_length:
                if verbose:
                    print("{0:02d} - {1:05d}\t sk: {2:05d}\t@ {3}s".format(
                        path_length-1,
                        seen_count,
                        skipped_count,
                        time.clock() - time_start))
                path_length = len(path)
                total_seen_count += seen_count
                seen_count = 0
            seen_count += 1
            if (goal_index == node[3][0] #This is when the goal robot is on the goal.
                    or (
                        minx is not None and
                        maxx is not None and
                        miny is not None and
                        maxy is not None and
                        ((node[3][1] in (N, S) and maxx >= node[3][0] >= minx) or (
                            node[3][1] in (E, W) and maxy >= node[3][0] >= miny and
                            node[3][0] % self.board_width == minymod)))):
                            # This is when it is lined up with the goal, with no walls blocking it.
                            # EEK This only works when we know our goal will have the backstops
                total_seen_count += seen_count
                #Check if the path to the goal is clear of other peices
                path_to_goal = []
                space = node[3][0]
                if maxy >= node[3][0] >= miny and node[3][0] % self.board_width == minymod:
                    if goal_index > node[3][0]: #the goal is south of the robot
                        while space < goal_index:
                            space += self.board_width
                            path_to_goal.append(space)
                    else: #the goal is north of the robot
                        while space > goal_index:
                            space -= self.board_width
                            path_to_goal.append(space)
                if maxx >= node[3][0] >= minx: #we are east or west of the goal
                    if goal_index > node[3][0]: # the goal is west of the robot
                        while space < goal_index:
                            space += 1
                            path_to_goal.append(space)
                    else: #the goal is east of the robot
                        while space > goal_index:
                            space -= 1
                            path_to_goal.append(space)
                if (not node[0][0] in path_to_goal and
                        not node[1][0] in path_to_goal and
                        not node[2][0] in path_to_goal):
                    if verbose:
                        print("\tanswer found in " + str(time.clock() - time_start) + "s")
                        print("\tL{} - total seen: {}; skipped: {}; cache: {};".format(
                            path_length-1,
                            total_seen_count,
                            skipped_count,
                            len(positions_seen)))
                    return path # This is the end, a solution has been found

            adjacent = deque()
            for index in range(0, 4): #ROBOT COUNT
                for direction in self.directions:
                    if node[index][1] not in(direction, self.direction_reverse[direction]):
                        #ricochet rule
                        new_cell = node[index][0]
                        advanced_index = 0
                        while True:
                            if self.board[new_cell] & direction == direction:
                                break
                            advanced_index = new_cell + self.direction_delta[direction]
                            for robot in node:
                                if advanced_index == robot[0]:
                                    break
                            else:
                                new_cell = advanced_index
                                continue
                            break
                        if (node[index][0] != new_cell and not(
                                index == 3 and
                                node[index][1] == 0 and
                                new_cell == goal_index)):
                            updated_robots = copy.copy(node)
                            updated_robots[index] = (new_cell, direction)
                            adjacent = updated_robots
                            first = adjacent[0][0]
                            second = adjacent[1][0]
                            third = adjacent[2][0]
                            if first > second:
                                first, second = second, first
                            if second > third:
                                second, third = third, second
                            if first > second:
                                first, second = second, first
                            key = adjacent[3][0] | first << 8 | second << 16 | third << 24
                            if positions_seen.get(key) is None:
                                positions_seen[key] = True
                                new_path = deque(list(path))
                                new_path.append(adjacent)
                                queue.append(new_path)
                            else:
                                skipped_count += 1
        print("\tanswer NOT found in " + str(time.clock() - time_start) + "s")
        print("\tL{} - total seen: {}; skipped: {}; cache: {};".format(
            path_length-1,
            total_seen_count,
            skipped_count,
            len(positions_seen)))

    def display_solution(self, solution):
        """ prints the solution to the console """
        if solution is not None:
            print("Move\t{}".format("\t\t".join([str(i) for i in range(len(solution[0]))])))
            for i, move in enumerate(solution):
                print("{:02d}. {}".format(
                    i,
                    "\t".join(["({:02d}, {:02d}) {}".format(
                        robot[0] % 16,
                        int(robot[0] / 16),
                        "     " if robot[1] is None else next(
                            DIRECTIONWORD[direction]
                            for direction
                            in DIRECTIONS
                            if direction == robot[1])
                    ) for robot in move])))

def main_db():
    """ run the solver using DB data """
    solver = SolutionGenerator(DIRECTIONS)
    board_generator = BoardGenerator()
    token = auth("lee", "halcyon88") # make some include w/ this info
    r = requests.post(
        "https://devtactics.prototypeholdings.com/x/puzzle.php?action=solver_get",
        data={"token": token}
    )
    if r.text and r.status_code == 200:
        data = json.loads(r.text)
        # array containing arrays of puzzles
        # puzzle array == [
        #   puzzle_key, board_1_key, board_2_key, board_3_key, board_4_key,
        #   goal_index, player_1_index, player_2_index, player_3_index, player_4_index]
        for puzzle in data:
            key = puzzle[0]
            board = board_generator.generate(
                puzzle[1], puzzle[2], puzzle[3], puzzle[4]
            ) # returns the board as a list
            goal = puzzle[5]
            pieces = [
                (puzzle[9], None), # (piece index, last direction moved)
                (puzzle[8], None),
                (puzzle[7], None),
                (puzzle[6], None)
            ]
            # Goal piece needs to be last in the above array
            # But the goal piece is the first piece in the array (player_1_index)
            solution_answer = solver.generate(board, pieces, goal, True)
            solver.display_solution(solution_answer)
            if solution_answer is not None:
                solution = len(solution_answer)
                # the solution is all but the last move, but includes starting positions
                # len = optimal moves
                r = requests.post(
                    "https://devtactics.prototypeholdings.com/x/puzzle.php?action=add_solution",
                    data={"token": token, "key": key, "solution": solution}
                )
    else:
        raise ValueError("Malformed response", r.text, r.status_code, r.reason)

if __name__ == "__main__":
    main_db()
