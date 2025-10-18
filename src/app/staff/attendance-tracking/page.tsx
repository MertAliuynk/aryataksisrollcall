'use client';

import { useState } from 'react';
import { api } from '../../../utils/trpc'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Search,
  ArrowLeft,
  FileText,
  Filter,
  Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AttendanceTrackingPage() {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedCourseLevelId, setSelectedCourseLevelId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Kursları çek
  const { data: courses = [] } = api.course.getAll.useQuery();
  
  // Öğrencileri çek
  const { data: students = [] } = api.student.getAll.useQuery();

  // Seçili kursa ait seviyeleri çek
  const { data: courseLevels = [] } = api.course.getLevels.useQuery(
    selectedCourseId,
    { enabled: !!selectedCourseId }
  );

  // Bu ayın başlangıcını hesapla
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  // Tarih formatı için yardımcı fonksiyon
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Yoklama verilerini çek (ay başından itibaren + filtrelere göre)
  const { data: attendanceData = [], isLoading } = api.attendance.getAttendanceRecords.useQuery({
    courseId: selectedCourseId || undefined,
    courseLevelId: selectedCourseLevelId || undefined,
    studentId: selectedStudentId || undefined,
    dateFrom: dateFrom ? new Date(dateFrom) : currentMonthStart,
    dateTo: dateTo ? new Date(dateTo) : undefined,
  });

  // Öğrenci bazında yoklama verilerini grupla
  const groupedAttendanceData = attendanceData.reduce((acc: any, record: any) => {
    const studentKey = `${record.student.id}-${record.courseLevel?.id || record.courseId}`;
    if (!acc[studentKey]) {
      acc[studentKey] = {
        student: record.student,
        course: record.course,
        courseLevel: record.courseLevel,
        attendances: []
      };
    }
    acc[studentKey].attendances.push({
      date: record.date,
      status: record.status || (record.isPresent ? 'PRESENT' : 'ABSENT'),
      id: record.id,
      notes: record.notes
    });
    return acc;
  }, {});

  // Öğrenci listesine dönüştür ve tarihe göre sırala
  const studentsWithAttendances = Object.values(groupedAttendanceData).map((group: any) => ({
    ...group,
    attendances: group.attendances.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }));

  // Arama terimine göre filtreleme
  const filteredData = studentsWithAttendances.filter((group: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      group.student.firstName.toLowerCase().includes(searchLower) ||
      group.student.lastName.toLowerCase().includes(searchLower) ||
      group.course.name.toLowerCase().includes(searchLower) ||
      (group.courseLevel?.level && group.courseLevel.level.toLowerCase().includes(searchLower))
    );
  });

  // İstatistikler
  const totalRecords = attendanceData.length;
  const presentRecords = attendanceData.filter((record: any) => {
    const status = record.status || (record.isPresent ? 'PRESENT' : 'ABSENT');
    return status === 'PRESENT';
  }).length;
  const absentRecords = attendanceData.filter((record: any) => {
    const status = record.status || (record.isPresent ? 'PRESENT' : 'ABSENT');
    return status === 'ABSENT';
  }).length;
  const excusedRecords = attendanceData.filter((record: any) => {
    const status = record.status || (record.isPresent ? 'PRESENT' : 'ABSENT');
    return status === 'EXCUSED';
  }).length;
  const attendanceRate = totalRecords > 0 ? ((presentRecords / totalRecords) * 100).toFixed(1) : '0';

  const clearFilters = () => {
    setSelectedCourseId('');
    setSelectedCourseLevelId('');
    setSelectedStudentId('');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
  };

  const exportData = () => {
    // CSV export functionality
    const headers = ['Öğrenci', 'Kurs', 'Seviye', 'Tarih', 'Durum', 'Notlar'];
    const csvData = attendanceData.map((record: any) => [
      `${record.student.firstName} ${record.student.lastName}`,
      record.course.name,
      record.courseLevel?.level || '-',
      new Date(record.date).toLocaleDateString('tr-TR'),
      record.status === 'PRESENT' ? 'Mevcut' : record.status === 'ABSENT' ? 'Yok' : 'Mazeretli',
      record.notes || '-'
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `yoklama-raporu-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Yoklama Takibi</h1>
                <p className="text-blue-100">Devam durumlarını görüntüleyin ve analiz edin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <Card className="shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam Kayıt</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mevcut</p>
                  <p className="text-2xl font-bold text-green-900">{presentRecords}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Yok</p>
                  <p className="text-2xl font-bold text-red-900">{absentRecords}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mazeretli</p>
                  <p className="text-2xl font-bold text-orange-900">{excusedRecords}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Devam Oranı</p>
                  <p className="text-2xl font-bold text-purple-900">%{attendanceRate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-lg border-0 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtreler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Kurs
                </label>
                <Select value={selectedCourseId} onValueChange={(value) => {
                  setSelectedCourseId(value);
                  setSelectedCourseLevelId(''); // Reset course level when course changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm kurslar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tüm kurslar</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Seviye
                </label>
                <Select 
                  value={selectedCourseLevelId} 
                  onValueChange={setSelectedCourseLevelId}
                >
                  <SelectTrigger disabled={!selectedCourseId}>
                    <SelectValue placeholder={selectedCourseId ? "Tüm seviyeler" : "Önce kurs seçin"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tüm seviyeler</SelectItem>
                    {courseLevels.map((level: any) => {
                      const levelLabels = {
                        temel: 'Temel',
                        teknik: 'Teknik', 
                        performans: 'Performans'
                      };
                      return (
                        <SelectItem key={level.id} value={level.id}>
                          {levelLabels[level.level as keyof typeof levelLabels] || level.level}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Öğrenci
                </label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm öğrenciler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tüm öğrenciler</SelectItem>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Başlangıç Tarihi
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder={formatDateForInput(currentMonthStart)}
                />
                {!dateFrom && (
                  <p className="text-xs text-gray-500 mt-1">
                    Varsayılan: {formatDateForInput(currentMonthStart)} (Bu ayın başı)
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Bitiş Tarihi
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Öğrenci veya kurs adı ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={clearFilters}>
                Filtreleri Temizle
              </Button>
              <Button onClick={exportData} disabled={attendanceData.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                CSV İndir
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Yoklama Kayıtları
              {filteredData.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({filteredData.length} öğrenci)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-3" />
                <p className="text-gray-600">Veriler yükleniyor...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">
                  {selectedCourseId || selectedStudentId || dateFrom || dateTo || searchTerm
                    ? 'Filtrelere uygun kayıt bulunamadı'
                    : 'Görüntülemek için filtre seçin'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredData.map((studentGroup: any) => (
                  <Card key={studentGroup.student.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      {/* Student Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {studentGroup.student.firstName[0]}{studentGroup.student.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {studentGroup.student.firstName} {studentGroup.student.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {studentGroup.course.name}
                            {studentGroup.courseLevel && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {studentGroup.courseLevel.level === 'temel' ? 'Temel' : 
                                 studentGroup.courseLevel.level === 'teknik' ? 'Teknik' : 
                                 studentGroup.courseLevel.level === 'performans' ? 'Performans' : 
                                 studentGroup.courseLevel.level}
                              </span>
                            )}
                            <span className="ml-2">• {studentGroup.attendances.length} yoklama kaydı</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Devam Oranı</div>
                          <div className="text-lg font-bold text-blue-600">
                            %{studentGroup.attendances.length > 0 
                              ? Math.round((studentGroup.attendances.filter((a: any) => {
                                  const status = a.status || (a.isPresent ? 'PRESENT' : 'ABSENT');
                                  return status === 'PRESENT';
                                }).length / studentGroup.attendances.length) * 100)
                              : 0
                            }
                          </div>
                        </div>
                      </div>

                      {/* Attendance Timeline */}
                      <div className="border-t pt-4">
                        <div className="text-sm font-medium text-gray-700 mb-3">Yoklama Geçmişi:</div>
                        {studentGroup.attendances.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            <Calendar className="h-6 w-6 mx-auto mb-2 opacity-50" />
                            <span className="text-sm">Henüz yoklama kaydı yok</span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {studentGroup.attendances.map((attendance: any, index: number) => {
                              const status = attendance.status || (attendance.isPresent ? 'PRESENT' : 'ABSENT');
                              return (
                              <div
                                key={attendance.id}
                                className={`flex flex-col items-center p-2 rounded-lg border-2 min-w-[80px] ${
                                  status === 'PRESENT'
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : status === 'ABSENT'
                                    ? 'bg-red-50 border-red-200 text-red-800'
                                    : 'bg-orange-50 border-orange-200 text-orange-800'
                                }`}
                              >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                                  status === 'PRESENT' 
                                    ? 'bg-green-600' 
                                    : status === 'ABSENT'
                                    ? 'bg-red-600'
                                    : 'bg-orange-600'
                                }`}>
                                  {status === 'PRESENT' ? (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  ) : status === 'ABSENT' ? (
                                    <XCircle className="w-4 h-4 text-white" />
                                  ) : (
                                    <Calendar className="w-4 h-4 text-white" />
                                  )}
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
                              {studentGroup.attendances.filter((a: any) => {
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
                              {studentGroup.attendances.filter((a: any) => {
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
                              {studentGroup.attendances.filter((a: any) => {
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
                              {studentGroup.attendances.length}
                            </span>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}