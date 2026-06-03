import * as Notifications from "expo-notifications";

import type { Expense } from "@/context/AppContext";

const DAYS_BEFORE = [5, 4, 3, 2, 1, 0];

const DAY_MESSAGES: Record<number, string> = {
  5: "متبقي 5 أيام على موعد السداد",
  4: "متبقي 4 أيام على موعد السداد",
  3: "متبقي 3 أيام على موعد السداد",
  2: "متبقي يومان على موعد السداد ⚠️",
  1: "غداً آخر موعد للسداد! ⏰",
  0: "اليوم آخر يوم للسداد — لا تنسَ! 🚨",
};

export async function cancelExpenseNotifications(expenseId: string) {
  for (const day of DAYS_BEFORE) {
    try {
      await Notifications.cancelScheduledNotificationAsync(
        `exp_${expenseId}_d${day}`
      );
    } catch {}
  }
}

export async function scheduleExpenseNotifications(expense: Expense) {
  if (expense.paid) return;
  await cancelExpenseNotifications(expense.id);

  const deadline = new Date(expense.deadline);
  const now = new Date();

  for (const days of DAYS_BEFORE) {
    const triggerDate = new Date(deadline);
    triggerDate.setHours(9, 0, 0, 0);
    triggerDate.setDate(triggerDate.getDate() - days);
    if (triggerDate <= now) continue;

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: `exp_${expense.id}_d${days}`,
        content: {
          title: `💰 ${expense.name}`,
          body: DAY_MESSAGES[days],
          sound: true,
        },
        trigger: { date: triggerDate } as any,
      });
    } catch {}
  }
}

export async function rescheduleAllExpenses(expenses: Expense[]) {
  for (const expense of expenses) {
    if (expense.paid) {
      await cancelExpenseNotifications(expense.id);
    } else {
      await scheduleExpenseNotifications(expense);
    }
  }
}
