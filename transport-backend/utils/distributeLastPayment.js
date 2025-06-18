function distributeLastPayment(lastAmountPaid, currentWeeks, weeklyFee) {
  const updated = { ...currentWeeks };
  let remaining = lastAmountPaid;

  for (let i = 1; i <= 20 && remaining > 0; i++) {
    const key = `week${i}`;
    const cur = updated[key];

    // Skip if week already has any non-zero value or special status
    if (typeof cur === 'string' && (cur === 'Absent' || cur === 'Omitted')) {
      continue;
    }

    const numericValue = Number(cur) || 0;
    if (numericValue !== 0) continue;

    // Only fill if the week is 0
    const toAdd = Math.min(weeklyFee, remaining);
    updated[key] = toAdd;
    remaining -= toAdd;
  }

  return updated;
}

module.exports = distributeLastPayment;
