"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Loader2,
  Save,
  ChevronRight,
  ChevronLeft,
  User,
  Heart,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  BookOpen,
  Briefcase,
  Users,
  Award,
} from "lucide-react";
import { desaData, Gender, COLUMNS } from "@/lib/constants";
import { SheetRow } from "@/lib/google-sheets";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface GenerusFormProps {
  initialData?: SheetRow;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
  onCancel: () => void;
  title?: string;
  linkAdditionalInfoRowIndex?: number | null; // index of matched unlinked row if any
  mode?: "add" | "edit";
}

// Client-side helper to calculate age
const computeAge = (dobString: string): number | null => {
  if (!dobString) return null;
  try {
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? null : age;
  } catch (e) {
    return null;
  }
};

// Client-side helper to determine class cohort
const computeJenjang = (age: number): string => {
  if (age >= 19) return "Pra Nikah";
  if (age >= 15) return "Remaja";
  if (age >= 12) return "Pra Remaja";
  if (age >= 10) return "Caberawit C";
  if (age >= 8) return "Caberawit B";
  if (age >= 6) return "Caberawit A";
  return "PAUD";
};

// Parse dd/MM/yyyy date from sheet to yyyy-MM-dd for HTML5 input
const parseRawDateToInput = (rawDate?: string): string => {
  if (!rawDate) return "";
  const parts = rawDate.split("/");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return "";
};

export function GenerusForm({
  initialData,
  onSubmit,
  isPending,
  onCancel,
  title,
  linkAdditionalInfoRowIndex = null,
  mode = "add",
}: GenerusFormProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // --- STEP 1 STATES ---
  const [namaLengkap, setNamaLengkap] = useState(
    initialData ? String(initialData["NAMA LENGKAP"] || "") : ""
  );
  const [jenisKelamin, setJenisKelamin] = useState<string>(
    initialData
      ? initialData["JENIS KELAMIN"] === "Laki-Laki"
        ? "Pria"
        : initialData["JENIS KELAMIN"] === "Perempuan"
        ? "Wanita"
        : ""
      : ""
  );
  const [tempatLahir, setTempatLahir] = useState(
    initialData ? String(initialData["TEMPAT LAHIR"] || "") : ""
  );
  const [tanggalLahir, setTanggalLahir] = useState(
    initialData ? parseRawDateToInput(initialData["_rawBirthDate"] as string) : ""
  );
  const [nomorHp, setNomorHp] = useState(
    initialData ? String(initialData["NOMOR HP"] || "") : ""
  );
  const [selectedDesa, setSelectedDesa] = useState<string>(
    initialData ? String(initialData["DESA"] || "").toUpperCase() : ""
  );
  const [selectedKelompok, setSelectedKelompok] = useState<string>(
    initialData ? String(initialData["KELOMPOK"] || "") : ""
  );
  const [namaAyah, setNamaAyah] = useState(
    initialData ? String(initialData["NAMA AYAH"] || "") : ""
  );
  const [namaIbu, setNamaIbu] = useState(
    initialData ? String(initialData["NAMA IBU"] || "") : ""
  );
  const [hobi, setHobi] = useState(
    initialData ? String(initialData["HOBI"] || "") : ""
  );
  const [skill, setSkill] = useState(
    initialData ? String(initialData["SKILL / CITA-CITA"] || "") : ""
  );

  // Real-time calculations
  const [age, setAge] = useState<number | null>(null);
  const [jenjang, setJenjang] = useState<string | null>(null);

  useEffect(() => {
    const calculatedAge = computeAge(tanggalLahir);
    setAge(calculatedAge);
    if (calculatedAge !== null) {
      setJenjang(computeJenjang(calculatedAge));
    } else {
      setJenjang(null);
    }
  }, [tanggalLahir]);

  // Automatically clear red borders when users focus or input inside invalid fields
  useEffect(() => {
    const formElement = document.getElementById("generus-wizard-form");
    if (!formElement) return;

    const handleInputFocusOrChange = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.tagName === "TEXTAREA")
      ) {
        target.classList.remove(
          "border-red-500",
          "dark:border-red-500/50",
          "focus-visible:border-red-500",
          "focus-visible:ring-red-500/20"
        );
      }
    };

    formElement.addEventListener("focusin", handleInputFocusOrChange);
    formElement.addEventListener("input", handleInputFocusOrChange);

    return () => {
      formElement.removeEventListener("focusin", handleInputFocusOrChange);
      formElement.removeEventListener("input", handleInputFocusOrChange);
    };
  }, [step]);

  // Mandatory checks based on age
  const isHobiSkillRequired = age !== null && age >= 9;

  // --- STEP 2 STATES (AdditionalInfo) ---
  const [namaPanggilan, setNamaPanggilan] = useState(
    initialData ? String(initialData["_ai_Nama Panggilan"] || "") : ""
  );
  const [statusAkademik, setStatusAkademik] = useState<string>(() => {
    if (initialData) {
      if (initialData["_ai_Asal Sekolah"] || initialData["_ai_Kelas"] || initialData["_ai_Jurusan"]) {
        return "Pelajar Sekolah";
      }
      if (initialData["_ai_Asal Universitas"] || initialData["_ai_Tahun Masuk Universitas"] || initialData["_ai_Fakultas/Jurusan"]) {
        return "Mahasiswa";
      }
      const kesibukan = String(initialData["_ai_Kesibukan Saat ini"] || "");
      if (kesibukan === "Bekerja" || kesibukan === "Usaha/Wirausaha") {
        return "Pekerja / Wirausaha";
      }
    }
    return "";
  });
  const [asalSekolah, setAsalSekolah] = useState(
    initialData ? String(initialData["_ai_Asal Sekolah"] || "") : ""
  );
  const [kelas, setKelas] = useState(
    initialData ? String(initialData["_ai_Kelas"] || "") : ""
  );
  const [jurusan, setJurusan] = useState(
    initialData ? String(initialData["_ai_Jurusan"] || "") : ""
  );
  const [kesibukanSaatIni, setKesibukanSaatIni] = useState(
    initialData ? String(initialData["_ai_Kesibukan Saat ini"] || "") : ""
  );
  const [mencariPekerjaan, setMencariPekerjaan] = useState(
    initialData
      ? String(
          initialData[
            "_ai_Jika belum bekerja, apakah anda sedang mencari pekerjaan?"
          ] || ""
        )
      : ""
  );
  const [keahlianImpianPekerjaan, setKeahlianImpianPekerjaan] = useState(
    initialData
      ? String(
          initialData[
            "_ai_Jika sedang mencari kerja, pekerjaan apa yang ingin anda inginkan? atau kamu bisa jelaskan keahlian kamu?"
          ] || ""
        )
      : ""
  );
  const [asalUniversitas, setAsalUniversitas] = useState(
    initialData ? String(initialData["_ai_Asal Universitas"] || "") : ""
  );
  const [tahunMasukUniversitas, setTahunMasukUniversitas] = useState(
    initialData ? String(initialData["_ai_Tahun Masuk Universitas"] || "") : ""
  );
  const [pendidikan, setPendidikan] = useState(
    initialData ? String(initialData["_ai_Pendidikan"] || "") : ""
  );
  const [fakultasJurusanKuliah, setFakultasJurusanKuliah] = useState(
    initialData ? String(initialData["_ai_Fakultas/Jurusan"] || "") : ""
  );
  const [kuliahSambilBekerja, setKuliahSambilBekerja] = useState(
    initialData
      ? String(
          initialData["_ai_Apakah kamu kuliah sambil bekerja/usaha/MT"] || ""
        )
      : ""
  );
  const [tempatBekerja, setTempatBekerja] = useState(
    initialData ? String(initialData["_ai_Tempat Bekerja/Usaha/MT"] || "") : ""
  );
  const [posisiBekerja, setPosisiBekerja] = useState(
    initialData ? String(initialData["_ai_Sebagai apa anda Bekerja/Usaha/MT"] || "") : ""
  );
  const [kesiapanMenikah, setKesiapanMenikah] = useState<number>(
    initialData
      ? Number(
          initialData["_ai_Dari 1 - 10, seberapa siapkah kamu untuk menikah"] ||
            5
        )
      : 5
  );

  // Style configs based on active mode
  const isEdit = mode === "edit";
  
  const textHighlight = isEdit 
    ? "text-amber-600 dark:text-amber-400" 
    : "text-indigo-600 dark:text-indigo-400";
    
  const textHighlightHover = isEdit
    ? "hover:text-amber-700 dark:hover:text-amber-300"
    : "hover:text-indigo-700 dark:hover:text-indigo-300";
    
  const badgeStyle = isEdit
    ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/30"
    : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-900/30";
    
  const focusRing = isEdit
    ? "focus-visible:ring-amber-500/20 focus-visible:border-amber-500"
    : "focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500";
    
  const radioSelected = isEdit
    ? "bg-amber-50/40 border-amber-500 dark:bg-amber-950/20 dark:border-amber-600"
    : "bg-indigo-50/40 border-indigo-500 dark:bg-indigo-950/20 dark:border-indigo-600";
    
  const accentLightBg = isEdit
    ? "bg-amber-500/10 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400"
    : "bg-indigo-500/10 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400";
    
  const btnPrimary = isEdit
    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-100/50 dark:shadow-none focus-visible:ring-amber-500/20 focus-visible:ring-offset-0"
    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100/50 dark:shadow-none focus-visible:ring-indigo-500/20 focus-visible:ring-offset-0";
    
  const sliderTheme = isEdit
    ? "py-1 cursor-pointer [&_[role=slider]]:bg-amber-500 [&_[role=slider]]:border-amber-500 [&_.bg-primary]:bg-amber-500"
    : "py-1 cursor-pointer [&_[role=slider]]:bg-indigo-600 [&_[role=slider]]:border-indigo-600 [&_.bg-primary]:bg-indigo-600";

  // Cascading logic: reset kelompok if desa changes
  const handleDesaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDesa(e.target.value);
    setSelectedKelompok("");
  };

  const handleNext = () => {
    // Validate Step 1 fields before proceeding
    const formElement = document.getElementById("generus-wizard-form") as HTMLFormElement;
    if (formElement) {
      const inputs = formElement.querySelectorAll("input[required], select[required], textarea[required]");
      let isValid = true;
      
      inputs.forEach((input) => {
        const inputEl = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (!inputEl.value.trim() && inputEl.offsetParent !== null) {
          isValid = false;
          inputEl.classList.add("border-red-500", "dark:border-red-500/50");
        } else {
          inputEl.classList.remove(
            "border-red-500",
            "dark:border-red-500/50",
            "focus-visible:border-red-500",
            "focus-visible:ring-red-500/20"
          );
        }
      });

      // Special check for Radio Button (Jenis Kelamin)
      if (!jenisKelamin) {
        isValid = false;
        toast.error("Silakan pilih Jenis Kelamin.");
        return;
      }

      if (!isValid) {
        toast.error("Mohon lengkapi semua field wajib bertanda (*) di Tahap 1.");
        return;
      }
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormSubmit = (e: React.FormEvent, skipStep2 = false) => {
    e.preventDefault();

    // Map UI values to payload
    const finalFormData = new FormData();

    // Form Responses 1 fields
    finalFormData.append("NAMA LENGKAP", namaLengkap);
    finalFormData.append("JENIS KELAMIN", jenisKelamin === "Pria" ? "Laki-Laki" : "Perempuan");
    finalFormData.append("TEMPAT LAHIR", tempatLahir);
    finalFormData.append("TANGGAL LAHIR", tanggalLahir);
    finalFormData.append("NOMOR HP", nomorHp);
    finalFormData.append("DESA", selectedDesa);
    finalFormData.append("KELOMPOK", selectedKelompok);
    finalFormData.append("NAMA AYAH", namaAyah);
    finalFormData.append("NAMA IBU", namaIbu);
    finalFormData.append("HOBI", hobi);
    finalFormData.append("SKILL / CITA-CITA", skill);

    if (linkAdditionalInfoRowIndex !== null) {
      finalFormData.append("linkAdditionalInfoRowIndex", linkAdditionalInfoRowIndex.toString());
    }

    // Step 2 (AdditionalInfo) fields - only append if not skipped
    if (!skipStep2) {
      finalFormData.append("namaPanggilan", namaPanggilan);
      
      // Data Cleansing based on Status Akademik (Opsi A)
      if (statusAkademik === "Pelajar Sekolah") {
        finalFormData.append("asalSekolah", asalSekolah);
        finalFormData.append("kelas", kelas);
        finalFormData.append("jurusan", jurusan);
        
        finalFormData.append("asalUniversitas", "");
        finalFormData.append("tahunMasukUniversitas", "");
        finalFormData.append("pendidikan", "");
        finalFormData.append("fakultasJurusanKuliah", "");
        finalFormData.append("kuliahSambilBekerja", "");
      } else if (statusAkademik === "Mahasiswa") {
        finalFormData.append("asalSekolah", "");
        finalFormData.append("kelas", "");
        finalFormData.append("jurusan", "");
        
        finalFormData.append("asalUniversitas", asalUniversitas);
        finalFormData.append("tahunMasukUniversitas", tahunMasukUniversitas);
        finalFormData.append("pendidikan", pendidikan);
        finalFormData.append("fakultasJurusanKuliah", fakultasJurusanKuliah);
        finalFormData.append("kuliahSambilBekerja", kuliahSambilBekerja);
      } else {
        // Clear all if Pekerja, Lainnya, or Empty status
        finalFormData.append("asalSekolah", "");
        finalFormData.append("kelas", "");
        finalFormData.append("jurusan", "");
        
        finalFormData.append("asalUniversitas", "");
        finalFormData.append("tahunMasukUniversitas", "");
        finalFormData.append("pendidikan", "");
        finalFormData.append("fakultasJurusanKuliah", "");
        finalFormData.append("kuliahSambilBekerja", "");
      }

      finalFormData.append("kesibukanSaatIni", kesibukanSaatIni);
      finalFormData.append("mencariPekerjaan", mencariPekerjaan);
      finalFormData.append("keahlianImpianPekerjaan", keahlianImpianPekerjaan);
      finalFormData.append("tempatBekerja", tempatBekerja);
      finalFormData.append("posisiBekerja", posisiBekerja);
      finalFormData.append("kesiapanMenikah", kesiapanMenikah.toString());
    }

    onSubmit(finalFormData);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 font-outfit space-y-10 animate-in fade-in duration-300">
      
      {/* Top Navigation & Header */}
      <div className="space-y-6">
        <button 
          type="button" 
          onClick={onCancel} 
          className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 ${textHighlightHover} transition-colors group cursor-pointer`}
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Kembali ke Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b border-slate-200/60 dark:border-slate-800/80 pb-8">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl md:text-3.5xl font-black text-slate-900 dark:text-white tracking-tight font-syne flex items-center gap-3">
                {title || "Pendaftaran Generus"}
              </h1>
              <span className={`inline-flex items-center gap-1 border text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${badgeStyle}`}>
                {isEdit ? "Mode Edit" : "Data Baru"}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {step === 1 
                ? "Lengkapi seluruh isian data pokok generus wajib bertanda (*) di bawah ini." 
                : "Tambahkan informasi profil pelengkap generus di bawah ini (seluruhnya opsional)."}
            </p>
          </div>

          {/* Horizontal Stepper (Layout Option B) */}
          <div className="w-full md:max-w-xs self-end">
            <div className="flex items-center justify-between w-full relative">
              {/* Line background */}
              <div className="absolute top-4 left-0 right-0 h-[2px] bg-slate-200 dark:bg-slate-800/80 z-0" />
              {/* Active/Completed Line highlight */}
              <div 
                className={`absolute top-4 left-0 h-[2px] z-0 transition-all duration-500 ${
                  isEdit ? "bg-amber-500" : "bg-indigo-600"
                }`} 
                style={{ width: step === 1 ? "0%" : "100%" }}
              />
              
              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center gap-2 cursor-pointer" onClick={() => step === 2 && setStep(1)}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs border transition-all duration-300 ${
                  step === 1 
                    ? isEdit
                      ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20"
                      : "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20"
                    : "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                }`}>
                  {step === 1 ? "1" : "✓"}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider transition-colors duration-300 ${
                  step === 1 ? textHighlight : "text-slate-400 dark:text-slate-500"
                }`}>
                  Data Utama
                </span>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center gap-2 cursor-pointer" onClick={() => step === 1 && handleNext()}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs border transition-all duration-300 ${
                  step === 2 
                    ? isEdit
                      ? "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20"
                      : "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20"
                    : "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600"
                }`}>
                  2
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider transition-colors duration-300 ${
                  step === 2 ? textHighlight : "text-slate-400 dark:text-slate-500"
                }`}>
                  Info Tambahan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container without floating card styling - borderless & integrated */}
      <div className="space-y-10 pt-2 pb-16">
        
        <form 
          id="generus-wizard-form" 
          onSubmit={(e) => handleFormSubmit(e)} 
          className="space-y-10"
        >
          <AnimatePresence mode="wait">
            
            {/* --- STEP 1: DATA UTAMA --- */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-10"
              >
                {/* Banner Step 1 */}
                <div className={`p-5 border rounded-2xl flex items-start gap-4 transition-all duration-300 ${
                  isEdit 
                    ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-100/80 dark:border-amber-900/30" 
                    : "bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-100/80 dark:border-indigo-900/30"
                }`}>
                  <Sparkles className={`w-5 h-5 shrink-0 mt-0.5 ${isEdit ? "text-amber-500" : "text-indigo-600 dark:text-indigo-400"}`} />
                  <p className={`text-xs leading-relaxed font-medium ${isEdit ? "text-amber-800 dark:text-amber-300" : "text-indigo-800 dark:text-indigo-300"}`}>
                    {isEdit ? (
                      <>Anda sedang dalam <span className="font-bold">Mode Edit</span> untuk data <span className="font-extrabold">{namaLengkap}</span>. Pastikan data yang diperbarui sudah benar sebelum menyimpan perubahan ke database.</>
                    ) : (
                      <>Isi seluruh data pokok generus di bawah ini. Kolom yang ditandai dengan bintang merah (<span className="text-red-500 font-bold">*</span>) wajib diisi untuk dapat lanjut ke tahap berikutnya.</>
                    )}
                  </p>
                </div>

                {/* Section A: Identitas Generus */}
                <div className="space-y-6">
                  <div className={`flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-800/60 ${textHighlight}`}>
                    <User className="w-4 h-4" />
                    <h3 className="text-xs font-black uppercase tracking-wider font-syne">A. Identitas Generus</h3>
                  </div>

                  {/* Nama Lengkap */}
                  <div className="space-y-1.5">
                    <Label htmlFor="NAMA LENGKAP" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="NAMA LENGKAP"
                      placeholder="Masukkan nama lengkap..."
                      className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing} font-medium`}
                      required
                      value={namaLengkap}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                    />
                  </div>

                  {/* Jenis Kelamin (Premium Radio Buttons) */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Jenis Kelamin <span className="text-red-500">*</span>
                    </Label>
                    <RadioGroup 
                      value={jenisKelamin} 
                      onValueChange={setJenisKelamin}
                      className="flex flex-col sm:flex-row gap-4"
                    >
                      <label 
                        htmlFor="gender-pria"
                        className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer flex-1 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-900/40 ${
                          jenisKelamin === "Pria" 
                            ? radioSelected 
                            : "bg-slate-50/50 border-slate-200 dark:bg-slate-950 dark:border-slate-800/80"
                        }`}
                      >
                        <RadioGroupItem value="Pria" id="gender-pria" className={`border-slate-300 dark:border-slate-700 ${isEdit ? "text-amber-500 focus:ring-amber-500" : "text-indigo-600 focus:ring-indigo-600"}`} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 select-none text-sm">Laki-Laki (Pria)</span>
                      </label>
                      
                      <label 
                        htmlFor="gender-wanita"
                        className={`flex items-center space-x-3 p-4 rounded-2xl border cursor-pointer flex-1 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-900/40 ${
                          jenisKelamin === "Wanita" 
                            ? radioSelected 
                            : "bg-slate-50/50 border-slate-200 dark:bg-slate-950 dark:border-slate-800/80"
                        }`}
                      >
                        <RadioGroupItem value="Wanita" id="gender-wanita" className={`border-slate-300 dark:border-slate-700 ${isEdit ? "text-amber-500 focus:ring-amber-500" : "text-indigo-600 focus:ring-indigo-600"}`} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 select-none text-sm">Perempuan (Wanita)</span>
                      </label>
                    </RadioGroup>
                  </div>

                  {/* Tempat Lahir & Tanggal Lahir */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="TEMPAT LAHIR" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Tempat Lahir <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="TEMPAT LAHIR"
                        placeholder="Kota kelahiran..."
                        className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing}`}
                        required
                        value={tempatLahir}
                        onChange={(e) => setTempatLahir(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="TANGGAL LAHIR" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Tanggal Lahir <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="TANGGAL LAHIR"
                        type="date"
                        className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing}`}
                        required
                        value={tanggalLahir}
                        onChange={(e) => setTanggalLahir(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Real-time calculated age & class indicators */}
                  {age !== null && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="grid grid-cols-2 gap-5 p-5 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-850/50 rounded-2xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl shrink-0 ${accentLightBg}`}>
                          <Calendar className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Kalkulasi Usia</p>
                          <p className="text-base font-black text-slate-850 dark:text-slate-105 mt-0.5">{age} Tahun</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl shrink-0 ${accentLightBg}`}>
                          <Layers className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Jenjang Kelas</p>
                          <p className={`text-base font-black mt-0.5 ${textHighlight}`}>{jenjang || "-"}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Nomor HP */}
                  <div className="space-y-1.5">
                    <Label htmlFor="NOMOR HP" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nomor HP / Whatsapp <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="NOMOR HP"
                      type="number"
                      placeholder="Contoh: 08123456789..."
                      className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing}`}
                      required
                      value={nomorHp}
                      onChange={(e) => setNomorHp(e.target.value)}
                    />
                  </div>
                </div>

                {/* Section B: Wilayah & Orang Tua */}
                <div className="space-y-6 pt-4">
                  <div className={`flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-800/60 ${textHighlight}`}>
                    <MapPin className="w-4 h-4" />
                    <h3 className="text-xs font-black uppercase tracking-wider font-syne">B. Tempat Sambung & Orang Tua</h3>
                  </div>

                  {/* Desa & Kelompok (Cascading Dropdowns) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="DESA" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Desa <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="DESA"
                        className={`flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 ${focusRing}`}
                        required
                        value={selectedDesa}
                        onChange={handleDesaChange}
                      >
                        <option value="">Pilih Desa</option>
                        {Object.keys(desaData).map((desaName) => (
                          <option key={desaName} value={desaName}>
                            {desaName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="KELOMPOK" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Kelompok <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="KELOMPOK"
                        className={`flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 ${focusRing} disabled:opacity-50`}
                        required
                        disabled={!selectedDesa}
                        value={selectedKelompok}
                        onChange={(e) => setSelectedKelompok(e.target.value)}
                      >
                        <option value="">Pilih Kelompok</option>
                        {selectedDesa &&
                          desaData[selectedDesa]?.map((kelompokName) => (
                            <option key={kelompokName} value={kelompokName}>
                              {kelompokName}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Orang Tua: Ayah & Ibu */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="NAMA AYAH" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Nama Ayah Kandung <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="NAMA AYAH"
                        placeholder="Nama Ayah..."
                        className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing}`}
                        required
                        value={namaAyah}
                        onChange={(e) => setNamaAyah(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="NAMA IBU" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Nama Ibu Kandung <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="NAMA IBU"
                        placeholder="Nama Ibu..."
                        className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing}`}
                        required
                        value={namaIbu}
                        onChange={(e) => setNamaIbu(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: Bakat & Minat */}
                <div className="space-y-6 pt-4">
                  <div className={`flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-800/60 ${textHighlight}`}>
                    <Award className="w-4 h-4" />
                    <h3 className="text-xs font-black uppercase tracking-wider font-syne">C. Bakat & Minat</h3>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="HOBI" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Hobi {isHobiSkillRequired ? <span className="text-red-500">*</span> : <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>}
                      </Label>
                      {isHobiSkillRequired && (
                        <span className={`text-[10px] font-black uppercase tracking-wider ${textHighlight}`}>Wajib diisi (usia ≥ 9 tahun)</span>
                      )}
                    </div>
                    <Textarea
                      id="HOBI"
                      placeholder="Tuliskan hobi atau kesenangan generus..."
                      className={`min-h-[90px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing} py-3`}
                      required={isHobiSkillRequired}
                      value={hobi}
                      onChange={(e) => setHobi(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="SKILL / CITA-CITA" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Skill / Keahlian & Cita-Cita {isHobiSkillRequired ? <span className="text-red-500">*</span> : <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>}
                      </Label>
                      {isHobiSkillRequired && (
                        <span className={`text-[10px] font-black uppercase tracking-wider ${textHighlight}`}>Wajib diisi (usia ≥ 9 tahun)</span>
                      )}
                    </div>
                    <Textarea
                      id="SKILL / CITA-CITA"
                      placeholder="Tuliskan keahlian khusus, keterampilan, atau cita-cita generus..."
                      className={`min-h-[90px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing} py-3`}
                      required={isHobiSkillRequired}
                      value={skill}
                      onChange={(e) => setSkill(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- STEP 2: DATA TAMBAHAN --- */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="space-y-10"
              >
                {/* Banner Step 2 */}
                <div className="p-5 bg-teal-55/10 dark:bg-teal-950/10 border border-teal-100/80 dark:border-teal-900/30 rounded-2xl flex items-start gap-4">
                  <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-teal-805 dark:text-teal-300 leading-relaxed font-medium">
                    <span className="font-bold">Tahap 2: Informasi Tambahan.</span> Seluruh isian di bawah ini bersifat opsional untuk melengkapi profil data generus. Anda dapat melewati tahap ini langsung jika tidak diperlukan.
                  </p>
                </div>

                {/* Section A: Pendidikan & Akademik */}
                <div className="space-y-6">
                  <div className={`flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-800/60 ${textHighlight}`}>
                    <BookOpen className="w-4 h-4" />
                    <h3 className="text-xs font-black uppercase tracking-wider font-syne">A. Pendidikan & Akademik</h3>
                  </div>

                  {/* Nama Panggilan */}
                  <div className="space-y-1.5">
                    <Label htmlFor="namaPanggilan" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nama Panggilan <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                    </Label>
                    <Input
                      id="namaPanggilan"
                      placeholder="Nama panggilan akrab..."
                      className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing}`}
                      value={namaPanggilan}
                      onChange={(e) => setNamaPanggilan(e.target.value)}
                    />
                  </div>

                  {/* Status Akademik Selector Dropdown */}
                  <div className="space-y-1.5">
                    <Label htmlFor="statusAkademik" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status Akademik Saat Ini <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                    </Label>
                    <select
                      id="statusAkademik"
                      className={`flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 ${focusRing}`}
                      value={statusAkademik}
                      onChange={(e) => setStatusAkademik(e.target.value)}
                    >
                      <option value="">Pilih Status Akademik</option>
                      <option value="Pelajar Sekolah">Pelajar Sekolah (SD/SMP/SMA)</option>
                      <option value="Mahasiswa">Mahasiswa (Kuliah)</option>
                    </select>
                  </div>

                  {/* Conditional Render with AnimatePresence */}
                  <AnimatePresence mode="wait">
                    {/* Pelajar Sekolah Fields */}
                    {statusAkademik === "Pelajar Sekolah" && (
                      <motion.div
                        key="pelajar-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden space-y-6"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="asalSekolah" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Asal Sekolah <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                            </Label>
                            <Input
                              id="asalSekolah"
                              placeholder="SD/SMP/SMA/Instansi..."
                              className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing}`}
                              value={asalSekolah}
                              onChange={(e) => setAsalSekolah(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="kelas" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Kelas <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                            </Label>
                            <Input
                              id="kelas"
                              type="number"
                              placeholder="Contoh: 10, 11, 12..."
                              className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing}`}
                              value={kelas}
                              onChange={(e) => setKelas(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="jurusan" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Jurusan Sekolah <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                          </Label>
                          <Input
                            id="jurusan"
                            placeholder="IPA/IPS/RPL/dsb..."
                            className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing}`}
                            value={jurusan}
                            onChange={(e) => setJurusan(e.target.value)}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Mahasiswa Fields */}
                    {statusAkademik === "Mahasiswa" && (
                      <motion.div
                        key="mahasiswa-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden space-y-6"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                          <div className="space-y-1.5">
                            <Label htmlFor="asalUniversitas" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Asal Universitas / Kampus <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                            </Label>
                            <Input
                              id="asalUniversitas"
                              placeholder="Nama Kampus/Univ..."
                              className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing}`}
                              value={asalUniversitas}
                              onChange={(e) => setAsalUniversitas(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="tahunMasukUniversitas" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Tahun Masuk Kuliah <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                            </Label>
                            <Input
                              id="tahunMasukUniversitas"
                              type="number"
                              placeholder="Format: YYYY (contoh: 2024)..."
                              className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing}`}
                              value={tahunMasukUniversitas}
                              onChange={(e) => setTahunMasukUniversitas(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-1.5">
                            <Label htmlFor="pendidikan" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Pendidikan Terakhir <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                            </Label>
                            <Input
                              id="pendidikan"
                              placeholder="D3/D4/S1/S2/dsb..."
                              className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing}`}
                              value={pendidikan}
                              onChange={(e) => setPendidikan(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="fakultasJurusanKuliah" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Fakultas / Program Studi Kuliah <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                            </Label>
                            <Input
                              id="fakultasJurusanKuliah"
                              placeholder="Fakultas / Program Studi..."
                              className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing}`}
                              value={fakultasJurusanKuliah}
                              onChange={(e) => setFakultasJurusanKuliah(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="kuliahSambilBekerja" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Apakah kamu kuliah sambil bekerja/usaha/MT? <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                          </Label>
                          <select
                            id="kuliahSambilBekerja"
                            className={`flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 ${focusRing}`}
                            value={kuliahSambilBekerja}
                            onChange={(e) => setKuliahSambilBekerja(e.target.value)}
                          >
                            <option value="">Pilih Opsi</option>
                            <option value="Ya">Ya</option>
                            <option value="Tidak">Tidak</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Section B: Karir & Kesibukan */}
                <div className="space-y-6 pt-4">
                  <div className={`flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-800/60 ${textHighlight}`}>
                    <Briefcase className="w-4 h-4" />
                    <h3 className="text-xs font-black uppercase tracking-wider font-syne">B. Karir & Kesibukan</h3>
                  </div>

                  {/* Kesibukan Saat Ini & Mencari Pekerjaan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="kesibukanSaatIni" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Kesibukan Saat Ini <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                      </Label>
                      <select
                        id="kesibukanSaatIni"
                        className={`flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 ${focusRing}`}
                        value={kesibukanSaatIni}
                        onChange={(e) => setKesibukanSaatIni(e.target.value)}
                      >
                        <option value="">Pilih Kesibukan</option>
                        <option value="Sekolah">Sekolah</option>
                        <option value="Kuliah">Kuliah</option>
                        <option value="Bekerja">Bekerja</option>
                        <option value="Mencari Kerja">Mencari Kerja</option>
                        <option value="MT / Khidmat">MT / Khidmat</option>
                        <option value="Usaha/Wirausaha">Usaha/Wirausaha</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="mencariPekerjaan" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Apakah sedang mencari pekerjaan? <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                      </Label>
                      <select
                        id="mencariPekerjaan"
                        className={`flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 ${focusRing}`}
                        value={mencariPekerjaan}
                        onChange={(e) => setMencariPekerjaan(e.target.value)}
                      >
                        <option value="">Pilih Opsi</option>
                        <option value="Ya">Ya</option>
                        <option value="Tidak">Tidak</option>
                      </select>
                    </div>
                  </div>

                  {/* Keahlian / Impian Pekerjaan */}
                  <div className="space-y-1.5">
                    <Label htmlFor="keahlianImpianPekerjaan" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Penjelasan Keahlian / Impian Pekerjaan <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                    </Label>
                    <Textarea
                      id="keahlianImpianPekerjaan"
                      placeholder="Jelaskan bidang keahlian khusus atau pekerjaan impian generus..."
                      className={`min-h-[90px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing} py-3`}
                      value={keahlianImpianPekerjaan}
                      onChange={(e) => setKeahlianImpianPekerjaan(e.target.value)}
                    />
                  </div>

                  {/* Kerja Part: Tempat Bekerja & Posisi Bekerja */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-dashed border-slate-200/60 dark:border-slate-800/40">
                    <div className="space-y-1.5">
                      <Label htmlFor="tempatBekerja" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Tempat Bekerja / Nama Usaha <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                      </Label>
                      <Input
                        id="tempatBekerja"
                        placeholder="Nama instansi/perusahaan/toko..."
                        className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing}`}
                        value={tempatBekerja}
                        onChange={(e) => setTempatBekerja(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="posisiBekerja" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Jabatan / Posisi Kerja <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                      </Label>
                      <Input
                        id="posisiBekerja"
                        placeholder="Staf/Manager/Owner/MT/dsb..."
                        className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-2 ${focusRing}`}
                        value={posisiBekerja}
                        onChange={(e) => setPosisiBekerja(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: Rencana Masa Depan */}
                <div className="space-y-6 pt-4">
                  <div className={`flex items-center gap-2 pb-2.5 border-b border-slate-200/60 dark:border-slate-800/60 ${textHighlight}`}>
                    <Heart className="w-4 h-4" />
                    <h3 className="text-xs font-black uppercase tracking-wider font-syne">C. Rencana Masa Depan</h3>
                  </div>

                  {/* Kesiapan Menikah (Slider) */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-2">
                      <Label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Tingkat Kesiapan Menikah <span className="text-slate-400 text-[10px] lowercase normal-case font-normal">(opsional)</span>
                      </Label>
                      <span className={`text-xs font-bold px-3 py-1.5 border rounded-xl transition-all duration-300 ${badgeStyle} w-fit`}>
                        Skor Kesiapan: <span className="font-extrabold">{kesiapanMenikah} / 10</span>
                      </span>
                    </div>
                    <div className="px-1 py-4 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl">
                      <Slider
                        defaultValue={[kesiapanMenikah]}
                        max={10}
                        min={1}
                        step={1}
                        onValueChange={(val) => setKesiapanMenikah(val[0])}
                        className={sliderTheme}
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-extrabold uppercase tracking-wider pt-3">
                        <span>Belum Siap (1)</span>
                        <span>Sangat Siap (10)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Natural Bottom Navigation Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-10 border-t border-slate-200/60 dark:border-slate-800/60 w-full">
            {step === 1 ? (
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-2xl h-12 px-6 font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 w-full sm:w-auto"
                  onClick={onCancel}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  className={`${btnPrimary} rounded-2xl h-12 px-7 transition-all active:scale-95 font-bold gap-2 w-full sm:w-auto cursor-pointer flex items-center justify-center`}
                >
                  <span>Lanjut ke Tahap 2</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-2xl h-12 font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 px-6 w-full sm:w-auto flex items-center justify-center"
                  onClick={handleBack}
                  disabled={isPending}
                >
                  <ChevronLeft className="w-4 h-4 mr-1.5" />
                  Kembali
                </Button>
                
                <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl h-12 font-bold text-slate-700 border-slate-200 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-900 px-6 cursor-pointer w-full sm:w-auto"
                    onClick={(e) => handleFormSubmit(e, true)}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Lewati & Simpan"
                    )}
                  </Button>
                  
                  <Button
                    type="submit"
                    form="generus-wizard-form"
                    disabled={isPending}
                    className={`${btnPrimary} rounded-2xl h-12 px-8 transition-all active:scale-95 font-bold cursor-pointer w-full sm:w-auto`}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <div className="flex items-center gap-2 justify-center">
                        <Save className="w-4 h-4" />
                        <span>Simpan Semua</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}
