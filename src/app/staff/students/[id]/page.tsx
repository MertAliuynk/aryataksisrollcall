'use client';

import { api } from '../../../../utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { 
  User, 
  Phone, 
  Calendar, 
  Users, 
  ClipboardCheck, 
  ArrowLeft,
  Mail,
  MapPin,
  GraduationCap,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';

interface StudentDetailPageProps {
  params: {
    id: string;
  };
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const router = useRouter();
  const studentId = params.id;

  // Öğrenci bilgilerini çek
  const { data: student, isLoading: studentLoading } = api.student.getById.useQuery({ id: studentId });
  
  // Öğrencinin kayıtlı olduğu kursları çek
  const { data: studentCourses = [] } = api.student.getCourses.useQuery({ studentId });
  
  // Öğrencinin yoklama istatistiklerini çek
  const { data: attendanceStats } = api.attendance.getStudentAttendanceStats.useQuery({ studentId });

  // Öğrencinin son yoklama kayıtlarını çek
  const { data: recentAttendances = [] } = api.attendance.getStudentRecentAttendances.useQuery({ 
    studentId,
    limit: 10 
  });

  if (studentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Öğrenci bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    notFound();
  }

  const totalAttendances = recentAttendances.length;
  const presentCount = recentAttendances.filter(a => a.isPresent).length;
  const attendanceRate = totalAttendances > 0 ? Math.round((presentCount / totalAttendances) * 100) : 0;

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
            Öğrenci Listesine Dön
          </Button>
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {student.firstName[0]}{student.lastName[0]}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {student.firstName} {student.lastName}
                </h1>
                <div className="flex items-center gap-4 text-blue-100">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="capitalize">{student.gender === 'male' ? 'Erkek' : 'Kız'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(student.birthDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{studentCourses.length} Kurs</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-blue-100 text-sm">Devam Oranı</div>
                <div className="text-4xl font-bold">{attendanceRate}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Personal Information */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Kişisel Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Doğum Tarihi</div>
                    <div className="font-medium">{new Date(student.birthDate).toLocaleDateString('tr-TR')}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Cinsiyet</div>
                    <div className="font-medium capitalize">{student.gender === 'male' ? 'Erkek' : 'Kız'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Activity className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-600">Kayıt Tarihi</div>
                    <div className="font-medium">{new Date(student.createdAt).toLocaleDateString('tr-TR')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parent Contact */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Ebeveyn Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Anne Bilgileri */}
                {(student.motherFirstName || student.motherLastName || student.motherPhone) && (
                  <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-pink-600" />
                      <span className="font-medium text-pink-800">Anne Bilgileri</span>
                    </div>
                    <div className="space-y-2">
                      {(student.motherFirstName || student.motherLastName) && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Adı Soyadı:</span>
                          <span className="font-medium">
                            {[student.motherFirstName, student.motherLastName].filter(Boolean).join(' ') || '-'}
                          </span>
                        </div>
                      )}
                      {student.motherPhone && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Telefon:</span>
                          <span className="font-medium">{student.motherPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Baba Bilgileri */}
                {(student.fatherFirstName || student.fatherLastName || student.fatherPhone) && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Baba Bilgileri</span>
                    </div>
                    <div className="space-y-2">
                      {(student.fatherFirstName || student.fatherLastName) && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Adı Soyadı:</span>
                          <span className="font-medium">
                            {[student.fatherFirstName, student.fatherLastName].filter(Boolean).join(' ') || '-'}
                          </span>
                        </div>
                      )}
                      {student.fatherPhone && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Telefon:</span>
                          <span className="font-medium">{student.fatherPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Ebeveyn bilgisi yoksa */}
                {!student.motherFirstName && !student.motherLastName && !student.motherPhone && 
                 !student.fatherFirstName && !student.fatherLastName && !student.fatherPhone && (
                  <div className="text-center py-6">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Ebeveyn bilgisi bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attendance Stats */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Devam İstatistikleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                    <div className="text-sm text-green-700">Mevcut</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-600">{totalAttendances - presentCount}</div>
                    <div className="text-sm text-red-700">Yok</div>
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">{attendanceRate}%</div>
                  <div className="text-sm text-blue-700">Genel Devam Oranı</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Courses and Attendance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enrolled Courses */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-orange-600" />
                  Kayıtlı Kurslar ({studentCourses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Henüz hiçbir kursa kayıtlı değil</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {studentCourses.map((course) => (
                      <div key={course.id} className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{course.name}</h3>
                            <p className="text-sm text-gray-600">
                              Kayıt: {new Date(course.enrolledAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Attendance */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-indigo-600" />
                  Son Yoklama Kayıtları
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentAttendances.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Henüz yoklama kaydı bulunmuyor</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAttendances.map((attendance: any) => {
                      // Status field'ından durumu belirle
                      const status = attendance.status || (attendance.isPresent ? 'PRESENT' : 'ABSENT');
                      const isPresent = status === 'PRESENT';
                      const isExcused = status === 'EXCUSED';
                      
                      return (
                        <div key={attendance.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isPresent ? 'bg-green-100' : isExcused ? 'bg-yellow-100' : 'bg-red-100'
                            }`}>
                              {isPresent ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : isExcused ? (
                                <Calendar className="h-5 w-5 text-yellow-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{attendance.course.name}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(attendance.date).toLocaleDateString('tr-TR', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isPresent 
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : isExcused
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {isPresent ? 'Mevcut' : isExcused ? 'Mazeretli' : 'Yok'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}