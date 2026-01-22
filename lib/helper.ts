export function capitalizeWords(input: string): string {
  return input
    .split(" ") // pisahkan berdasarkan spasi
    .map((word) => {
      if (word.length === 0) return word; // kalau kosong, biarkan
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" "); // gabungkan kembali dengan spasi
}
