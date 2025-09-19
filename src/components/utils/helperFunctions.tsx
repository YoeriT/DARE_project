export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const calculateProgress = (raised: number, goal: number): number => {
  return Math.min((raised / goal) * 100, 100);
};

export const formatEth = (amount: number): string => {
  return `${amount.toFixed(2)} ETH`;
};
