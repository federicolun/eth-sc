export function computeFee(amountArs, fee) {
  if (fee.type === "percent") return amountArs * (fee.value / 100);
  if (fee.type === "fixed") return fee.value;
  throw new Error("fee tipo");
}