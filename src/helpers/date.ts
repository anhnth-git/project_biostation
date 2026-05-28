export const getPastDate = (daysAgo = 1) => {
  return new Date(Date.now() - daysAgo * 864e5).toISOString().split('T')[0];
};

export const getFutureDate = (daysAhead = 1) => {
  return new Date(Date.now() + daysAhead * 864e5).toISOString().split('T')[0];
};
