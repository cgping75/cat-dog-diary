import { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getQuizSet, QuizQuestion } from '@/lib/quizData';
import { colors, borderRadius, spacing } from '@/lib/theme';

export default function QuizScreen() {
  const questions = useMemo(() => getQuizSet(), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const current = questions[currentIndex];
  const total = questions.length;

  const handleSelect = useCallback((index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    const correct = index === current.answer;
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      if (currentIndex + 1 >= total) {
        const finalScore = correct ? score + 1 : score;
        const passed = finalScore >= Math.ceil(total * 0.8);
        router.replace({
          pathname: '/quiz-result',
          params: { score: String(finalScore), total: String(total), passed: passed ? '1' : '0' },
        });
      } else {
        setCurrentIndex((i) => i + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      }
    }, 1200);
  }, [isAnswered, current, currentIndex, total, score]);

  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>第 {currentIndex + 1} / {total} 题</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.questionArea}>
        <Text style={styles.questionText}>{current.question}</Text>
      </View>

      <View style={styles.optionsArea}>
        {current.options.map((option, index) => {
          let optionStyle: ViewStyle | ViewStyle[] = styles.option;
          let textStyle: TextStyle | TextStyle[] = styles.optionText;
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap | null = null;

          if (isAnswered) {
            if (index === current.answer) {
              optionStyle = [styles.option, styles.optionCorrect];
              textStyle = [styles.optionText, styles.optionTextCorrect];
              iconName = 'check-circle';
            } else if (index === selectedAnswer && index !== current.answer) {
              optionStyle = [styles.option, styles.optionWrong];
              textStyle = [styles.optionText, styles.optionTextWrong];
              iconName = 'close-circle';
            }
          }

          const labels = ['A', 'B', 'C', 'D'];

          return (
            <TouchableOpacity
              key={index}
              style={optionStyle}
              onPress={() => handleSelect(index)}
              activeOpacity={0.7}
              disabled={isAnswered}
            >
              <Text style={styles.optionLabel}>{labels[index]}</Text>
              <Text style={[textStyle, { flex: 1 }]}>{option}</Text>
              {iconName && <MaterialCommunityIcons name={iconName} size={22} color={index === current.answer ? colors.success : colors.error} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {isAnswered && (
        <View style={styles.explanationArea}>
          <Text style={styles.explanationText}>{current.explanation}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  progressHeader: { marginBottom: spacing.xl },
  progressText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.sm },
  progressBar: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  questionArea: { marginBottom: spacing.xl },
  questionText: { fontSize: 20, fontWeight: '700', color: colors.text, lineHeight: 30 },
  optionsArea: { gap: spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionCorrect: { borderColor: colors.success, backgroundColor: '#E8F5E9' },
  optionWrong: { borderColor: colors.error, backgroundColor: '#FFEBEE' },
  optionLabel: { fontSize: 16, fontWeight: '800', color: colors.primary, width: 28 },
  optionText: { fontSize: 15, color: colors.text, lineHeight: 22 },
  optionTextCorrect: { color: colors.success },
  optionTextWrong: { color: colors.error },
  explanationArea: { marginTop: spacing.lg, padding: spacing.md, backgroundColor: colors.secondaryLight, borderRadius: borderRadius.md },
  explanationText: { fontSize: 14, color: colors.text, lineHeight: 22 },
});
