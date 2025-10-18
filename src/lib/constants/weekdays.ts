export const WEEKDAYS = [
  { value: 'monday', label: 'Pazartesi' },
  { value: 'tuesday', label: 'Salı' },
  { value: 'wednesday', label: 'Çarşamba' },
  { value: 'thursday', label: 'Perşembe' },
  { value: 'friday', label: 'Cuma' },
  { value: 'saturday', label: 'Cumartesi' },
  { value: 'sunday', label: 'Pazar' },
] as const;

export const getWeekdayLabel = (day: string) => {
  return WEEKDAYS.find(weekday => weekday.value === day)?.label || day;
};

export const getCurrentWeekday = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};