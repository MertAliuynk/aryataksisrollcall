'use client';

import { useState } from 'react';
import { api } from '../../../utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { 
  BookOpen, 
  Calendar, 
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Settings,
  Target,
  Trophy,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Pazartesi', short: 'Pzt' },
  { key: 'tuesday', label: 'Salı', short: 'Sal' },
  { key: 'wednesday', label: 'Çarşamba', short: 'Çar' },
  { key: 'thursday', label: 'Perşembe', short: 'Per' },
  { key: 'friday', label: 'Cuma', short: 'Cum' },
  { key: 'saturday', label: 'Cumartesi', short: 'Cmt' },
  { key: 'sunday', label: 'Pazar', short: 'Paz' }
];

const COURSE_LEVELS = [
  { 
    key: 'temel', 
    label: 'Temel', 
    description: 'Başlangıç seviyesi, temel becerilerin öğretildiği seviye',
    icon: Settings,
    color: 'blue'
  },
  { 
    key: 'teknik', 
    label: 'Teknik', 
    description: 'Orta seviye, teknik becerilerin geliştirildiği seviye',
    icon: Target,
    color: 'purple'
  },
  { 
    key: 'performans', 
    label: 'Performans', 
    description: 'İleri seviye, performans odaklı antrenman seviyesi',
    icon: Trophy,
    color: 'green'
  }
];

type CourseLevel = {
  level: 'temel' | 'teknik' | 'performans';
  attendanceDays: string[];
};

export default function CreateCoursePage() {
  const router = useRouter();
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<CourseLevel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Kurs oluşturma mutation
  const createCourse = api.course.create.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setCourseName('');
        setCourseDescription('');
        setSelectedLevels([]);
      }, 3000);
    },
    onError: (error) => {
      console.error('Kurs oluşturma hatası:', error);
      alert('Kurs oluşturulurken bir hata oluştu!');
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const addLevel = (levelKey: 'temel' | 'teknik' | 'performans') => {
    if (!selectedLevels.find(l => l.level === levelKey)) {
      setSelectedLevels(prev => [...prev, { level: levelKey, attendanceDays: [] }]);
    }
  };

  const removeLevel = (levelKey: 'temel' | 'teknik' | 'performans') => {
    setSelectedLevels(prev => prev.filter(l => l.level !== levelKey));
  };

  const updateLevelDays = (levelKey: 'temel' | 'teknik' | 'performans', days: string[]) => {
    setSelectedLevels(prev => 
      prev.map(l => l.level === levelKey ? { ...l, attendanceDays: days } : l)
    );
  };

  const handleDayToggle = (levelKey: 'temel' | 'teknik' | 'performans', dayKey: string) => {
    const level = selectedLevels.find(l => l.level === levelKey);
    if (!level) return;

    const newDays = level.attendanceDays.includes(dayKey) 
      ? level.attendanceDays.filter(day => day !== dayKey)
      : [...level.attendanceDays, dayKey];
    
    updateLevelDays(levelKey, newDays);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseName.trim()) {
      alert('Kurs adı boş olamaz!');
      return;
    }

    if (selectedLevels.length === 0) {
      alert('En az bir seviye eklemelisiniz!');
      return;
    }

    const hasEmptyDays = selectedLevels.some(level => level.attendanceDays.length === 0);
    if (hasEmptyDays) {
      alert('Her seviye için en az bir yoklama günü seçmelisiniz!');
      return;
    }

    setIsSubmitting(true);
    createCourse.mutate({
      name: courseName.trim(),
      description: courseDescription.trim() || undefined,
      levels: selectedLevels
    });
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Kurs Oluşturuldu!</h2>
            <p className="text-green-600 mb-4">
              "{courseName}" kursu başarıyla oluşturuldu.
            </p>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Oluşturulan Seviyeler:</p>
              {selectedLevels.map(level => {
                const levelInfo = COURSE_LEVELS.find(l => l.key === level.level);
                return (
                  <div key={level.level} className="mb-2 p-2 bg-gray-50 rounded">
                    <span className="font-medium">{levelInfo?.label}:</span> {' '}
                    {level.attendanceDays.map(day => 
                      DAYS_OF_WEEK.find(d => d.key === day)?.short
                    ).join(', ')}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Yeni Kurs Oluştur</h1>
                <p className="text-blue-100">Kurs bilgilerini girin ve yoklama günlerini seçin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Kurs Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Kurs Adı *
                </label>
                <Input
                  type="text"
                  placeholder="Örnek: Yüzme Kursu, Futbol Antrenmanı, Tenis Dersleri"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Kursa açıklayıcı bir isim verin
                </p>
              </div>

              {/* Course Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Kurs Açıklaması
                </label>
                <Textarea
                  placeholder="Kurs hakkında kısa bir açıklama yazın (isteğe bağlı)"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full min-h-[80px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bu alan isteğe bağlıdır
                </p>
              </div>

              {/* Course Levels */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Kurs Seviyeleri *
                </label>
                
                {/* Available Levels to Add */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {COURSE_LEVELS.map((levelType) => {
                    const isAdded = selectedLevels.some(l => l.level === levelType.key);
                    const Icon = levelType.icon;
                    
                    return (
                      <button
                        key={levelType.key}
                        type="button"
                        onClick={() => addLevel(levelType.key as 'temel' | 'teknik' | 'performans')}
                        disabled={isAdded}
                        className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                          isAdded
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : `bg-${levelType.color}-50 border-${levelType.color}-200 text-${levelType.color}-700 hover:border-${levelType.color}-300 hover:bg-${levelType.color}-100 cursor-pointer`
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-6 w-6" />
                          <div>
                            <div className="font-bold text-sm">{levelType.label}</div>
                            <div className="text-xs opacity-75">{levelType.description}</div>
                          </div>
                        </div>
                        {isAdded && (
                          <div className="text-xs font-medium text-gray-500 mt-2">✓ Eklendi</div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Levels Configuration */}
                {selectedLevels.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-700">
                      Seçili Seviyeler ({selectedLevels.length}):
                    </p>
                    
                    {selectedLevels.map((level) => {
                      const levelInfo = COURSE_LEVELS.find(l => l.key === level.level);
                      const Icon = levelInfo?.icon || Settings;
                      
                      return (
                        <Card key={level.level} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Icon className={`h-5 w-5 text-${levelInfo?.color}-600`} />
                                <span className="font-medium">{levelInfo?.label}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLevel(level.level)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-600">
                                {levelInfo?.label} için yoklama günleri *
                              </label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {DAYS_OF_WEEK.map((day) => {
                                  const isSelected = level.attendanceDays.includes(day.key);
                                  return (
                                    <button
                                      key={day.key}
                                      type="button"
                                      onClick={() => handleDayToggle(level.level, day.key)}
                                      className={`p-2 rounded border text-xs font-medium transition-all duration-200 ${
                                        isSelected
                                          ? `bg-${levelInfo?.color}-600 border-${levelInfo?.color}-600 text-white`
                                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                                      }`}
                                    >
                                      <div className="text-center">
                                        <div className="font-bold">{day.short}</div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                              
                              {level.attendanceDays.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {level.attendanceDays.map(dayKey => {
                                    const day = DAYS_OF_WEEK.find(d => d.key === dayKey);
                                    return (
                                      <span
                                        key={dayKey}
                                        className={`bg-${levelInfo?.color}-100 text-${levelInfo?.color}-700 px-2 py-1 rounded text-xs`}
                                      >
                                        {day?.label}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Her kurs için en az bir seviye eklemelisiniz. Her seviye için ayrı yoklama günleri belirleyebilirsiniz.
                </p>
              </div>

              {/* Validation Warnings */}
              {courseName.trim() && selectedLevels.length === 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Lütfen en az bir seviye ekleyin
                    </span>
                  </div>
                </div>
              )}

              {selectedLevels.some(level => level.attendanceDays.length === 0) && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Her seviye için en az bir yoklama günü seçin
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 border-t">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || 
                    !courseName.trim() || 
                    selectedLevels.length === 0 ||
                    selectedLevels.some(level => level.attendanceDays.length === 0)
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Kursu Oluştur
                    </>
                  )}
                </Button>
              </div>

              {/* Help Text */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">💡 Yeni Sistem Hakkında:</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• <strong>Temel:</strong> Başlangıç seviyesi öğrenciler için</li>
                  <li>• <strong>Teknik:</strong> Orta seviye, teknik beceri geliştirme</li>
                  <li>• <strong>Performans:</strong> İleri seviye, yarışma hazırlığı</li>
                  <li>• Her seviye için farklı yoklama günleri belirleyebilirsiniz</li>
                  <li>• Öğrenciler belirli seviyelere kaydolur</li>
                </ul>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}