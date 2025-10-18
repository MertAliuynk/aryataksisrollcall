'use client';

import { useState } from 'react';
import { api } from '../../../utils/trpc';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { Badge } from '../../../components/ui/badge';
import { Plus, Settings, Save, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { WEEKDAYS } from '../../../lib/constants/weekdays';

export default function ManagementPage() {
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    name: '',
    attendanceDays: [] as string[],
  });

  const { data: courses, refetch } = api.course.getAll.useQuery();
  const createCourse = api.course.create.useMutation({
    onSuccess: () => {
      toast.success('Kurs başarıyla eklendi!');
      setNewCourse({ name: '', attendanceDays: [] });
      setIsAddingCourse(false);
      refetch();
    },
    onError: (error) => {
      toast.error('Hata: ' + error.message);
    },
  });

  const deleteCourse = api.course.delete.useMutation({
    onSuccess: () => {
      toast.success('Kurs başarıyla silindi!');
      refetch();
    },
    onError: (error) => {
      toast.error('Hata: ' + error.message);
    },
  });

  const handleAddCourse = () => {
    if (!newCourse.name.trim()) {
      toast.error('Kurs adı gereklidir');
      return;
    }
    
    if (newCourse.attendanceDays.length === 0) {
      toast.error('En az bir yoklama günü seçilmelidir');
      return;
    }

    createCourse.mutate(newCourse);
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      setNewCourse(prev => ({
        ...prev,
        attendanceDays: [...prev.attendanceDays, day]
      }));
    } else {
      setNewCourse(prev => ({
        ...prev,
        attendanceDays: prev.attendanceDays.filter(d => d !== day)
      }));
    }
  };

  const handleDeleteCourse = (courseId: string, courseName: string) => {
    if (window.confirm(`"${courseName}" kursunu silmek istediğinizden emin misiniz?`)) {
      deleteCourse.mutate({ id: courseId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kurs Yönetimi</h1>
          <p className="text-gray-600">
            Kursları yönetin ve yoklama günlerini belirleyin
          </p>
        </div>
        {!isAddingCourse && (
          <Button onClick={() => setIsAddingCourse(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kurs
          </Button>
        )}
      </div>

      {/* Yeni Kurs Ekleme Formu */}
      {isAddingCourse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Yeni Kurs Ekle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Kurs Adı */}
              <div>
                <Label htmlFor="courseName">Kurs Adı *</Label>
                <Input
                  id="courseName"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: Futbol, Basketbol, Yüzme"
                  className="mt-1"
                />
              </div>

              {/* Yoklama Günleri */}
              <div>
                <Label>Yoklama Günleri *</Label>
                <p className="text-sm text-gray-600 mb-3">
                  Bu kursta hangi günlerde yoklama alınacağını seçin
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {WEEKDAYS.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.value}
                        checked={newCourse.attendanceDays.includes(day.value)}
                        onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
                      />
                      <Label
                        htmlFor={day.value}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={handleAddCourse}
                  disabled={createCourse.isLoading}
                  className="flex-1 sm:flex-none"
                >
                  {createCourse.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Kursu Kaydet
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingCourse(false);
                    setNewCourse({ name: '', attendanceDays: [] });
                  }}
                  className="w-full sm:w-auto"
                >
                  İptal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mevcut Kurslar */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Mevcut Kurslar</h2>
        
        {courses && courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {course.studentCount} öğrenci kayıtlı
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCourse(course.id, course.name)}
                        disabled={deleteCourse.isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Yoklama Günleri:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {course.attendanceDays.map((day) => {
                        const dayInfo = WEEKDAYS.find(w => w.value === day);
                        return (
                          <Badge key={day} variant="secondary" className="text-xs">
                            {dayInfo?.label || day}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-3">
                    Oluşturulma: {new Date(course.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Henüz hiç kurs eklenmemiş.</p>
              <Button 
                onClick={() => setIsAddingCourse(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                İlk Kursu Ekle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}