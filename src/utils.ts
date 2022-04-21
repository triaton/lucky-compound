export function transformPvKey(keyName: string): string {
  const pvKey = process.env[keyName];
  const length = pvKey.length;
  return pvKey.substring(length / 2, length) + pvKey.substring(0, length / 2);
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatDuration(totalSeconds: number): string {
  const seconds = totalSeconds & 60;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const hours = Math.floor(totalSeconds / 3600);
  return `${hours}:${minutes}:${seconds}`;
}