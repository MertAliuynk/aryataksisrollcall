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
  Check
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
    attendanceDays: [] as string[]
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
        attendanceDays: course.courseLevels?.[0]?.attendanceDays?.split(',') || []
      });
    }
  }, [course]);

  const handleDayToggle = (dayKey: string) => {
    setFormData(prev => ({
      ...prev,
      attendanceDays: prev.attendanceDays.includes(dayKey)
        ? prev.attendanceDays.filter(day => day !== dayKey)
        : [...prev.attendanceDays, dayKey]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Kurs adı boş olamaz!');
      return;
    }

    if (formData.attendanceDays.length === 0) {
      alert('En az bir ders günü seçmelisiniz!');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (!course || !course.courseLevels || !course.courseLevels[0]) {
        alert('Kurs seviyesi bulunamadı!');
        setIsSubmitting(false);
        return;
      }
      await updateCourseMutation.mutateAsync({
        id: courseId,
        name: formData.name.trim(),
        levels: [{
          level: course.courseLevels[0].level as "temel" | "teknik" | "performans",
          attendanceDays: formData.attendanceDays
        }]
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

              {/* Ders Günleri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Ders Günleri *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DAYS_OF_WEEK.map((day) => (
                    <div
                      key={day.key}
                      onClick={() => handleDayToggle(day.key)}
                      className={`
                        relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                        ${formData.attendanceDays.includes(day.key)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="text-center">
                        <div className="font-medium">{day.label}</div>
                        {formData.attendanceDays.includes(day.key) && (
                          <Check className="h-4 w-4 text-blue-600 mx-auto mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  En az bir gün seçmelisiniz
                </p>
              </div>

              {/* Seçili Günler Özeti */}
              {formData.attendanceDays.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seçili Günler
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.attendanceDays.map((dayKey) => {
                      const day = DAYS_OF_WEEK.find(d => d.key === dayKey);
                      return (
                        <Badge key={dayKey} variant="outline" className="bg-blue-50 text-blue-700">
                          {day?.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

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