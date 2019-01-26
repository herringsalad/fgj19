// Bit order: content top-left top-right bottom-left bottom-right,
// with content most significant bit
// forbidden patterns:
//   11001 and 10110 (opposite holes)
//   10000 (filled w/o neighbors)

const tiles = [
  // 00000
  6,
  14,
  14,
  14,
  14,
  14,
  14,
  14,

  // 01000
  14,
  14,
  14,
  14,
  14,
  14,
  14,
  14,

  // 10000
  14,
  3,
  4,
  11,
  // 10100
  8,
  7,
  14,
  12,
  // 11000
  9,
  14,
  5,
  10,
  // 11100
  1,
  2,
  0,
  13
];

function getMagic(
  topLeft,
  top,
  topRight,
  left,
  me,
  right,
  bottomLeft,
  bottom,
  bottomRight
) {
  // what the fuck?
  return (
    me &&
    (1 << 4) |
      (((topLeft && top && left) & 1) << 3) |
      (((topRight && top && right) & 1) << 2) |
      (((bottomLeft && bottom && left) & 1) << 1) |
      (((bottomRight && bottom && right) & 1) << 0)
  );
}

// for a x,y map data (in col-first order), get 2x,2y tilemap with correct borders
// Out of bounds is empty.
export function getTiles(tilemap: boolean[][]): number[][] {
  const out: number[][] = [];
  const tmp: boolean[][] = [];
  for (let col = 0; col < tilemap.length; col++) {
    tmp[col * 2] = [];
    tmp[col * 2 + 1] = [];
    for (let row = 0; row < tilemap[col].length; row++) {
      /*
      Before:
      01
      10
      After:
      0011
      0011
      1100
      1100
       */
      tmp[col * 2][row * 2] = tilemap[col][row];
      tmp[col * 2][row * 2 + 1] = tilemap[col][row];
      tmp[col * 2 + 1][row * 2] = tilemap[col][row];
      tmp[col * 2 + 1][row * 2 + 1] = tilemap[col][row];
    }
  }

  for (let col = 0; col < tmp.length; col++) {
    out[col] = [];
    for (let row = 0; row < tmp[col].length; row++) {
      const topLeft = (tmp[col - 1] || [])[row - 1] ? 1 : 0;
      const top = (tmp[col - 1] || [])[row] ? 1 : 0;
      const topRight = (tmp[col - 1] || [])[row + 1] ? 1 : 0;

      const left = tmp[col][row - 1] ? 1 : 0;
      const me = tmp[col][row] ? 1 : 0;
      const right = tmp[col][row + 1] ? 1 : 0;

      const bottomLeft = (tmp[col + 1] || [])[row - 1] ? 1 : 0;
      const bottom = (tmp[col + 1] || [])[row] ? 1 : 0;
      const bottomRight = (tmp[col + 1] || [])[row + 1] ? 1 : 0;
      const magic = getMagic(
        topLeft,
        top,
        topRight,
        left,
        me,
        right,
        bottomLeft,
        bottom,
        bottomRight
      );
      out[col][row] = tiles[magic];
    }
  }
  return out;
}
