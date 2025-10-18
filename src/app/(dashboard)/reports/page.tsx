'use client';

import { useState } from 'react';
import { api } from '../../../utils/trpc';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { BarChart3, Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  // Tüm öğrencilerin son 10 yoklamalarını getir
  const { data: studentAttendances, isLoading } = api.attendance.getAllStudentsRecentAttendances.useQuery({
    search,
    courseId: selectedCourse && selectedCourse !== '' ? selectedCourse : undefined,
  });

  // Kursları getir (filtreleme için)
  const { data: courses } = api.course.getAll.useQuery();

  const resetFilters = () => {
    setSearch('');
    setSelectedCourse('');
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAttendanceIcon = (rate: number) => {
    if (rate >= 80) return TrendingUp;
    if (rate >= 60) return TrendingUp;
    return TrendingDown;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Yoklama Takibi</h1>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Yoklama Takibi</h1>
        <p className="text-gray-600">
          Öğrencilerin son 10 yoklama durumlarını görüntüleyin
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreleme ve Arama
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Arama */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Öğrenci adı ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Kurs Filtresi */}
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Kurs seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tüm Kurslar</SelectItem>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Temizle Butonu */}
            <Button variant="outline" onClick={resetFilters} className="w-full">
              Filtreleri Temizle
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Yoklama Raporu */}
      {studentAttendances && studentAttendances.length > 0 ? (
        <div className="space-y-4">
          {studentAttendances.map((studentData) => {
            const AttendanceIcon = getAttendanceIcon(studentData.attendanceRate);
            
            return (
              <Card key={studentData.studentId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Öğrenci Bilgileri */}
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {studentData.studentName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Son {studentData.recentAttendances.length} yoklama
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${getAttendanceRateColor(studentData.attendanceRate)}`}>
                        <AttendanceIcon className="h-4 w-4" />
                        <span className="font-medium">
                          %{studentData.attendanceRate}
                        </span>
                      </div>
                    </div>

                    {/* Yoklama Detayları */}
                    <div className="flex-1 lg:max-w-md">
                      <p className="text-sm text-gray-600 mb-2">Son yoklamalar:</p>
                      <div className="flex flex-wrap gap-1">
                        {studentData.recentAttendances.length > 0 ? (
                          studentData.recentAttendances.map((attendance, index) => (
                            <div
                              key={index}
                              className="group relative"
                            >
                              <Badge
                                variant={attendance.isPresent ? "default" : "destructive"}
                                className="text-xs cursor-help"
                              >
                                {attendance.isPresent ? '✓' : '✗'}
                              </Badge>
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {new Date(attendance.date).toLocaleDateString('tr-TR')}
                                <br />
                                {attendance.course?.name}
                              </div>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">Henüz yoklama alınmamış</span>
                        )}
                      </div>
                    </div>

                    {/* İstatistikler */}
                    <div className="lg:text-right">
                      <div className="text-sm text-gray-600">
                        <div>
                          Geldi: {studentData.recentAttendances.filter(a => a.isPresent).length}
                        </div>
                        <div>
                          Gelmedi: {studentData.recentAttendances.filter(a => !a.isPresent).length}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {search || selectedCourse 
                ? 'Arama kriterlerinize uygun kayıt bulunamadı.'
                : 'Henüz hiç yoklama kaydı bulunmuyor.'
              }
            </p>
            {!search && !selectedCourse && (
              <p className="text-sm text-gray-500 mt-2">
                Yoklama takibi görmek için önce öğrenci ekleme ve yoklama alma işlemlerini yapın.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Özet İstatistikler */}
      {studentAttendances && studentAttendances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Genel İstatistikler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {studentAttendances.length}
                </div>
                <div className="text-sm text-gray-600">Toplam Öğrenci</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {studentAttendances.filter(s => s.attendanceRate >= 80).length}
                </div>
                <div className="text-sm text-gray-600">İyi Katılım (%80+)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {studentAttendances.filter(s => s.attendanceRate >= 60 && s.attendanceRate < 80).length}
                </div>
                <div className="text-sm text-gray-600">Orta Katılım (%60-79)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {studentAttendances.filter(s => s.attendanceRate < 60).length}
                </div>
                <div className="text-sm text-gray-600">Düşük Katılım (%60-)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}