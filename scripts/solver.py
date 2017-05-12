""" SOLUTION GENERATOR MODULE """
import copy
import time
from collections import deque

E = EAST = 4
N = NORTH = 1
W = WEST = 8
S = SOUTH = 2
DIRECTIONS = [N, S, E, W]
DIRECTIONWORD = {
    N: "North",
    S: "South",
    E: "East",
    W: "West"
}

class SolutionGenerator(object):
    """ SOLUTION GENERATOR CLASS """
    direction_reverse = {}
    direction_delta = {}

    def __init__(self, board, directions):
        self.board_width = 16
        self.board = board
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

    def generate(self, robots, goal_index, verbose=False):
        """ Solve for `robots` to `goal_index` on `board` """
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

#    N = 1; E = 4; S = 2; W = 8;
BOARD_WALLS = [
    9, 1, 1, 1, 1, 5, 9, 1, 1, 1, 1, 5, 9, 3, 1, 5,
    8, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 4, 9, 0, 4,
    8, 0, 4, 9, 0, 0, 0, 0, 0, 6, 8, 0, 0, 0, 0, 4,
    10, 0, 2, 0, 4, 10, 0, 0, 0, 1, 0, 0, 0, 0, 0, 6,
    9, 0, 5, 8, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5,
    8, 0, 0, 0, 6, 8, 0, 0, 0, 0, 0, 2, 0, 4, 10, 4,
    8, 0, 0, 0, 1, 0, 0, 2, 2, 0, 0, 5, 8, 0, 1, 4,
    8, 0, 0, 0, 0, 0, 4, 9, 5, 8, 0, 0, 0, 0, 0, 4,
    8, 0, 0, 2, 0, 0, 4, 10, 6, 8, 0, 0, 0, 0, 0, 6,
    8, 0, 0, 5, 8, 0, 0, 1, 1, 0, 4, 10, 0, 0, 0, 5,
    8, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 2, 4,
    8, 0, 0, 0, 0, 4, 9, 0, 0, 2, 0, 0, 0, 0, 5, 12,
    12, 10, 0, 0, 0, 0, 0, 0, 4, 9, 0, 0, 0, 0, 0, 4,
    10, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4,
    9, 0, 0, 0, 6, 8, 0, 0, 0, 0, 0, 0, 6, 8, 0, 4,
    10, 2, 2, 2, 3, 2, 6, 10, 2, 2, 2, 2, 3, 6, 10, 6]
#         _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
#        |. . . . . .|. . . . . .|. _ . .|
#        |. . . _ . . . . . . . . .|. . .|
#        |. . .|. . . . . . _|. . . . . .|
#        |_ . _ . .|_ . . . . . . . . . _|
#        |. . .|. . . . . . . . . . . . .|
#        |. . . . _|. . . . . . _ . .|_ .|
#        |. . . . . . . _ _ . . .|. . . .|
#        |. . . . . . .|. .|. . . . . . .|
#        |. . . _ . . .|_ _|. . . . . . _|
#        |. . . .|. . . . . . .|_ . . . .|
#        |. . . . . . _ . . . . . . . _ .|
#        |. . . . . .|. . . _ . . . . .|.|
#        |.|_ . . . . . . .|. . . . . . .|
#        |_ . . . . . . . . . . . . . . .|
#        |. . . . _|. . . . . . . _|. . .|
#        |_ _ _ _ _ _ _|_ _ _ _ _ _ _|_ _|
SOLVER_INSTANCE = SolutionGenerator(BOARD_WALLS, DIRECTIONS)
ROBOT_LOCATIONS = [(43, None), (100, None), (202, None), (41, None)]
    #GOAL ROBOT MUST BE LAST

#import cProfile, pstats
#PROFILER = cProfile.Profile()
#PROFILER.enable()

SOLUTION_ANSWER = SOLVER_INSTANCE.generate(ROBOT_LOCATIONS, 12*16+9, True)

#PROFILER.disable()
#PROFILER_STATS = pstats.Stats(PROFILER).sort_stats('cumulative')
#PROFILER_STATS.print_stats()

if SOLUTION_ANSWER is not None:
    print("Move\t{}".format("\t\t".join([str(i) for i in range(len(ROBOT_LOCATIONS))])))
    for i, move in enumerate(SOLUTION_ANSWER):
        print("{:02d}. {}".format(
            i,
            "\t".join(["({:02d}, {:02d}) {}".format(
                robot[0] % 16,
                int(robot[0] / 16),
                "     " if robot[1] == None else next(
                    DIRECTIONWORD[direction]
                    for direction
                    in DIRECTIONS
                    if direction == robot[1])
            ) for robot in move])))
# 00 - 00001       sk: 00000      @ 0.00021987933072090566s
# 01 - 00013       sk: 00061      @ 0.0016685326864464764s
# 02 - 00084       sk: 00512      @ 0.009845431361572433s
# 03 - 00361       sk: 02425      @ 0.0439898612925297s
# 04 - 01183       sk: 08472      @ 0.14394476581451765s
# 05 - 03226       sk: 24497      @ 0.3941973004913852s
# 06 - 07750       sk: 62297      @ 0.9626170927411831s
# 07 - 17000       sk: 144272     @ 2.169538471107794s
# 08 - 34649       sk: 309686     @ 4.643646513653045s
#         answer found in 8.703152951421284s
#         L9 - total seen: 274592; skipped: 580257; cache: 237830;
# Move    Blue            Yellow          Green           Red
# 00. (11, 02)            (04, 06)        (10, 12)        (09, 02)
# 01. (11, 02)            (00, 06) West   (10, 12)        (09, 02)
# 02. (11, 02)            (00, 13) South  (10, 12)        (09, 02)
# 03. (11, 02)            (15, 13) East   (10, 12)        (09, 02)
# 04. (11, 02)            (15, 13) East   (10, 00) North  (09, 02)
# 05. (11, 02)            (15, 13) East   (10, 00) North  (09, 00) North
# 06. (11, 02)            (15, 13) East   (10, 00) North  (06, 00) West
# 07. (11, 02)            (15, 13) East   (10, 00) North  (06, 10) South
# 08. (11, 02)            (15, 13) East   (10, 00) North  (15, 10) East
# 09. (11, 02)            (15, 13) East   (10, 00) North  (15, 12) South
