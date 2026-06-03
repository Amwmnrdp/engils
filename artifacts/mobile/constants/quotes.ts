export const ARABIC_QUOTES = [
  "المال يحتاج عقل قبل الدخل.",
  "التوفير الصغير يصنع فرقاً كبيراً.",
  "اصرف بوعي، تعش براحة.",
  "الثروة تُبنى بقرارات صغيرة وصحيحة.",
  "الادخار عادة، والإفلاس عادة. اختر عادتك.",
  "كل ريال تدخره اليوم هو حرية تملكها غداً.",
  "الميزانية ليست قيداً، هي خطة للحرية.",
  "قيمة المال لا تُقاس بالكثرة بل بالإدارة.",
  "الحكيم يُنفق ما تبقى بعد الادخار.",
  "عقلية الثروة تبدأ من كيف تفكر في المال.",
  "لا تتمنَّ المال أكثر، بل أدر ما لديك أذكى.",
  "صغير مدخراتك لا يعني ضآلة مستقبلك.",
  "من ادّخر لأيام الشدة، عاش أيام الرخاء بهدوء.",
  "الإنفاق الذكي أهم من الدخل الكبير.",
  "كن سيد مالك قبل أن يكون مالك سيدك.",
];

export function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return ARABIC_QUOTES[dayOfYear % ARABIC_QUOTES.length];
}

export const CATEGORY_NAMES: Record<string, string> = {
  food: "طعام",
  shopping: "تسوق",
  gaming: "ألعاب",
  bills: "فواتير",
  travel: "سفر",
  education: "تعليم",
  health: "صحة",
  rent: "إيجار",
  installment: "قسط",
  subscription: "اشتراك",
  car: "مواصلات",
  utilities: "مرافق",
  gym: "رياضة",
  other: "أخرى",
};

export const CATEGORY_ICONS: Record<string, string> = {
  food: "coffee",
  shopping: "shopping-bag",
  gaming: "monitor",
  bills: "file-text",
  travel: "map-pin",
  education: "book",
  health: "heart",
  rent: "home",
  installment: "credit-card",
  subscription: "repeat",
  car: "navigation",
  utilities: "zap",
  gym: "activity",
  other: "more-horizontal",
};

export const CATEGORY_COLORS: Record<string, string> = {
  food: "#FF6B6B",
  shopping: "#4ECDC4",
  gaming: "#9B59B6",
  bills: "#F39C12",
  travel: "#3498DB",
  education: "#2ECC71",
  health: "#E91E63",
  rent: "#E74C3C",
  installment: "#8E44AD",
  subscription: "#1ABC9C",
  car: "#2980B9",
  utilities: "#F1C40F",
  gym: "#27AE60",
  other: "#95A5A6",
};

export const CURRENCIES = [
  { code: "SAR", name: "ريال سعودي", symbol: "ر.س" },
  { code: "AED", name: "درهم إماراتي", symbol: "د.إ" },
  { code: "KWD", name: "دينار كويتي", symbol: "د.ك" },
  { code: "QAR", name: "ريال قطري", symbol: "ر.ق" },
  { code: "BHD", name: "دينار بحريني", symbol: "د.ب" },
  { code: "OMR", name: "ريال عُماني", symbol: "ر.ع" },
  { code: "JOD", name: "دينار أردني", symbol: "د.أ" },
  { code: "EGP", name: "جنيه مصري", symbol: "ج.م" },
  { code: "USD", name: "دولار أمريكي", symbol: "$" },
];
