'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../../../utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Badge } from '../../../../../components/ui/badge';
import {
  ArrowLeft,
  BookOpen,
  Save,
  AlertCircle,
  Check,
  Plus,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Pazartesi' },
  { key: 'tuesday', label: 'Salı' },
  { key: 'wednesday', label: 'Çarşamba' },
  { key: 'thursday', label: 'Perşembe' },
  { key: 'friday', label: 'Cuma' },
  { key: 'saturday', label: 'Cumartesi' },
  { key: 'sunday', label: 'Pazar' }
];

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [formData, setFormData] = useState({
    name: '',
    // levels: array of { id?, level, attendanceDays }
    levels: [] as { id?: string; level: 'temel' | 'teknik' | 'performans'; attendanceDays: string[] }[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kurs detaylarını çek
  const { data: course, isLoading } = api.course.getById.useQuery(courseId);
  
  // Kurs güncelleme mutation'ı
  const updateCourseMutation = api.course.update.useMutation({
    onSuccess: () => {
      router.push('/staff/courses');
    },
    onError: (error: any) => {
      console.error('Kurs güncellenirken hata:', error);
      alert('Kurs güncellenirken bir hata oluştu!');
    }
  });

  // Kurs bilgileri yüklendiğinde form'u doldur
  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        levels: (course.courseLevels || []).map((lvl: any) => ({
          id: lvl.id,
          level: lvl.level as 'temel' | 'teknik' | 'performans',
          attendanceDays: Array.isArray(lvl.attendanceDays) ? lvl.attendanceDays : (typeof lvl.attendanceDays === 'string' && lvl.attendanceDays.length ? lvl.attendanceDays.split(',') : []),
        })),
      });
    }
  }, [course]);

  const handleLevelDayToggle = (levelIndex: number, dayKey: string) => {
    setFormData(prev => {
      const nextLevels = prev.levels.map((l, i) => {
        if (i !== levelIndex) return l;
        const has = Array.isArray(l.attendanceDays) && l.attendanceDays.includes(dayKey);
        return {
          ...l,
          attendanceDays: has ? l.attendanceDays.filter(d => d !== dayKey) : [...(l.attendanceDays || []), dayKey]
        };
      });
      return { ...prev, levels: nextLevels };
    });
  };

  const addLevel = () => {
    setFormData(prev => ({
      ...prev,
      levels: [...prev.levels, { level: 'temel', attendanceDays: [] }]
    }));
  };

  const removeLevel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.filter((_, i) => i !== index)
    }));
  };

  const setLevelValue = (index: number, value: 'temel' | 'teknik' | 'performans') => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.map((l, i) => i === index ? { ...l, level: value } : l)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Kurs adı boş olamaz!');
      return;
    }

    // removed legacy check for formData.attendanceDays (now levels[] holds attendanceDays)

    setIsSubmitting(true);
    
    try {
      if (!course) {
        alert('Kurs bilgisi bulunamadı!');
        setIsSubmitting(false);
        return;
      }

      if (!formData.levels || formData.levels.length === 0) {
        alert('En az bir seviye eklemelisiniz!');
        setIsSubmitting(false);
        return;
      }

      // basic validation: each level must have at least one attendance day
      for (const lvl of formData.levels) {
        if (!lvl.attendanceDays || lvl.attendanceDays.length === 0) {
          alert('Her seviye için en az bir ders günü seçmelisiniz!');
          setIsSubmitting(false);
          return;
        }
      }

      await updateCourseMutation.mutateAsync({
        id: courseId,
        name: formData.name.trim(),
        levels: formData.levels.map(l => ({
          level: l.level,
          attendanceDays: l.attendanceDays,
        }))
      });
    } catch (error) {
      console.error('Güncelleme hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4 w-48"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kurs Bulunamadı</h2>
            <p className="text-gray-600">Bu kurs mevcut değil veya silinmiş olabilir.</p>
            <Button onClick={() => router.back()} className="mt-4">
              Geri Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
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
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kurs Düzenle</h1>
              <p className="text-gray-600">{course.name} kursunu düzenleyin</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Kurs Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Kurs Adı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kurs Adı *
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: Yüzme Kursu"
                  className="w-full"
                />
              </div>

              {/* Levels editor */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Seviyeler</label>
                  <Button size="sm" variant="ghost" onClick={addLevel}>
                    <Plus className="h-4 w-4 mr-1" /> Yeni Seviye Ekle
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.levels.map((lvl, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium">Seviye:</label>
                          <select
                            value={lvl.level}
                            onChange={(e) => setLevelValue(idx, e.target.value as any)}
                            className="border px-2 py-1 rounded"
                          >
                            <option value="temel">Temel</option>
                            <option value="teknik">Teknik</option>
                            <option value="performans">Performans</option>
                          </select>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => removeLevel(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <div
                            key={day.key}
                            onClick={() => handleLevelDayToggle(idx, day.key)}
                            className={`
                              relative p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center
                              ${lvl.attendanceDays.includes(day.key)
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }
                            `}
                          >
                            <div className="font-medium">{day.label}</div>
                            {lvl.attendanceDays.includes(day.key) && (
                              <Check className="h-4 w-4 text-blue-600 mx-auto mt-1" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* summary badges */}
                      {lvl.attendanceDays.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {lvl.attendanceDays.map((dayKey) => {
                            const day = DAYS_OF_WEEK.find(d => d.key === dayKey);
                            return (
                              <Badge key={dayKey} variant="outline" className="bg-blue-50 text-blue-700">
                                {day?.label}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Güncelleniyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}