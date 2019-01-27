import { Vector } from 'excalibur';

export type Direction = 'Up' | 'Down' | 'Left' | 'Right';

export function Direction2Vec(d?: Direction) {
  // If last pressed input was released, reset last pressed button
  switch (d) {
    case 'Up':
      return Vector.Up;
    case 'Down':
      return Vector.Down;
    case 'Left':
      return Vector.Left;
    case 'Right':
      return Vector.Right;
    default:
      return Vector.Zero;
  }
}
