export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const calculateProgress = (raised: number, goal: number): number => {
  return Math.min((raised / goal) * 100, 100);
};

export const formatEth = (amount: number): string => {
  return `${amount.toFixed(2)} ETH`;
};

export const formatTimeLeft = (deadline: number): string => {
  const currentTime = Math.floor(Date.now() / 1000);
  const timeLeftSeconds = Number(deadline) - currentTime;

  if (timeLeftSeconds <= 0) {
    return "No time";
  }

  const days = Math.floor(timeLeftSeconds / (24 * 60 * 60));
  const hours = Math.floor((timeLeftSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((timeLeftSeconds % (60 * 60)) / 60);
  if (days > 0) {
    return `${days} day${days !== 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  } else {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
};
