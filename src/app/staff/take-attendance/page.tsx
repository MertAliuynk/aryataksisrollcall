'use client';

import { useState } from 'react';
import { api } from '../../../utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { 
  ClipboardCheck, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Save,
  ArrowLeft,
  AlertCircle,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TakeAttendancePage() {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedCourseLevelId, setSelectedCourseLevelId] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'EXCUSED'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dateError, setDateError] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Kursları çek
  const { data: courses = [] } = api.course.getAll.useQuery();
  
  // Seçili kursa ait seviyeleri çek
  const { data: courseLevels = [] } = api.course.getLevels.useQuery(
    selectedCourseId,
    { enabled: !!selectedCourseId }
  );
  
  // Seçili kursu bul
  const selectedCourse = courses.find(course => course.id === selectedCourseId);
  
  // Seçili level'i bul
  const selectedCourseLevel = courseLevels.find(level => level.id === selectedCourseLevelId);
  
  // Seçili kurs seviyesine kayıtlı öğrencileri çek
  const { data: students = [] } = api.attendance.getStudentsForAttendance.useQuery(
    { 
      courseLevelId: selectedCourseLevelId,
      date: new Date(attendanceDate)
    },
    { enabled: !!selectedCourseLevelId && !!attendanceDate }
  );

  // Seçili tarih ve kurs seviyesi için yoklama alınabilir mi kontrol et
  const { data: attendanceCheck, isLoading: checkingAttendance } = api.attendance.canTakeAttendanceForDate.useQuery(
    { 
      courseLevelId: selectedCourseLevelId,
      date: new Date(attendanceDate)
    },
    { enabled: !!selectedCourseLevelId && !!attendanceDate }
  );

  // Haftanın günlerini mapping
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayNamesturkish = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  // Seçili tarihin hangi gün olduğunu kontrol et (kurs seviyesi bazında)
  const normalizeDays = (raw: any): string[] => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string' && raw.length > 0) return raw.split(',');
    return [];
  };

  const checkAttendanceDay = (date: string, courseLevel: any) => {
    if (!courseLevel) return { isValid: false, message: 'Kurs seviyesi bulunamadı' };

    const attendanceDays = normalizeDays(courseLevel.attendanceDays);
    if (attendanceDays.length === 0) return { isValid: false, message: 'Bu kurs seviyesinin yoklama günleri tanımlı değil' };

    const selectedDate = new Date(date);
    const dayIndex = selectedDate.getDay();
    const dayName = dayNames[dayIndex];
    const turkishDayName = dayNamesturkish[dayIndex];

    if (attendanceDays.includes(dayName)) {
      setDateError('');
      return { isValid: true, message: '' };
    } else {
      const allowedDays = attendanceDays.map((day: string) => {
        const index = dayNames.indexOf(day);
        return dayNamesturkish[index];
      }).join(', ');

      const errorMessage = `${turkishDayName} günü "${courseLevel.course?.name || 'Bu kurs'} - ${courseLevel.level}" seviyesi için yoklama günü değil. Bu seviye için yoklama günleri: ${allowedDays}`;
      setDateError(errorMessage);
      return { isValid: false, message: errorMessage };
    }
  };

  // Tarih veya kurs seviyesi değiştiğinde kontrol et
  const handleDateOrCourseLevelChange = (newDate?: string, newCourseLevelId?: string) => {
    const dateToCheck = newDate || attendanceDate;
    const courseLevelToCheck = courseLevels.find(cl => cl.id === (newCourseLevelId || selectedCourseLevelId));
    
    if (courseLevelToCheck && dateToCheck) {
      checkAttendanceDay(dateToCheck, courseLevelToCheck);
    } else {
      setDateError('');
    }
  };

  // Yoklama kaydet
  const saveAttendance = api.attendance.takeAttendance.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setAttendanceRecords({});
        setSelectedCourseId('');
        setSelectedCourseLevelId('');
      }, 2000);
    },
    onError: (error) => {
      console.error('Yoklama kaydetme hatası:', error);
      alert('Yoklama kaydedilirken bir hata oluştu!');
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleAttendanceToggle = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'EXCUSED') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmit = async () => {
    if (!selectedCourseId) {
      alert('Lütfen kurs seçin!');
      return;
    }

    if (!selectedCourseLevelId) {
      alert('Lütfen kurs seviyesi seçin!');
      return;
    }

    // Yoklama alınabilir mi kontrol et (sadece gün kontrolü için)
    if (attendanceCheck && !attendanceCheck.canTake) {
      // Sadece gün uyumu kontrolü yapıyoruz, mevcut kayıt varlığı engel değil
      const isDateRestriction = attendanceCheck.reason.includes('yoklama günü değil');
      if (isDateRestriction) {
        alert(attendanceCheck.reason);
        return;
      }
    }

    if (dateError) {
      alert('Seçilen tarih bu kurs seviyesi için yoklama günü değil!');
      return;
    }
    // Tarih ve kurs seviyesi uyumluluğunu tekrar kontrol et
    const dateCheck = checkAttendanceDay(attendanceDate, selectedCourseLevel);
    if (!dateCheck.isValid) {
      alert(dateCheck.message);
      return;
    }

    if (students.length === 0) {
      alert('Bu kurs seviyesinde kayıtlı öğrenci bulunmuyor!');
      return;
    }

    // Validationlar geçti, onay dialog'unu göster
    setShowConfirmDialog(true);
  };

  const confirmAndSaveAttendance = async () => {
    const attendanceData = students.map(student => ({
      studentId: student.id,
      courseLevelId: selectedCourseLevelId,
      date: new Date(attendanceDate),
      status: attendanceRecords[student.id] ?? 'ABSENT'
    }));

    setIsSubmitting(true);
    setShowConfirmDialog(false);
    saveAttendance.mutate({ attendanceData });
  };

  // Kurs değişikliği
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedCourseLevelId(''); // Level'i sıfırla
    setAttendanceRecords({});
    setDateError('');
  };

  // Level değişikliği
  const handleCourseLevelChange = (courseLevelId: string) => {
    setSelectedCourseLevelId(courseLevelId);
    setAttendanceRecords({});
    handleDateOrCourseLevelChange(attendanceDate, courseLevelId);
  };

  // Tarih değişikliği
  const handleDateChange = (date: string) => {
    setAttendanceDate(date);
    setAttendanceRecords({});
    handleDateOrCourseLevelChange(date, selectedCourseLevelId);
  };

  const presentCount = Object.values(attendanceRecords).filter(status => status === 'PRESENT').length;
  const absentCount = Object.values(attendanceRecords).filter(status => status === 'ABSENT').length;
  const excusedCount = Object.values(attendanceRecords).filter(status => status === 'EXCUSED').length;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Yoklama Kaydedildi!</h2>
            <p className="text-green-600">
              {presentCount} mevcut, {absentCount} yok, {excusedCount} mazeretli olarak kaydedildi.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
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
          
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Yoklama Al</h1>
                <p className="text-green-100">Öğrenci devam durumlarını kaydedin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course and Date Selection */}
        <Card className="shadow-lg border-0 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Kurs ve Tarih Seçimi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Kurs Seçin *
                </label>
                <Select
                  value={selectedCourseId}
                  onValueChange={handleCourseChange}
                  getDisplayValue={(val) => {
                    if (!val) return 'Kurs seçin';
                    const found = courses.find((c: any) => c.id === val);
                    return found ? found.name : val;
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kurs seçin" />
                  </SelectTrigger>
                  <SelectContent>
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
                  Seviye Seçin *
                </label>
                <Select 
                  value={selectedCourseLevelId} 
                  onValueChange={handleCourseLevelChange}
                  getDisplayValue={(val) => {
                    if (!val) return selectedCourseId ? 'Seviye seçin' : 'Önce kurs seçin';
                    const level = courseLevels.find((l: any) => l.id === val);
                    if (!level) return val;
                    const levelLabels: Record<string,string> = { TEMEL: 'Temel', TEKNIK: 'Teknik', PERFORMANS: 'Performans', temel: 'Temel', teknik: 'Teknik', performans: 'Performans' };
                    return levelLabels[level.level] || level.level;
                  }}
                >
                  <SelectTrigger disabled={!selectedCourseId}>
                    <SelectValue placeholder={selectedCourseId ? "Seviye seçin" : "Önce kurs seçin"} />
                  </SelectTrigger>
                  <SelectContent>
                    {courseLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            level.level === 'TEMEL' ? 'bg-green-500' :
                            level.level === 'TEKNIK' ? 'bg-blue-500' : 'bg-purple-500'
                          }`} />
                          {level.level}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tarih
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      handleDateChange(today);
                    }}
                    className="px-3 py-2 text-sm"
                  >
                    Bugün
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Check Status */}
        {selectedCourseLevelId && attendanceDate && !checkingAttendance && attendanceCheck && (
          <Card className={`shadow-lg border-0 mb-6 ${
            attendanceCheck.canTake 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <CardContent className="p-4">
              <div className={`flex items-center gap-2 ${
                attendanceCheck.canTake ? 'text-green-800' : 'text-red-800'
              }`}>
                {attendanceCheck.canTake ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span className="font-medium">
                  {attendanceCheck.canTake ? 'Yoklama Alınabilir' : 'Yoklama Alınamaz'}
                </span>
              </div>
              <p className={`mt-1 ${
                attendanceCheck.canTake ? 'text-green-700' : 'text-red-700'
              }`}>
                {attendanceCheck.reason}
              </p>
            </CardContent>
          </Card>
        )}

        {checkingAttendance && selectedCourseLevelId && attendanceDate && (
          <Card className="shadow-lg border-0 mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="font-medium">Yoklama durumu kontrol ediliyor...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Level Attendance Days Info */}
        {selectedCourseLevel && selectedCourseLevel.attendanceDays && selectedCourseLevel.attendanceDays.length > 0 && (
          <Card className="shadow-lg border-0 mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">
                    "{selectedCourse?.name} - {selectedCourseLevel.level}" Seviyesinin Yoklama Günleri
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const days = normalizeDays(selectedCourseLevel.attendanceDays);
                      return days.map((dayKey: string) => {
                        const index = dayNames.indexOf(dayKey);
                        const turkishDay = dayNamesturkish[index];
                        return (
                          <span
                            key={dayKey}
                            className={`px-2 py-1 rounded text-sm font-medium text-white ${
                              selectedCourseLevel.level === 'TEMEL' ? 'bg-green-600' :
                              selectedCourseLevel.level === 'TEKNIK' ? 'bg-blue-600' : 'bg-purple-600'
                            }`}
                          >
                            {turkishDay}
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Date Error Warning */}
        {dateError && (
          <Card className="shadow-lg border-0 mb-6 border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-900 mb-1">Yoklama Günü Uyarısı</h3>
                  <p className="text-red-700 text-sm">{dateError}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students List */}
        {selectedCourseLevelId && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Öğrenci Listesi
                {students.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">
                    ({students.length} öğrenci)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Bu kurs seviyesinde kayıtlı öğrenci bulunmuyor</p>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-800 font-medium">Mevcut</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">{presentCount}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-800 font-medium">Yok</span>
                      </div>
                      <p className="text-2xl font-bold text-red-900">{absentCount}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <span className="text-yellow-800 font-medium">Mazeretli</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-900">{excusedCount}</p>
                    </div>
                  </div>

                  {/* Student List */}
                  <div className="space-y-3">
                    {students.map((student) => {
                      const status = attendanceRecords[student.id];
                      return (
                        <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {student.firstName[0]}{student.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                ID: {student.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant={status === 'PRESENT' ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleAttendanceToggle(student.id, 'PRESENT')}
                              className={status === 'PRESENT' ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mevcut
                            </Button>
                            <Button
                              variant={status === 'ABSENT' ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleAttendanceToggle(student.id, 'ABSENT')}
                              className={status === 'ABSENT' ? "bg-red-600 hover:bg-red-700" : ""}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Yok
                            </Button>
                            <Button
                              variant={status === 'EXCUSED' ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleAttendanceToggle(student.id, 'EXCUSED')}
                              className={status === 'EXCUSED' ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                            >
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Mazeretli
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6 pt-4 border-t">
                    <Button
                      onClick={handleSubmit}
                      disabled={
                        isSubmitting || 
                        students.length === 0 || 
                        !!dateError || 
                        checkingAttendance || 
                        (attendanceCheck && !attendanceCheck.canTake && attendanceCheck.reason.includes('yoklama günü değil'))
                      }
                      className={`w-full h-12 ${
                        dateError || (attendanceCheck && !attendanceCheck.canTake && attendanceCheck.reason.includes('yoklama günü değil'))
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Yoklamayı Kaydet
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Onay Dialog'u */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Save className="h-5 w-5 text-blue-600" />
                Yoklamayı Kaydet
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>Yoklama bilgilerini kaydetmek istediğinizden emin misiniz?</p>
                
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Kurs:</span>
                    <span>{selectedCourse?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Tarih:</span>
                    <span>{new Date(attendanceDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Toplam Öğrenci:</span>
                    <span>{students.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{presentCount}</div>
                    <div className="text-gray-600">Mevcut</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-red-600">{absentCount}</div>
                    <div className="text-gray-600">Yok</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600">{excusedCount}</div>
                    <div className="text-gray-600">Mazeretli</div>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  Bu işlem geri alınamaz. Yoklama kaydedildikten sonra değişiklik yapamazsınız.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>
                İptal
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmAndSaveAttendance}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Evet, Kaydet
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}