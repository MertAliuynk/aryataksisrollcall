'use client';

import { api } from '../../../utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { 
  Users, 
  ClipboardCheck, 
  TrendingUp, 
  Calendar,
  Award,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Activity,
  BookOpen
} from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function StaffDashboard() {
  const router = useRouter();
  // Dashboard istatistikleri
  const { data: students } = api.student.getAll.useQuery({});
  const { data: courses } = api.course.getAll.useQuery();
  const { data: attendances } = api.attendance.getAllStudentsRecentAttendances.useQuery({});

  const stats = [
    {
      icon: Users,
      label: 'Toplam Öğrenci',
      value: students?.length || 0,
      color: 'bg-blue-500',
      trend: students?.length ? `${students.length} kayıtlı` : 'Henüz öğrenci yok',
      description: 'Sisteme kayıtlı'
    },
    {
      icon: Calendar,
      label: 'Aktif Kurslar',
      value: courses?.length || 0,
      color: 'bg-green-500',
      trend: courses?.length ? `${courses.length} kurs` : 'Henüz kurs yok',
      description: 'Devam eden kurslar'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Hoş Geldiniz! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Bugün {new Date().toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <Award className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-gray-600 font-medium mb-1">
                    {stat.label}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* System Status */}
        <Card className="lg:col-span-2 shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Sistem Durumu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-900">
                  Veritabanı Bağlantısı Aktif
                </p>
                <p className="text-sm text-green-600">
                  Tüm veriler güncel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-blue-900">
                  Öğrenci Sistemi Hazır
                </p>
                <p className="text-sm text-blue-600">
                  {students?.length || 0} öğrenci kaydı mevcut
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-purple-900">
                  Kurs Yönetimi Aktif
                </p>
                <p className="text-sm text-purple-600">
                  {courses?.length || 0} aktif kurs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Hızlı İşlemler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button 
              onClick={() => router.push('/staff/add-student')}
              className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-left group"
            >
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5" />
                <div>
                  <p className="font-medium">Yeni Öğrenci Ekle</p>
                  <p className="text-sm text-blue-100">Hızlı kayıt işlemi</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => router.push('/staff/take-attendance')}
              className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 text-left group"
            >
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5" />
                <div>
                  <p className="font-medium">Yoklama Al</p>
                  <p className="text-sm text-green-100">Günlük devam kontrolü</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => router.push('/staff/create-course')}
              className="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 text-left group"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5" />
                <div>
                  <p className="font-medium">Yeni Kurs Oluştur</p>
                  <p className="text-sm text-purple-100">Kurs tanımla ve program oluştur</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card className="shadow-md border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Kurs Programı
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses && courses.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {courses.slice(0, 3).map((course, index) => {
                const colors = [
                  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
                  { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
                  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' }
                ];
                const color = colors[index % 3];
                
                return (
                  <div key={course.id} className={`${color.bg} p-4 rounded-xl border ${color.border}`}>
                    <h4 className={`font-semibold ${color.text} mb-2`}>{course.name}</h4>
                    <p className={`text-sm ${color.text.replace('800', '600')}`}>
                      Aktif kurs
                    </p>
                    <p className="text-sm text-gray-600">
                      Kurs ID: {course.id.slice(0, 8)}...
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Henüz kurs bulunmuyor</p>
              <p className="text-sm text-gray-500">Kurs eklemek için yöneticiye başvurun</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}