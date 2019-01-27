import { BoundingBox } from 'excalibur';

export function offsetBoundingBox(b: BoundingBox, x: number, y: number): BoundingBox {
  return new BoundingBox(b.left + x, b.top + y, b.right + x, b.bottom + y);
}
