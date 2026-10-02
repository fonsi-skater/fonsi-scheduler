import type { ReactNode } from "react";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { format } from "date-fns";

import type { TaskInput } from "@/api/types";
import { palette, radius, spacing, typography } from "@/theme";
import { useAppColors } from "@/theme/useAppColors";
import { taskSchema, type TaskFormValues } from "@/features/tasks/schema";
import { PrimaryButton } from "./PrimaryButton";

interface TaskFormProps {
  initialValues?: Partial<TaskInput>;
  defaultReminderMinutes: number | null;
  onSubmit: (value: TaskInput) => void;
  submitting: boolean;
  submitLabel: string;
}

const categories = ["work", "personal", "health", "other"] as const;
const priorities = ["low", "medium", "high"] as const;

export function TaskForm({
  initialValues,
  defaultReminderMinutes,
  onSubmit,
  submitting,
  submitLabel
}: TaskFormProps) {
  const colors = useAppColors();
  const defaults = useMemo<TaskFormValues>(
    () => ({
      title: initialValues?.title ?? "",
      notes: initialValues?.notes ?? "",
      date: initialValues?.date ?? format(new Date(), "yyyy-MM-dd"),
      startTime: initialValues?.startTime ?? "09:00",
      endTime: initialValues?.endTime ?? "09:30",
      category: initialValues?.category ?? "work",
      priority: initialValues?.priority ?? "medium",
      reminderMinutes:
        initialValues && "reminderMinutes" in initialValues
          ? (initialValues.reminderMinutes ?? null)
          : defaultReminderMinutes
    }),
    [initialValues, defaultReminderMinutes]
  );
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: defaults
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="Task name" error={errors.title?.message}>
          <ControlledInput control={control} name="title" placeholder="What needs doing?" colors={colors} />
        </Field>
        <Field label="Notes" error={errors.notes?.message}>
          <ControlledInput
            control={control}
            name="notes"
            placeholder="Add a little detail (optional)"
            colors={colors}
            multiline
          />
        </Field>
        <Field label="Date" error={errors.date?.message}>
          <ControlledInput control={control} name="date" placeholder="YYYY-MM-DD" colors={colors} />
        </Field>
        <View style={styles.twoColumns}>
          <View style={styles.column}>
            <Field label="Starts" error={errors.startTime?.message}>
              <ControlledInput control={control} name="startTime" placeholder="09:00" colors={colors} />
            </Field>
          </View>
          <View style={styles.column}>
            <Field label="Ends" error={errors.endTime?.message}>
              <ControlledInput control={control} name="endTime" placeholder="09:30" colors={colors} />
            </Field>
          </View>
        </View>
        <Field label="Category">
          <Controller
            control={control}
            name="category"
            render={({ field: { value, onChange } }) => (
              <View style={styles.choices}>
                {categories.map((category) => (
                  <Choice
                    key={category}
                    label={capitalize(category)}
                    selected={value === category}
                    onPress={() => onChange(category)}
                  />
                ))}
              </View>
            )}
          />
        </Field>
        <Field label="Priority">
          <Controller
            control={control}
            name="priority"
            render={({ field: { value, onChange } }) => (
              <View style={styles.choices}>
                {priorities.map((priority) => (
                  <Choice
                    key={priority}
                    label={capitalize(priority)}
                    selected={value === priority}
                    onPress={() => onChange(priority)}
                  />
                ))}
              </View>
            )}
          />
        </Field>
        <Field label="Reminder">
          <Controller
            control={control}
            name="reminderMinutes"
            render={({ field: { value, onChange } }) => (
              <View style={styles.choices}>
                {[null, 5, 10, 30].map((minutes) => (
                  <Choice
                    key={minutes ?? "off"}
                    label={minutes === null ? "Off" : `${minutes} min`}
                    selected={value === minutes}
                    onPress={() => onChange(minutes)}
                  />
                ))}
              </View>
            )}
          />
        </Field>
        <PrimaryButton
          label={submitLabel}
          onPress={handleSubmit((value) => onSubmit(value))}
          loading={submitting}
        />
        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  const colors = useAppColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {children}
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function ControlledInput({
  control,
  name,
  placeholder,
  colors,
  multiline = false
}: {
  control: ReturnType<typeof useForm<TaskFormValues>>["control"];
  name: "title" | "notes" | "date" | "startTime" | "endTime";
  placeholder: string;
  colors: ReturnType<typeof useAppColors>;
  multiline?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur } }) => (
        <TextInput
          accessibilityLabel={placeholder}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedText}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          style={[
            styles.input,
            { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
            multiline && styles.notesInput
          ]}
        />
      )}
    />
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const colors = useAppColors();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.choice,
        {
          backgroundColor: selected ? palette.violetWash : colors.surface,
          borderColor: selected ? palette.violet : colors.border
        }
      ]}
    >
      <Text style={[styles.choiceText, { color: selected ? palette.violet : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  field: { marginBottom: spacing.lg },
  label: { marginBottom: spacing.xs, fontSize: typography.caption, fontWeight: "700" },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.body
  },
  notesInput: { minHeight: 90, paddingTop: spacing.md },
  error: { marginTop: spacing.xs, color: palette.roseInk, fontSize: typography.caption },
  twoColumns: { flexDirection: "row", gap: spacing.md },
  column: { flex: 1 },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  choice: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md
  },
  choiceText: { fontSize: typography.caption, fontWeight: "600" }
});
