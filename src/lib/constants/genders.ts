export const GENDERS = [
  { value: 'male', label: 'Erkek' },
  { value: 'female', label: 'Kız' },
] as const;

export const getGenderLabel = (gender: string) => {
  return GENDERS.find(g => g.value === gender)?.label || gender;
};