'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '../../../../../utils/trpc';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { ArrowLeft, Save, User, Phone, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const ctx = api.useContext();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [motherFirstName, setMotherFirstName] = useState('');
  const [motherLastName, setMotherLastName] = useState('');
  const [motherPhone, setMotherPhone] = useState('');
  const [fatherFirstName, setFatherFirstName] = useState('');
  const [fatherLastName, setFatherLastName] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedCourseLevelIds, setSelectedCourseLevelIds] = useState<string[]>([]);
  
  // Legacy fields - remove if not needed
  const [phone, setPhone] = useState('');
  // legacy combined parent fields removed - we now edit mother/father separately

  // Öğrenci bilgilerini getir
  const { data: student, isLoading: studentLoading } = api.student.getById.useQuery({
    id: studentId,
  });

  // Öğrencinin mevcut kurslarını getir
  const { data: studentCourses } = api.student.getCourses.useQuery({
    studentId,
  });

  // Tüm kursları getir
  const { data: courses } = api.course.getAll.useQuery();

  // Öğrenci güncelleme mutation
  const updateStudent = api.student.update.useMutation({
    onSuccess: () => {
      router.push('/staff/students');
    },
    onError: (error: any) => {
      console.error('Öğrenci güncellenirken hata:', error);
    },
  });

  const deleteStudent = api.student.delete.useMutation({
    onSuccess: async () => {
      await ctx.student.getAllWithFilters.invalidate();
      router.push('/staff/students');
    }
  });

  // Öğrencinin son yoklamalarını getir
  const { data: recentAttendances = [] } = api.attendance.getStudentRecentAttendances.useQuery({ studentId, limit: 10 });

  const [editingAttendanceId, setEditingAttendanceId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<'PRESENT' | 'ABSENT' | 'EXCUSED'>('ABSENT');
  const [editingNotes, setEditingNotes] = useState<string>('');

  const updateAttendance = api.attendance.updateAttendance.useMutation({
    onSuccess: async () => {
      setEditingAttendanceId(null);
      await ctx.attendance.getStudentRecentAttendances.invalidate();
      await ctx.attendance.getAttendanceRecords.invalidate();
    },
    onError: (err) => {
      console.error('Yoklama güncelleme hatası', err);
      alert('Yoklama güncellerken hata oluştu');
    }
  });

  // Öğrenci verilerini form alanlarına yükle
  useEffect(() => {
    if (student) {
      setFirstName(student.firstName);
      setLastName(student.lastName);
      setMotherFirstName(student.motherFirstName || '');
      setMotherLastName(student.motherLastName || '');
      setMotherPhone(student.motherPhone || '');
      setFatherFirstName(student.fatherFirstName || '');
      setFatherLastName(student.fatherLastName || '');
      setFatherPhone(student.fatherPhone || '');
      setBirthDate(student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : '');
      setGender(student.gender as 'male' | 'female');
      
      // legacy combined parent fields removed; keep phone blank or use student.phone if available
      setPhone('');
    }
  }, [student]);

  // Öğrencinin kurs seviyelerini yükle (levelId olarak)
  useEffect(() => {
    if (studentCourses) {
      setSelectedCourseLevelIds(studentCourses.map((course: any) => course.levelId));
    }
  }, [studentCourses]);

  const handleCourseToggle = (courseLevelId: string) => {
    setSelectedCourseLevelIds(prev => 
      prev.includes(courseLevelId) 
        ? prev.filter(id => id !== courseLevelId)
        : [...prev, courseLevelId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim() || !birthDate || selectedCourseLevelIds.length === 0) {
      alert('Lütfen tüm zorunlu alanları doldurun ve en az bir kurs seçin.');
      return;
    }

    updateStudent.mutate({
      id: studentId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      motherFirstName: motherFirstName.trim() || undefined,
      motherLastName: motherLastName.trim() || undefined,
      motherPhone: motherPhone.trim() || undefined,
      fatherFirstName: fatherFirstName.trim() || undefined,
      fatherLastName: fatherLastName.trim() || undefined,
      fatherPhone: fatherPhone.trim() || undefined,
      birthDate: new Date(birthDate),
      gender,
      courseLevelIds: selectedCourseLevelIds,
    });
  };

  if (studentLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/staff/students">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Öğrenci Düzenle</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/staff/students">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Öğrenci Bulunamadı</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Bu öğrenci bulunamadı.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/staff/students">
            <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Öğrenci Listesi
            </Button>
          </Link>
          <div className="ml-auto">
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                const ok = confirm('Bu öğrenciyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.');
                if (!ok) return;
                try {
                  await deleteStudent.mutateAsync({ id: studentId });
                } catch (err) {
                  console.error(err);
                  alert('Silme sırasında hata oluştu');
                }
              }}
            >
              Sil
            </Button>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <User className="h-8 w-8" />
          Öğrenci Düzenle
        </h1>
        <p className="text-blue-100 text-lg">
          {student.firstName} {student.lastName} - Bilgilerini Güncelle
        </p>
      </div>

      {/* Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-3 text-gray-800">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            Öğrenci Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Kişisel Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  İsim *
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="İsim"
                  className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Soyisim *
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Soyisim"
                  className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Telefon
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Telefon numarası (opsiyonel)"
                  className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Doğum Tarihi *
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Cinsiyet *
                </Label>
                <Select value={gender} onValueChange={(value) => setGender(value as 'male' | 'female')}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Erkek</SelectItem>
                    <SelectItem value="female">Kız</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Veli Bilgileri - Anne / Baba ayrı alanlar */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Veli Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Anne */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Anne</h4>
                  <div className="space-y-2">
                    <Label htmlFor="motherFirstName" className="text-sm font-medium text-gray-700">İsim</Label>
                    <Input
                      id="motherFirstName"
                      value={motherFirstName}
                      onChange={(e) => setMotherFirstName(e.target.value)}
                      placeholder="Anne ismi"
                      className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motherLastName" className="text-sm font-medium text-gray-700">Soyisim</Label>
                    <Input
                      id="motherLastName"
                      value={motherLastName}
                      onChange={(e) => setMotherLastName(e.target.value)}
                      placeholder="Anne soyismi"
                      className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motherPhone" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Telefon
                    </Label>
                    <Input
                      id="motherPhone"
                      value={motherPhone}
                      onChange={(e) => setMotherPhone(e.target.value)}
                      placeholder="Anne telefon numarası"
                      className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                    />
                  </div>
                </div>

                {/* Baba */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Baba</h4>
                  <div className="space-y-2">
                    <Label htmlFor="fatherFirstName" className="text-sm font-medium text-gray-700">İsim</Label>
                    <Input
                      id="fatherFirstName"
                      value={fatherFirstName}
                      onChange={(e) => setFatherFirstName(e.target.value)}
                      placeholder="Baba ismi"
                      className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fatherLastName" className="text-sm font-medium text-gray-700">Soyisim</Label>
                    <Input
                      id="fatherLastName"
                      value={fatherLastName}
                      onChange={(e) => setFatherLastName(e.target.value)}
                      placeholder="Baba soyismi"
                      className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fatherPhone" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Telefon
                    </Label>
                    <Input
                      id="fatherPhone"
                      value={fatherPhone}
                      onChange={(e) => setFatherPhone(e.target.value)}
                      placeholder="Baba telefon numarası"
                      className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Kurs Seçimi */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Kurs Seçimi *
              </h3>
              {courses && courses.length > 0 ? (
                <div className="space-y-4">
                  {courses.map((course: any) => (
                    <div key={course.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium">{course.name}</div>
                          <div className="text-sm text-gray-500">{course.description}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {course.courseLevels && course.courseLevels.length > 0 ? (
                          course.courseLevels.map((level: any) => (
                            <label key={level.id} className="flex items-center gap-3 p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                              <Checkbox
                                id={`level-${level.id}`}
                                checked={selectedCourseLevelIds.includes(level.id)}
                                onCheckedChange={() => handleCourseToggle(level.id)}
                              />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{level.level === 'temel' ? 'Temel' : level.level === 'teknik' ? 'Teknik' : 'Performans'}</div>
                                <div className="text-xs text-gray-500">Günler: {(() => {
                                  const raw = level.attendanceDays;
                                  const days: string[] = Array.isArray(raw)
                                    ? raw
                                    : typeof raw === 'string' && raw.length > 0
                                      ? raw.split(',')
                                      : [];
                                  return days.join(', ');
                                })()}</div>
                              </div>
                            </label>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">Seviye bilgisi yok</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Henüz kurs bulunmuyor.</p>
              )}

              {/* Geçmiş Yoklamalar (Düzenle) */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Geçmiş Yoklamalar</h3>
                {recentAttendances.length === 0 ? (
                  <p className="text-sm text-gray-600">Henüz yoklama kaydı bulunmuyor.</p>
                ) : (
                  <div className="space-y-3">
                    {recentAttendances.map((att: any) => (
                      <div key={att.id} className="p-3 border rounded-md">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-medium">{att.course?.name || '—'}</div>
                            <div className="text-sm text-gray-500">{new Date(att.date).toLocaleString('tr-TR')}</div>
                            <div className="mt-2">Notlar: <span className="text-gray-700">{att.notes || '-'}</span></div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-sm font-medium">Durum: <span className="ml-1 font-semibold">{(() => {
                                const map: Record<string,string> = { PRESENT: 'Geldi', ABSENT: 'Yok', EXCUSED: 'Mazeretli' };
                                return map[att.status] ?? att.status;
                              })()}</span></div>
                            <div className="flex gap-2">
                              <Button type="button" size="sm" variant="outline" onClick={() => {
                                setEditingAttendanceId(att.id);
                                setEditingStatus(att.status as any);
                                setEditingNotes(att.notes || '');
                              }}>
                                Düzenle
                              </Button>
                            </div>
                          </div>
                        </div>

                        {editingAttendanceId === att.id && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <div className="flex items-center gap-3">
                              <label className="text-sm">Durum:</label>
                              <select value={editingStatus} onChange={(e) => setEditingStatus(e.target.value as any)} className="border px-2 py-1 rounded">
                                <option value="PRESENT">Geldi</option>
                                <option value="ABSENT">Yok</option>
                                <option value="EXCUSED">Mazeretli</option>
                              </select>
                            </div>
                            <div className="mt-2">
                              <label className="text-sm">Notlar</label>
                              <input className="w-full border px-2 py-1 rounded mt-1" value={editingNotes} onChange={(e) => setEditingNotes(e.target.value)} />
                            </div>
                            <div className="mt-3 flex gap-2">
                              <Button type="button" size="sm" onClick={async () => {
                                try {
                                  await updateAttendance.mutateAsync({ attendanceId: att.id, status: editingStatus, notes: editingNotes });
                                } catch (err) {
                                  // handled in mutation
                                }
                              }}>Kaydet</Button>
                              <Button type="button" size="sm" variant="ghost" onClick={() => setEditingAttendanceId(null)}>İptal</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={updateStudent.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
              >
                <Save className="h-5 w-5 mr-2" />
                {updateStudent.isPending ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
              </Button>
              <Link href="/staff/students" className="flex-1">
                <Button type="button" variant="outline" className="w-full py-3 text-lg">
                  İptal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}