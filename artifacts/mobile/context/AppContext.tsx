import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { CATEGORY_NAMES } from "@/constants/quotes";
import {
  cancelExpenseNotifications,
  rescheduleAllExpenses,
  scheduleExpenseNotifications,
} from "@/utils/notifications";

export type ImportanceLevel = "normal" | "medium" | "high";
export type ExpenseCategory =
  | "food"
  | "shopping"
  | "gaming"
  | "bills"
  | "travel"
  | "education"
  | "health"
  | "rent"
  | "installment"
  | "subscription"
  | "car"
  | "utilities"
  | "gym"
  | "other";

export interface Expense {
  id: string;
  name: string;
  amount: number;
  deadline: string;
  importance: ImportanceLevel;
  category: ExpenseCategory;
  notes: string;
  paid: boolean;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  color: string;
  createdAt: string;
}

export interface AppSettings {
  currency: string;
  emergencyMode: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  onboardingCompleted: boolean;
}

export interface AIInsight {
  id: string;
  type: "info" | "warning" | "success" | "tip";
  message: string;
  icon: string;
}

interface AppContextType {
  income: number;
  setIncome: (amount: number) => Promise<void>;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  markExpensePaid: (id: string) => Promise<void>;
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, "id" | "createdAt">) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoalSavings: (id: string, amount: number) => Promise<void>;
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  clearAllData: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  restartOnboarding: () => Promise<void>;
  aiInsights: AIInsight[];
  financialScore: number;
  totalSpent: number;
  remainingBalance: number;
  spentPercent: number;
  nextMonthTotal: number;
  nextMonthBalance: number;
  isLoaded: boolean;
}

const defaultSettings: AppSettings = {
  currency: "SAR",
  emergencyMode: false,
  soundEnabled: true,
  notificationsEnabled: true,
  onboardingCompleted: false,
};

const AppContext = createContext<AppContextType | null>(null);

function getMonthGroup(deadline: string) {
  const d = new Date(deadline);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [income, setIncomeState] = useState(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [inc, exp, gls, set] = await Promise.all([
          AsyncStorage.getItem("income"),
          AsyncStorage.getItem("expenses"),
          AsyncStorage.getItem("goals"),
          AsyncStorage.getItem("settings"),
        ]);
        if (inc) setIncomeState(parseFloat(inc) || 0);
        if (gls) setGoals(JSON.parse(gls));
        if (set) setSettings({ ...defaultSettings, ...JSON.parse(set) });
        if (exp) {
          const parsed: Expense[] = JSON.parse(exp);
          setExpenses(parsed);
          rescheduleAllExpenses(parsed).catch(() => {});
        }
      } catch (_) {
      } finally {
        setIsLoaded(true);
      }
    }
    load();
  }, []);

  const setIncome = useCallback(async (amount: number) => {
    setIncomeState(amount);
    await AsyncStorage.setItem("income", amount.toString());
  }, []);

  const addExpense = useCallback(
    async (expense: Omit<Expense, "id" | "createdAt">) => {
      const newExpense: Expense = {
        ...expense,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setExpenses((prev) => {
        const updated = [newExpense, ...prev];
        AsyncStorage.setItem("expenses", JSON.stringify(updated)).catch(() => {});
        return updated;
      });
      scheduleExpenseNotifications(newExpense).catch(() => {});
    },
    []
  );

  const deleteExpense = useCallback(async (id: string) => {
    cancelExpenseNotifications(id).catch(() => {});
    setExpenses((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      AsyncStorage.setItem("expenses", JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const markExpensePaid = useCallback(async (id: string) => {
    cancelExpenseNotifications(id).catch(() => {});
    setExpenses((prev) => {
      const updated = prev.map((e) =>
        e.id === id ? { ...e, paid: true } : e
      );
      AsyncStorage.setItem("expenses", JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const addGoal = useCallback(
    async (goal: Omit<SavingsGoal, "id" | "createdAt">) => {
      const newGoal: SavingsGoal = {
        ...goal,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setGoals((prev) => {
        const updated = [newGoal, ...prev];
        AsyncStorage.setItem("goals", JSON.stringify(updated)).catch(() => {});
        return updated;
      });
    },
    []
  );

  const deleteGoal = useCallback(async (id: string) => {
    setGoals((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      AsyncStorage.setItem("goals", JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const updateGoalSavings = useCallback(
    async (id: string, amount: number) => {
      setGoals((prev) => {
        const updated = prev.map((g) =>
          g.id === id
            ? { ...g, savedAmount: Math.min(g.targetAmount, g.savedAmount + amount) }
            : g
        );
        AsyncStorage.setItem("goals", JSON.stringify(updated)).catch(() => {});
        return updated;
      });
    },
    []
  );

  const updateSettings = useCallback(
    async (newSettings: Partial<AppSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        AsyncStorage.setItem("settings", JSON.stringify(updated)).catch(() => {});
        return updated;
      });
    },
    []
  );

  const clearAllData = useCallback(async () => {
    await AsyncStorage.multiRemove(["income", "expenses", "goals", "settings"]);
    setIncomeState(0);
    setExpenses([]);
    setGoals([]);
    setSettings(defaultSettings);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await updateSettings({ onboardingCompleted: true });
  }, [updateSettings]);

  const restartOnboarding = useCallback(async () => {
    await updateSettings({ onboardingCompleted: false });
  }, [updateSettings]);

  // ── Month-smart calculations ──────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const curMonth = today.getMonth();
  const curYear = today.getFullYear();
  const nxtMonth = curMonth === 11 ? 0 : curMonth + 1;
  const nxtMonthYear = curMonth === 11 ? curYear + 1 : curYear;

  const unpaidExpenses = expenses.filter((e) => !e.paid);

  // This month = unpaid expenses due this month OR overdue (still unpaid from past months)
  const thisMonthUnpaid = unpaidExpenses.filter((e) => {
    const { year, month } = getMonthGroup(e.deadline);
    return year < curYear || (year === curYear && month <= curMonth);
  });

  // Next month = unpaid expenses due specifically next month
  const nextMonthUnpaid = unpaidExpenses.filter((e) => {
    const { year, month } = getMonthGroup(e.deadline);
    return year === nxtMonthYear && month === nxtMonth;
  });

  const paidExpenses = expenses.filter((e) => e.paid);
  const totalSpent = thisMonthUnpaid.reduce((s, e) => s + e.amount, 0);
  const nextMonthTotal = nextMonthUnpaid.reduce((s, e) => s + e.amount, 0);
  const remainingBalance = income - totalSpent;
  const nextMonthBalance = income - nextMonthTotal;
  const spentPercent = income > 0 ? Math.min((totalSpent / income) * 100, 100) : 0;

  const financialScore = (() => {
    if (income <= 0) return 50;
    let score = 100;
    const ratio = totalSpent / income;
    if (ratio > 0.9) score -= 40;
    else if (ratio > 0.7) score -= 25;
    else if (ratio > 0.5) score -= 10;
    const highCount = thisMonthUnpaid.filter((e) => e.importance === "high").length;
    score -= highCount * 5;
    if (settings.emergencyMode) score -= 5;
    return Math.max(0, Math.min(100, Math.round(score)));
  })();

  const aiInsights: AIInsight[] = (() => {
    if (income <= 0) return [];
    const insights: AIInsight[] = [];
    const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
    const daysPassed = today.getDate();

    // Month budget status
    if (totalSpent > income) {
      insights.push({
        id: "over",
        type: "warning",
        message: `تجاوزت ميزانية هذا الشهر! المصاريف ${totalSpent.toLocaleString("ar-SA")} ${settings.currency} من أصل ${income.toLocaleString("ar-SA")} ${settings.currency}.`,
        icon: "alert-triangle",
      });
    } else if (daysPassed >= 5) {
      const thisMonthCreated = thisMonthUnpaid.filter((e) => {
        const created = new Date(e.createdAt);
        return (
          created.getMonth() === curMonth &&
          created.getFullYear() === curYear
        );
      });
      const spentThisMonth = thisMonthCreated.reduce((s, e) => s + e.amount, 0);
      const dailyRate = spentThisMonth / daysPassed;
      const projectedSpend = dailyRate * daysInMonth;
      const projectedRemaining = income - projectedSpend;
      if (projectedRemaining < 0) {
        insights.push({
          id: "proj",
          type: "warning",
          message: `بمعدل إنفاقك الحالي قد تتجاوز ميزانيتك بـ ${Math.abs(Math.round(projectedRemaining)).toLocaleString("ar-SA")} ${settings.currency} نهاية الشهر.`,
          icon: "alert-triangle",
        });
      } else if (spentThisMonth > 0) {
        insights.push({
          id: "proj",
          type: "info",
          message: `بمعدل إنفاقك الحالي سيتبقى معك نحو ${Math.round(projectedRemaining).toLocaleString("ar-SA")} ${settings.currency} نهاية الشهر.`,
          icon: "trending-up",
        });
      }
    } else if (spentPercent > 0) {
      insights.push({
        id: "pct",
        type: spentPercent > 70 ? "warning" : "info",
        message: `صرفت حتى الآن ${Math.round(spentPercent)}٪ من دخلك الشهري.`,
        icon: "percent",
      });
    }

    // Next month alert
    if (nextMonthTotal > 0) {
      const nxtPct = income > 0 ? Math.round((nextMonthTotal / income) * 100) : 0;
      insights.push({
        id: "next",
        type: nextMonthBalance < 0 ? "warning" : "tip",
        message:
          nextMonthBalance < 0
            ? `مصاريف الشهر القادم ${nextMonthTotal.toLocaleString("ar-SA")} ${settings.currency} تتجاوز دخلك — خطط مبكراً!`
            : `مصاريف الشهر القادم ${nxtPct}٪ من دخلك، سيتبقى ${nextMonthBalance.toLocaleString("ar-SA")} ${settings.currency}.`,
        icon: "calendar",
      });
    }

    // Top category
    const categoryTotals: Record<string, number> = {};
    thisMonthUnpaid.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const sorted = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
    if (sorted.length > 0) {
      const [topCat, topAmt] = sorted[0];
      const pct = Math.round((topAmt / income) * 100);
      insights.push({
        id: "cat",
        type: pct > 35 ? "warning" : "tip",
        message: `مصاريف ${CATEGORY_NAMES[topCat] || topCat} تمثل ${pct}٪ من دخلك الشهري.`,
        icon: "pie-chart",
      });
    }

    // Urgent (within 5 days)
    const urgentCount = thisMonthUnpaid.filter((e) => {
      const dl = new Date(e.deadline);
      const daysLeft = Math.ceil((dl.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysLeft >= 0 && daysLeft <= 5;
    }).length;

    if (urgentCount > 0) {
      insights.push({
        id: "urgent",
        type: "warning",
        message: `لديك ${urgentCount} مصروف يستحق خلال 5 أيام — لا تنسَ السداد!`,
        icon: "clock",
      });
    }

    if (financialScore >= 80) {
      insights.push({
        id: "score",
        type: "success",
        message: "رائع! إدارتك المالية ممتازة هذا الشهر، واصل!",
        icon: "star",
      });
    }

    return insights;
  })();

  return (
    <AppContext.Provider
      value={{
        income,
        setIncome,
        expenses,
        addExpense,
        deleteExpense,
        markExpensePaid,
        goals,
        addGoal,
        deleteGoal,
        updateGoalSavings,
        settings,
        updateSettings,
        clearAllData,
        completeOnboarding,
        restartOnboarding,
        aiInsights,
        financialScore,
        totalSpent,
        remainingBalance,
        spentPercent,
        nextMonthTotal,
        nextMonthBalance,
        isLoaded,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
