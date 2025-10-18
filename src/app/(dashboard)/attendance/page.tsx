'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../utils/trpc';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { ClipboardCheck, Save, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentWeekday } from '../../../lib/constants/weekdays';

export default function AttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendances, setAttendances] = useState<Record<string, boolean>>({});

  const { data: courses } = api.course.getAll.useQuery();
  
  const { data: canTakeAttendance } = api.attendance.canTakeAttendanceToday.useQuery(
    { courseId: selectedCourse },
    { enabled: !!selectedCourse }
  );

  const { data: students, refetch: refetchStudents } = api.attendance.getStudentsForAttendance.useQuery(
    { 
      courseId: selectedCourse,
      date: new Date(selectedDate)
    },
    { enabled: !!selectedCourse && !!selectedDate }
  );

  const saveAttendance = api.attendance.createBulk.useMutation({
    onSuccess: () => {
      toast.success('Yoklama başarıyla kaydedildi!');
      refetchStudents();
    },
    onError: (error) => {
      toast.error('Hata: ' + error.message);
    },
  });

  // Öğrencilerin mevcut yoklama durumlarını yükle
  useEffect(() => {
    if (students) {
      const initialAttendances: Record<string, boolean> = {};
      students.forEach(student => {
        initialAttendances[student.id] = student.isPresent || false;
      });
      setAttendances(initialAttendances);
    }
  }, [students]);

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendances(prev => ({
      ...prev,
      [studentId]: isPresent
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedCourse || !selectedDate) {
      toast.error('Kurs ve tarih seçimi gereklidir');
      return;
    }

    const attendanceData = Object.entries(attendances).map(([studentId, isPresent]) => ({
      studentId,
      isPresent,
    }));

    saveAttendance.mutate({
      courseId: selectedCourse,
      date: new Date(selectedDate),
      attendances: attendanceData,
    });
  };

  const getTodayStatus = () => {
    const today = getCurrentWeekday();
    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    
    if (!selectedCourse || !canTakeAttendance) return null;

    if (isToday && !canTakeAttendance.canTakeAttendance) {
      return {
        type: 'warning',
        message: `Bu kursun bugün (${canTakeAttendance.today}) yoklaması yoktur.`,
        icon: AlertCircle,
      };
    }

    return null;
  };

  const status = getTodayStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Yoklama Al</h1>
        <p className="text-gray-600">
          Kurs seçin ve öğrencilerin yoklamasını alın
        </p>
      </div>

      {/* Kurs ve Tarih Seçimi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Yoklama Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Kurs Seçin *
              </label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Kurs seçin" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} ({course.studentCount} öğrenci)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tarih *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Durum Mesajı */}
          {status && (
            <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
              status.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' : ''
            }`}>
              <status.icon className="h-5 w-5" />
              <span>{status.message}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Öğrenci Listesi ve Yoklama */}
      {selectedCourse && selectedDate && students && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Öğrenci Listesi ({students.length} öğrenci)
              </CardTitle>
              <Button
                onClick={handleSaveAttendance}
                disabled={saveAttendance.isLoading || (status?.type === 'warning')}
                className="w-auto"
              >
                {saveAttendance.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date().getFullYear() - new Date(student.birthDate).getFullYear()} yaş
                        </p>
                      </div>
                      {student.hasAttendance && (
                        <Badge variant="secondary" className="text-xs">
                          Daha önce alındı
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant={attendances[student.id] === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAttendanceChange(student.id, true)}
                        className={attendances[student.id] === true ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Geldi
                      </Button>
                      <Button
                        variant={attendances[student.id] === false ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAttendanceChange(student.id, false)}
                        className={attendances[student.id] === false ? "bg-red-600 hover:bg-red-700" : ""}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Gelmedi
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>Bu kursta kayıtlı öğrenci bulunmuyor.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kurs Seçilmediğinde */}
      {!selectedCourse && (
        <Card>
          <CardContent className="text-center py-8">
            <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Yoklama almak için önce bir kurs seçin.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}