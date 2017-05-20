import json

class BoardGenerator(object):
    """ GENERATES THE BOARD AS AN ARRAY """
    board_sections = json.loads('''[
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
    ]''')

    def __init__(self):
        self.board_width = 16
        self.section_width = 8

    def generate(self, key1, key2, key3, key4):
        keys = [key1 - 1, key2 -1, key3 -1, key4 - 1]
        N, E, S, W = 1, 2, 4, 8
        directions_abbr = {
            "N" : N,
            "E" : E,
            "S" : S,
            "W" : W
        }
        sections = []
        for key in keys:
            section = [
                W|N, N, N, N, N, N, N, N,
                W, 0, 0, 0, 0, 0, 0, 0,
                W, 0, 0, 0, 0, 0, 0, 0,
                W, 0, 0, 0, 0, 0, 0, 0,
                W, 0, 0, 0, 0, 0, 0, 0,
                W, 0, 0, 0, 0, 0, 0, 0,
                W, 0, 0, 0, 0, 0, 0, 0,
                W, 0, 0, 0, 0, 0, 0, W|N
            ]
            sections.append(section)
            for space in self.board_sections[key]["walls"]:
                index = space[1] * self.section_width + space[0]
                for wall in space[2]:
                    section[index] |= directions_abbr[wall]
        rotated_sections = [sections[0]]
        for i in range(1, len(sections)):
            rotated_sections.append([self.rotate(s, i) if s is not 0 else s for s in sections[i]])
        top = []
        for row in range(0, self.section_width):
            for col in range(0, self.section_width):
                top.append(rotated_sections[0][col + (row * self.section_width)])
            for col in range(self.section_width -1, -1, -1): # move 90 degrees
                top.append(rotated_sections[1][(self.section_width * col) + row])
        bottom = []
        for row in range(self.section_width -1, -1, -1):
            for col in range(0, self.section_width): # move 270 degrees
                bottom.append(rotated_sections[3][row + (col * self.section_width)])
            for col in range(self.section_width -1, -1, -1): # move 180 degrees
                bottom.append(rotated_sections[2][col + (row * self.section_width)])
        board = top + bottom
        return self.normalize(board)

    def rotate(self, walls, d):
        """
        rotates binary walls
        d=1=90deg, 2=180deg, 3=270deg
        """
        assert walls <= 0b1111
        shifted = walls << d
        high = shifted & 0b11110000
        low = high >> 4
        return low | (shifted & 0b00001111)

    def normalize(self, board):
        """
        when possible, match every 1 sided wall with its pair
        example a W wall should have a matching E wall next door
        """
        N, E, S, W = 1, 2, 4, 8
        length = len(board)
        width = self.board_width
        for i in range(0, length):
            if board[i]:
                if i != 0 and board[i] & W:
                    board[i - 1] |= E
                if i != length - 1 and board[i] & E:
                    board[i + 1] |= W
                if i >= width and board[i] & N:
                    board[i - width] |= S
                if i < length - width and board[i] & S:
                    board[i + width] |= N
        return board
