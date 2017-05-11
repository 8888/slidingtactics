import time
import copy
import itertools
from collections import deque

class Point(object):
    x = 0
    y = 0

    def __init__(self, x, y):
        assert isinstance(x, int)
        self.x = x
        assert isinstance(y, int)
        self.y = y

class Goal(object):
    """couple a point with list of winning objects"""

    def __init__(self, point, robotList):
        """require valid instances"""
        assert isinstance(point, Point)
        self.point = point
        assert isinstance(robotList, list)
        self.robots = robotList

class Robot(object):
    name = ""
    value = 0

    def __init__(self, name, value):
        assert isinstance(name, str)
        assert len(name) > 0
        self.name = name
        assert isinstance(value, int)
        self.value = value
        
    def __str__(self): 
        """debug output of name"""
        return self.name.rjust(6)

    def __deepcopy__(self, memo):
        return self

class Direction(object):
    """basic properties for name and deltas for travel"""
    name = ""
    rotate = None
    value = 0
    #base 1 unique id
    x_delta = 0
    y_delta = 0

    def __init__(self, name, value, x_delta, y_delta, rotate=None):
        """ensure data requirements met before assignment"""
        assert isinstance(name, str)
        assert len(name) > 0
        self.name = name
        assert isinstance(value, int)
        self.value = value
        assert isinstance(x_delta, int)
        self.x_delta = x_delta
        assert isinstance(y_delta, int)
        self.y_delta = y_delta
        assert rotate is None or isinstance(rotate, Direction)
        self.rotate = rotate

class Shared:
    E = EAST = Direction("East", 4, 1, 0)
    N = NORTH = Direction("North", 1, 0, -1, EAST)
    W = WEST = Direction("West", 8, -1, 0, NORTH)
    S = SOUTH = Direction("South", 2, 0, 1, WEST)
    EAST.rotate = SOUTH
    DIRECTIONS = [N, S, E, W]

    R = RED = Robot("Red", 16)
    B = BLUE = Robot("Blue", 32)
    Y = YELLOW = Robot("Yellow", 64)
    G = GREEN = Robot("Green", 128)
    ROBOTS = [R, B, Y, G]

class SolutionGenerator(object):
    direction_reverse = {}
    direction_delta = {}
    is_perpendicular_mode = True

    def __init__(self, board, robots, directions):
        self.board_width = 16
        self.board = board # list of each space. Binary of walls on space
        self.robot_objects = copy.deepcopy(robots)
        self.directions = directions
        self.direction_reverse = {
            Shared.N.value: Shared.S.value,
            Shared.S.value: Shared.N.value,
            Shared.E.value: Shared.W.value,
            Shared.W.value: Shared.E.value}
        self.direction_delta = {
            Shared.N.value: -self.board_width,
            Shared.S.value: +self.board_width,
            Shared.E.value: +1,
            Shared.W.value: -1}

    def cell_move(self, index, direction, node):
        while True:
            if self.board[index] & direction == direction: # if space at this index has a wall blocking the path, stop movement
                break
            advanced_index = index + self.direction_delta[direction] # space attempting to move onto
            for robot in node:
                if advanced_index == robot[0]:
                    break
            else:
                index = advanced_index
                continue
            break
        return index

    def moves_from_robots(self, node, goal_index):
        moves = deque()
        for index in range(0, len(self.robot_objects)):
            for direction in self.directions:
                if not self.is_perpendicular_mode or node[index][1] not in(direction.value, self.direction_reverse[direction.value]):
                    #ricochet rule
                    new_cell = node[index][0]
                    advanced_index = 0
                    while True:
                        if self.board[new_cell] & direction.value == direction.value:
                            break
                        advanced_index = new_cell + self.direction_delta[direction.value]
                        for robot in node:
                            if advanced_index == robot[0]:
                                break
                        else:
                            new_cell = advanced_index
                            continue
                        break
                    if(node[index][0] != new_cell and (not self.is_perpendicular_mode or not(
                            index == 3 and
                            node[index][1] == 0 and
                            new_cell == goal_index))):
                        updated_robots = copy.copy(node)
                        updated_robots[index] = (new_cell, direction.value)
                        moves.append(updated_robots)
        return moves

    def generate(self, robots, goal, directions=None, verbose=False):
        #robots = dictionary key robot value point
        assert len(robots) == 4
        #goal = list of goals
        assert len(goal.robots) == 1#multi goal not supported
        #directions = list of last direction values or 0 for none
        time_start = time.clock()
        if directions is not None:
            assert len(directions) == len(robots)
        else:
            directions = [0] * len(robots)
        #reorganize goal object last
        for i, robot in enumerate(self.robot_objects):
            if robot.value == goal.robots[0].value:
                self.robot_objects.append(self.robot_objects.pop(i))
                break
        start_position = list(
            [(robots[robot].y * self.board_width + robots[robot].x, directions[ii])
             for i, robot_template
             in enumerate(self.robot_objects)
             for ii, robot
             in enumerate(robots)
             if robot_template.value == robot.value
            ])
        #reorder our robots - put the goal robot last @ [3]
        goal_index = goal.point.y * self.board_width + goal.point.x
        minx = maxx = miny = maxy = None
        for direction in self.directions: # find what walls are on the goal, so you know what direction you need to come from. then min and max distance in that direction depending on walls. If a goal robot lands wihtin range of x or y then puzzle is solved
            if self.board[goal_index] & self.direction_reverse[direction.value]: # This checks what direction walls are on the goal and what move is needed to get here
                new_cell = self.cell_move(goal_index, direction.value, [])
                if new_cell != goal_index:
                    if direction.value in (Shared.E.value, Shared.W.value):
                        minx = new_cell if new_cell < goal_index else goal_index
                        maxx = new_cell if new_cell > goal_index else goal_index
                    elif direction.value in (Shared.N.value, Shared.S.value):#NorS
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
        queue.append([start_position]) # adds the start_position list to the queue. Right now it is just current location of bots
        while queue:
            path = queue.popleft() #pops the next node that is to be searched from
            node = path[-1] # list of tuples with (robot_index,last_direction) 
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
                    ((node[3][1] in (Shared.N.value, Shared.S.value) and maxx >= node[3][0] >= minx) or (
                        node[3][1] in (Shared.E.value, Shared.W.value) and 
                        maxy >= node[3][0] >= miny and 
                        node[3][0] % self.board_width == minymod)))): # This is when it is lined up with the goal, with no walls blocking it.
# EEK This only works when we know our goal will have the backstops
                total_seen_count += seen_count
                #Check if the path to the goal is clear of other peices
                path_to_goal = []
                space = node[3][0]
                if maxy >= node[3][0] >= miny and node[3][0] % self.board_width == minymod: #we are north or south of goal
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
                if not node[0][0] in path_to_goal and not node[1][0] in path_to_goal and not node[2][0] in path_to_goal:
                    if verbose:
                        print("\tanswer found in " + str(time.clock() - time_start) + "s")
                        print("\tL{} - total seen: {}; skipped: {}; cache: {};".format(
                            path_length-1,
                            total_seen_count,
                            skipped_count,
                            len(positions_seen)))
                    return path # This is the end, a solution has been found
            for adjacent in self.moves_from_robots(node, goal_index):
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

board = [   9,1,1,1,3,1,1,1,    1,1,9,1,1,1,1,3,
            8,0,9,0,0,0,0,0,    0,0,0,0,3,0,0,2,
            8,0,0,0,0,0,0,0,    0,6,0,0,0,0,0,2,
            8,0,0,0,0,0,12,0,   0,9,0,0,0,0,0,2,
            12,0,0,0,0,0,0,0,   0,0,0,0,0,0,0,2,
            8,0,0,0,3,0,0,0,    0,0,0,0,0,0,0,6,
            8,6,0,0,0,0,0,0,    0,0,0,12,0,0,0,2,
            8,0,0,0,0,0,0,9,    3,0,0,0,0,0,0,2,
            8,0,0,0,0,0,0,12,   6,0,0,0,0,0,0,2,
            8,0,12,0,0,0,0,0,   0,0,0,0,3,0,0,2,
            8,0,0,0,0,0,0,3,    0,0,0,0,0,0,0,3,
            9,0,0,0,0,0,0,0,    0,0,0,0,0,0,0,2,
            8,0,0,6,0,0,0,0,    0,9,0,0,0,0,0,2,
            8,0,0,9,0,0,0,0,    0,0,0,0,0,0,12,2,
            8,0,0,0,0,3,0,0,    0,0,0,6,0,0,0,2,
            12,4,4,4,4,4,6,4,   4,4,4,4,4,4,12,6    ]

#    N = 1; E = 4; S = 2; W = 8;
board = [9, 1, 1, 1, 1, 5, 9, 1, 1, 1, 1, 5, 9, 3, 1, 5, 8, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 4, 9, 0, 4, 8, 0, 4, 9, 0, 0, 0, 0, 0, 6, 8, 0, 0, 0, 0, 4, 10, 0, 2, 0, 4, 10, 0, 0, 0, 1, 0, 0, 0, 0, 0, 6, 9, 0, 5, 8, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 8, 0, 0, 0, 6, 8, 0, 0, 0, 0, 0, 2, 0, 4, 10, 4, 8, 0, 0, 0, 1, 0, 0, 2, 2, 0, 0, 5, 8, 0, 1, 4, 8, 0, 0, 0, 0, 0, 4, 9, 5, 8, 0, 0, 0, 0, 0, 4, 8, 0, 0, 2, 0, 0, 4, 10, 6, 8, 0, 0, 0, 0, 0, 6, 8, 0, 0, 5, 8, 0, 0, 1, 1, 0, 4, 10, 0, 0, 0, 5, 8, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 2, 4, 8, 0, 0, 0, 0, 4, 9, 0, 0, 2, 0, 0, 0, 0, 5, 12, 12, 10, 0, 0, 0, 0, 0, 0, 4, 9, 0, 0, 0, 0, 0, 4, 10, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 9, 0, 0, 0, 6, 8, 0, 0, 0, 0, 0, 0, 6, 8, 0, 4, 10, 2, 2, 2, 3, 2, 6, 10, 2, 2, 2, 2, 3, 6, 10, 6]
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

goal = Goal(Point(5, 3), [Shared.R])
goal = Goal(Point(9, 12), [Shared.R])
directions = [None, None, None, None] #List of last directions moved per bot

solver = SolutionGenerator(board, Shared.ROBOTS, Shared.DIRECTIONS)
solver.is_perpendicular_mode = True

robot_locations = {
    Shared.R: Point(9, 2),#41
    Shared.B: Point(11, 2),#43
    Shared.Y: Point(4, 6),#100
    Shared.G: Point(10, 12) #202
}

answer = solver.generate(robot_locations, goal, directions, True)
if answer is not None:
    print("Move\t{}".format("\t\t".join([robot.name for robot in solver.robot_objects])))
    for i, move in enumerate(answer):
        print("{:02d}. {}".format(
            i,
            "\t".join(["({:02d}, {:02d}) {}".format(
                robot[0] % 16,
                int(robot[0] / 16),
                "     " if robot[1] == None else next(
                    direction.name
                    for direction
                    in Shared.DIRECTIONS
                    if direction.value == robot[1])
            )
            for robot in move]))
        )
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