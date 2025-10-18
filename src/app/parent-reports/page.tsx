'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '../../utils/trpc';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Search, Filter, TrendingUp, TrendingDown, Eye, Heart, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ParentReportsPage() {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Gerçek arama sorgusu
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search.trim().length >= 2) {
        setSearchQuery(search.trim());
        setHasSearched(true);
      } else if (search.trim().length === 0) {
        setSearchQuery('');
        setHasSearched(false);
      }
    }, 500); // 500ms gecikme

    return () => clearTimeout(timeoutId);
  }, [search]);

  // Tüm öğrencilerin son 10 yoklamalarını getir - sadece arama yapıldığında
  const { data: studentAttendances, isLoading } = api.attendance.getAllStudentsRecentAttendances.useQuery(
    {
      search: searchQuery,
      courseId: selectedCourse && selectedCourse !== '' ? selectedCourse : undefined,
    },
    {
      enabled: hasSearched && searchQuery.length >= 2, // Debounced query kullan
    }
  );

  // Kursları getir (filtreleme için)
  const { data: courses } = api.course.getAll.useQuery();

  const resetFilters = useCallback(() => {
    setSearch('');
    setSearchQuery('');
    setSelectedCourse('');
    setHasSearched(false);
  }, []);

  const handleSearchInputChange = useCallback((value: string) => {
    setSearch(value);
    // State değişimini debounce effect'e bırak
  }, []);

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

  if (isLoading && hasSearched && searchQuery.length >= 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Eye className="h-8 w-8 text-green-600" />
                  Veli Paneli
                </h1>
                <p className="text-gray-600">"{searchQuery}" için arama yapılıyor...</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white hover:bg-green-50 border-green-200 text-green-700 hover:text-green-800 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ana Sayfa
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Eye className="h-8 w-8 text-green-600" />
                Veli Paneli
              </h1>
              <p className="text-gray-600">Çocuğunuzun yoklama durumunu takip edin</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full border border-green-200">
            <Heart className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-700">Veliler için özel</span>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Öğrenci Arama</h3>
                <p className="text-green-700 text-sm">
                  Çocuğunuzun yoklama durumunu görmek için aşağıdaki arama kutusuna isim yazarak arama yapın.
                  En az 2 karakter yazmanız gerekmektedir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-100 to-blue-100 border-b border-green-200">
            <CardTitle className="flex items-center gap-3 text-green-800">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Filter className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold">Akıllı Arama ve Filtreleme</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Arama */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-700 flex items-center gap-1">
                  <Search className="h-4 w-4" />
                  Öğrenci Arama *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                  <Input
                    placeholder="Öğrenci ismi yazın (en az 2 karakter)..."
                    value={search}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    className="pl-10 border-green-200 focus:border-green-400 focus:ring-green-200 bg-white shadow-sm"
                  />
                  {search && search.length >= 2 && (
                    <div className="absolute right-3 top-3 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-md">
                      {search.includes(' ') ? '🔍 Tam isim' : '📝 İsim/Soyisim'}
                    </div>
                  )}
                  {search && search.length > 0 && search.length < 2 && (
                    <div className="absolute right-3 top-3 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-md">
                      {2 - search.length} karakter daha
                    </div>
                  )}
                  {isLoading && hasSearched && (
                    <div className="absolute right-3 top-3 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-md animate-pulse">
                      Aranıyor...
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  💡 Yazdıkça otomatik arama yapılır (500ms gecikme ile)
                </div>
              </div>

              {/* Kurs Filtresi */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-700 flex items-center gap-1">
                  📚 Kurs Seçimi
                </label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-200 bg-white shadow-sm">
                    <span className="flex-1 text-left">
                      {selectedCourse && selectedCourse !== '' 
                        ? courses?.find(course => course.id === selectedCourse)?.name || "Kurs seç"
                        : "Tüm Kurslar"
                      }
                    </span>
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
              </div>

              {/* Temizle Butonu */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-700">
                  ⚙️ İşlemler
                </label>
                <Button 
                  variant="outline" 
                  onClick={resetFilters} 
                  className="w-full bg-white hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 hover:border-red-300 shadow-sm transition-all duration-200"
                >
                  <span className="mr-2">🗑️</span>
                  Filtreleri Temizle
                </Button>
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-green-200">
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  {isLoading && hasSearched ? 
                    'Arama yapılıyor...' :
                    hasSearched ? 
                      `${studentAttendances?.length || 0} öğrenci bulundu` :
                      search.trim().length >= 2 ?
                        'Arama sonuçları yükleniyor...' :
                        'Arama yapmak için öğrenci ismi yazın'
                  }
                </span>
              </div>
              {hasSearched && (searchQuery || selectedCourse) && (
                <div className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                  📊 Arama aktif
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Yoklama Raporu */}
        {!hasSearched ? (
          /* Başlangıç Durumu */
          <Card className="text-center py-16">
            <CardContent>
              <Search className="h-16 w-16 text-green-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Öğrenci Arama
              </h3>
              <p className="text-gray-600 mb-4">
                Çocuğunuzun yoklama durumunu görmek için yukarıdaki arama kutusuna ismini yazın.
              </p>
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg inline-block">
                💡 İpucu: En az 2 karakter yazarak arama yapabilirsiniz
              </div>
            </CardContent>
          </Card>
        ) : hasSearched && studentAttendances && studentAttendances.length > 0 ? (
          <div className="space-y-4">
            {studentAttendances.map((studentData) => {
              const AttendanceIcon = getAttendanceIcon(studentData.attendanceRate);
              
              return (
                <Card key={studentData.studentId} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-400">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Öğrenci Bilgileri */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-lg">
                            {studentData.studentName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {studentData.studentName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {studentData.recentAttendances.length > 0 && studentData.recentAttendances[0].course && (
                              <span className="mr-2">📚 {studentData.recentAttendances[0].course.name}</span>
                            )}
                            Son {studentData.recentAttendances.length} yoklama
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${getAttendanceRateColor(studentData.attendanceRate)}`}>
                          <AttendanceIcon className="h-4 w-4" />
                          <span className="font-medium">
                            %{studentData.attendanceRate} Devam
                          </span>
                        </div>
                      </div>

                      {/* Yoklama Detayları - Tarih Görünümü */}
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-3">Son Yoklamalar:</p>
                        {studentData.recentAttendances.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <Calendar className="h-6 w-6 mx-auto mb-2 opacity-50" />
                            <span className="text-sm">Henüz yoklama kaydı yok</span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {studentData.recentAttendances.slice(0, 10).map((attendance: any, idx: number) => {
                              const status = attendance.status || (attendance.isPresent ? 'PRESENT' : 'ABSENT');
                              return (
                              <div
                                key={idx}
                                className={`flex flex-col items-center p-2 rounded-lg border-2 min-w-[70px] ${
                                  status === 'PRESENT'
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : status === 'ABSENT'
                                    ? 'bg-red-50 border-red-200 text-red-800'
                                    : 'bg-orange-50 border-orange-200 text-orange-800'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center mb-1 ${
                                  status === 'PRESENT' 
                                    ? 'bg-green-600' 
                                    : status === 'ABSENT'
                                    ? 'bg-red-600'
                                    : 'bg-orange-600'
                                }`}>
                                  <span className="text-white text-xs font-bold">
                                    {status === 'PRESENT' ? '✓' : status === 'ABSENT' ? '✗' : 'M'}
                                  </span>
                                </div>
                                <div className="text-xs font-medium">
                                  {new Date(attendance.date).toLocaleDateString('tr-TR', { 
                                    day: '2-digit', 
                                    month: '2-digit' 
                                  })}
                                </div>
                                <div className="text-xs opacity-75">
                                  {new Date(attendance.date).toLocaleDateString('tr-TR', { 
                                    weekday: 'short' 
                                  })}
                                </div>
                              </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Summary Stats */}
                      <div className="flex gap-4 mt-4 pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                          <span className="text-gray-600">
                            Mevcut: <span className="font-medium text-green-700">
                              {studentData.recentAttendances.filter((a: any) => {
                                const status = a.status || (a.isPresent ? 'PRESENT' : 'ABSENT');
                                return status === 'PRESENT';
                              }).length}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                          <span className="text-gray-600">
                            Yok: <span className="font-medium text-red-700">
                              {studentData.recentAttendances.filter((a: any) => {
                                const status = a.status || (a.isPresent ? 'PRESENT' : 'ABSENT');
                                return status === 'ABSENT';
                              }).length}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                          <span className="text-gray-600">
                            Mazeretli: <span className="font-medium text-orange-700">
                              {studentData.recentAttendances.filter((a: any) => {
                                const status = a.status || (a.isPresent ? 'PRESENT' : 'ABSENT');
                                return status === 'EXCUSED';
                              }).length}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          <span className="text-gray-600">
                            Toplam: <span className="font-medium text-blue-700">
                              {studentData.recentAttendances.length}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Öğrenci Bulunamadı
              </h3>
              <p className="text-gray-600 mb-4">
                {search ? 
                  `"${search}" ile eşleşen öğrenci bulunamadı.` : 
                  'Arama kriterlerinize uygun öğrenci bulunamadı.'
                }
              </p>
              <Button 
                onClick={resetFilters}
                variant="outline"
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <Search className="h-4 w-4 mr-2" />
                Yeni Arama Yap
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}