export const convertToSeconds = (time: string) => {
  const timeUnits = {
    's': 1,
    'm': 60,
    'h': 60 * 60,
    'd': 24 * 60 * 60,
    'M': 30 * 24 * 60 * 60,
    'y': 365 * 24 * 60 * 60
  };

  const unit = time.slice(-1);
  const num = time.slice(0, -1);

  if (!timeUnits[unit] || isNaN(+num)) {
    throw new Error('Invalid time unit or number');
  }

  return +num * timeUnits[unit];
}