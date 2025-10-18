'use client';

import { useState } from 'react';
import { api } from '../../../utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Plus,
  Search,
  ArrowLeft,
  Eye,
  Trash2,
  Edit
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

export default function CoursesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Kursları çek
  const { data: courses = [], isLoading, refetch } = api.course.getAll.useQuery();

  // Arama terimine göre filtreleme
  const filteredCourses = courses.filter(course => {
    if (!searchTerm) return true;
    return course.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getDayLabels = (attendanceDays: string[]) => {
    return attendanceDays.map(dayKey => {
      const day = DAYS_OF_WEEK.find(d => d.key === dayKey);
      return day?.short || dayKey;
    }).join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Kurslar</h1>
                  <p className="text-blue-100">Tüm kursları görüntüleyin ve yönetin</p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/staff/create-course')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Yeni Kurs
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-lg border-0 mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Kurs adı ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Temizle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600">Kurslar yükleniyor...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz kurs bulunmuyor'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Farklı bir arama terimi deneyin'
                  : 'İlk kursu oluşturmak için butona tıklayın'
                }
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => router.push('/staff/create-course')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Kursu Oluştur
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{course.name}</CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Student Count */}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {course.studentCount || 0} öğrenci kayıtlı
                    </span>
                  </div>

                  {/* Attendance Days */}
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Yoklama günleri:</div>
                      <div className="flex flex-wrap gap-1">
                        {course.attendanceDays && course.attendanceDays.length > 0 ? (
                          course.attendanceDays.map((dayKey: string) => {
                            const day = DAYS_OF_WEEK.find(d => d.key === dayKey);
                            return (
                              <span
                                key={dayKey}
                                className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium"
                              >
                                {day?.short || dayKey}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-gray-400">Belirtilmemiş</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Oluşturulma: {new Date(course.createdAt).toLocaleDateString('tr-TR')}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/staff/courses/${course.id}`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Detay
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/staff/courses/${course.id}/edit`)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Düzenle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {filteredCourses.length > 0 && (
          <Card className="shadow-lg border-0 mt-8">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredCourses.length}
                  </div>
                  <div className="text-sm text-gray-600">Toplam Kurs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {filteredCourses.reduce((total, course) => total + (course.studentCount || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Toplam Öğrenci</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredCourses.length > 0 
                      ? Math.round(filteredCourses.reduce((total, course) => total + (course.studentCount || 0), 0) / filteredCourses.length)
                      : 0
                    }
                  </div>
                  <div className="text-sm text-gray-600">Ortalama Öğrenci/Kurs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}