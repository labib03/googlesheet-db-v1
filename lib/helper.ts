import { jenjangClassMap } from "./constants";

export function capitalizeWords(input: string): string {
  return input
    .split(" ") // pisahkan berdasarkan spasi
    .map((word) => {
      if (word.length === 0) return word; // kalau kosong, biarkan
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" "); // gabungkan kembali dengan spasi
}

export function getJenjangKelas(age: string) {
  if (Number(age) >= jenjangClassMap["pra nikah"]) {
    return "Pra Nikah";
  } else if (Number(age) >= jenjangClassMap["remaja"]) {
    return "Remaja";
  } else if (Number(age) >= jenjangClassMap["pra remaja"]) {
    return "Pra Remaja";
  } else if (Number(age) >= jenjangClassMap["caberawit c"]) {
    return "Caberawit C";
  } else if (Number(age) >= jenjangClassMap["caberawit b"]) {
    return "Caberawit B";
  } else if (Number(age) >= jenjangClassMap["caberawit a"]) {
    return "Caberawit A";
  } else if (Number(age) >= jenjangClassMap["paud"]) {
    return "PAUD";
  }

  return "-";
}
