export function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const b = arr[i];
    arr[i] = arr[j];
    arr[j] = b;
    // [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
