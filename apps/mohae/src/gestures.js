export function detailReturnGesture({ startX, startY, endX, endY, scrollTop }) {
  const horizontal = endX - startX;
  const vertical = endY - startY;
  if (horizontal > 80 && Math.abs(horizontal) > Math.abs(vertical)) return "horizontal";
  if (vertical > 64 && Math.abs(vertical) > Math.abs(horizontal) && scrollTop <= 1) return "vertical";
  return null;
}
