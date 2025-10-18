'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../../utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { 
  ArrowLeft,
  BookOpen, 
  Users, 
  Calendar, 
  CheckCircle,
  User,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Pazartesi', short: 'Pzt' },
  { key: 'tuesday', label: 'Salı', short: 'Sal' },
  { key: 'wednesday', label: 'Çarşamba', short: 'Çar' },
  { key: 'thursday', label: 'Perşembe', short: 'Per' },
  { key: 'friday', label: 'Cuma', short: 'Cum' },
  { key: 'saturday', label: 'Cumartesi', short: 'Cmt' },
  { key: 'sunday', label: 'Pazar', short: 'Paz' }
];

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  // Kurs detaylarını çek
  const { data: course, isLoading } = api.course.getById.useQuery(courseId);
  
  // Kurs öğrencilerini çek
  const { data: students = [] } = api.student.getByCourse.useQuery(courseId);
  
  // Kurs için son yoklamaları çek
  const { data: recentAttendances = [] } = api.attendance.getRecentByCourse.useQuery(courseId);

  const getDayLabels = (attendanceDays: string[]) => {
    return attendanceDays.map(dayKey => {
      const day = DAYS_OF_WEEK.find(d => d.key === dayKey);
      return day?.label || dayKey;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="max-w-6xl mx-auto">
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
        <div className="max-w-6xl mx-auto">
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kurslara Dön
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.name}</h1>
              <p className="text-gray-600">Kurs Detayları ve Öğrenci Bilgileri</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Kurs Bilgileri */}
          <div className="lg:col-span-2 space-y-6">
            {/* Temel Bilgiler */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Kurs Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Kurs Adı</label>
                    <p className="text-lg font-semibold">{course.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Kayıtlı Öğrenci Sayısı</label>
                    <p className="text-lg">{course.studentCount || 0}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Kurs Günleri</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getDayLabels(course.courseLevels?.[0]?.attendanceDays?.split(',') || []).map((day, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-gray-700">Oluşturulma Tarihi</label>
                  <p className="text-gray-600">{new Date(course.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Öğrenci Listesi */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Kayıtlı Öğrenciler ({students.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Bu kursta henüz kayıtlı öğrenci yok.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.map((student: any) => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold">{student.firstName} {student.lastName}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {student.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{student.phone}</span>
                                </div>
                              )}
                              {student.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  <span>{student.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Aktif
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Yan Panel - İstatistikler */}
          <div className="space-y-6">
            {/* Kurs İstatistikleri */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  İstatistikler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                  <div className="text-sm text-gray-600">Kayıtlı Öğrenci</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{course.attendanceDays.length}</div>
                  <div className="text-sm text-gray-600">Haftalık Ders Günü</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{recentAttendances.length}</div>
                  <div className="text-sm text-gray-600">Son Yoklama</div>
                </div>
              </CardContent>
            </Card>

            {/* Hızlı İşlemler */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push(`/staff/take-attendance?courseId=${courseId}`)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Yoklama Al
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push(`/staff/attendance-tracking?courseId=${courseId}`)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Yoklama Takip
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push(`/staff/students?courseId=${courseId}`)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Öğrenci Yönetimi
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}