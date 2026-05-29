import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_NAMES } from "@/constants/quotes";
import {
  ExpenseCategory,
  ImportanceLevel,
  useApp,
} from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES: ExpenseCategory[] = [
  "food",
  "shopping",
  "gaming",
  "bills",
  "travel",
  "education",
  "health",
  "other",
];

const IMPORTANCE_OPTIONS: {
  value: ImportanceLevel;
  label: string;
  color: string;
}[] = [
  { value: "normal", label: "عادي", color: "#10B981" },
  { value: "medium", label: "متوسط", color: "#FFB700" },
  { value: "high", label: "شديد", color: "#FF4B4B" },
];

export function AddExpenseModal({ visible, onClose }: AddExpenseModalProps) {
  const colors = useColors();
  const { addExpense } = useApp();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [importance, setImportance] = useState<ImportanceLevel>("normal");
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [notes, setNotes] = useState("");

  const getDefaultDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("خطأ", "يرجى إدخال اسم المصروف");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("خطأ", "يرجى إدخال مبلغ صحيح");
      return;
    }

    const finalDeadline =
      deadline.trim() ||
      getDefaultDeadline();

    await addExpense({
      name: name.trim(),
      amount: parsedAmount,
      deadline: finalDeadline,
      importance,
      category,
      notes: notes.trim(),
      paid: false,
    });

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setName("");
    setAmount("");
    setDeadline("");
    setImportance("normal");
    setCategory("other");
    setNotes("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
              <Text
                style={[styles.title, { color: colors.foreground }]}
              >
                إضافة مصروف
              </Text>
            </View>

            <ScrollView
              style={styles.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                اسم المصروف *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="مثال: إيجار الشقة"
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
                textAlign="right"
              />

              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                المبلغ *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="0.00"
                placeholderTextColor={colors.mutedForeground}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                textAlign="right"
              />

              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                موعد التسليم (YYYY-MM-DD)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="مثال: 2025-06-30"
                placeholderTextColor={colors.mutedForeground}
                value={deadline}
                onChangeText={setDeadline}
                textAlign="right"
              />

              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                مستوى الأهمية
              </Text>
              <View style={styles.row}>
                {IMPORTANCE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.importanceBtn,
                      {
                        backgroundColor:
                          importance === opt.value
                            ? opt.color + "33"
                            : colors.muted,
                        borderColor:
                          importance === opt.value
                            ? opt.color
                            : "transparent",
                      },
                    ]}
                    onPress={() => setImportance(opt.value)}
                  >
                    <Text
                      style={[
                        styles.importanceBtnText,
                        {
                          color:
                            importance === opt.value
                              ? opt.color
                              : colors.mutedForeground,
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                الفئة
              </Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const catColor = CATEGORY_COLORS[cat];
                  const catIcon = CATEGORY_ICONS[cat];
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catBtn,
                        {
                          backgroundColor: isSelected
                            ? catColor + "33"
                            : colors.muted,
                          borderColor: isSelected ? catColor : "transparent",
                        },
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Feather
                        name={catIcon as any}
                        size={18}
                        color={isSelected ? catColor : colors.mutedForeground}
                      />
                      <Text
                        style={[
                          styles.catBtnText,
                          {
                            color: isSelected
                              ? catColor
                              : colors.mutedForeground,
                          },
                        ]}
                      >
                        {CATEGORY_NAMES[cat]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                ملاحظات (اختياري)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textarea,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="أي ملاحظات إضافية..."
                placeholderTextColor={colors.mutedForeground}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                textAlign="right"
              />

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handleSubmit}
              >
                <Text
                  style={[
                    styles.submitText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  إضافة المصروف
                </Text>
              </TouchableOpacity>

              <View style={{ height: 32 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "right",
  },
  scroll: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
    textAlign: "right",
    fontFamily: "Inter_500Medium",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
    fontFamily: "Inter_400Regular",
  },
  textarea: {
    height: 80,
    paddingTop: 12,
  },
  row: {
    flexDirection: "row-reverse",
    gap: 8,
    marginBottom: 16,
  },
  importanceBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  importanceBtnText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  categoryGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  catBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    width: "46%",
  },
  catBtnText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  submitBtn: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  submitText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
});
