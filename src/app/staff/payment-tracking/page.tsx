'use client';

import { useState } from 'react';
import { api } from '../../../utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { 
  Receipt, 
  Search, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Users,
  BarChart3
} from 'lucide-react';

type PaymentStatus = 'PAID' | 'PENDING' | 'EXCUSED';

export default function PaymentTrackingPage() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedCourseLevel, setSelectedCourseLevel] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // API queries
  const { data: courses } = api.course.getAll.useQuery();
  const { data: courseLevels } = api.course.getLevels.useQuery(
    selectedCourse,
    { enabled: !!selectedCourse }
  );

  const { data: paymentHistory } = api.payment.getPaymentHistory.useQuery(
    {
      courseId: selectedCourse,
      courseLevelId: selectedCourseLevel,
      year: selectedYear,
    },
    { enabled: !!selectedCourse && !!selectedCourseLevel }
  );

  const { data: paymentStats } = api.payment.getPaymentStats.useQuery({
    courseId: selectedCourse || undefined,
    courseLevelId: selectedCourseLevel || undefined,
    year: selectedYear,
  });

  const years = [2024, 2025, 2026, 2027, 2028];

  const months = [
    { value: 1, label: 'Ocak' },
    { value: 2, label: 'Şubat' },
    { value: 3, label: 'Mart' },
    { value: 4, label: 'Nisan' },
    { value: 5, label: 'Mayıs' },
    { value: 6, label: 'Haziran' },
    { value: 7, label: 'Temmuz' },
    { value: 8, label: 'Ağustos' },
    { value: 9, label: 'Eylül' },
    { value: 10, label: 'Ekim' },
    { value: 11, label: 'Kasım' },
    { value: 12, label: 'Aralık' },
  ];

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Ödendi</Badge>;
      case 'PENDING':
        return <Badge className="bg-red-100 text-red-800">Ödenmedi</Badge>;
      case 'EXCUSED':
        return <Badge className="bg-yellow-100 text-yellow-800">Mazeretli</Badge>;
      default:
        return <Badge variant="secondary">Bilinmiyor</Badge>;
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-red-600" />;
      case 'EXCUSED':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMonthName = (month: number) => {
    return months.find(m => m.value === month)?.label || `${month}. Ay`;
  };

  // Filter payments by search term
  const filteredPayments = paymentHistory?.filter(payment => {
    if (!searchTerm) return true;
    const fullName = `${payment.student.firstName} ${payment.student.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  }) || [];

  // Group payments by student and month
  const groupedPayments = filteredPayments.reduce((acc, payment) => {
    const studentKey = `${payment.student.firstName} ${payment.student.lastName}`;
    if (!acc[studentKey]) {
      acc[studentKey] = {
        student: payment.student,
        payments: {},
      };
    }
    acc[studentKey].payments[payment.month] = payment;
    return acc;
  }, {} as Record<string, { student: any; payments: Record<number, any> }>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Receipt className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Ödeme Takibi</h1>
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtreleme ve Arama
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Yıl</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Kurs</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Kurs seçin" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Kurs Seviyesi</label>
              <Select 
                value={selectedCourseLevel} 
                onValueChange={setSelectedCourseLevel}
              >
                <SelectTrigger disabled={!selectedCourse}>
                  <SelectValue placeholder="Seviye seçin" />
                </SelectTrigger>
                <SelectContent>
                  {courseLevels?.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.level.charAt(0).toUpperCase() + level.level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Öğrenci Ara</label>
              <Input
                placeholder="Öğrenci ismi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İstatistikler */}
      {paymentStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Ödenen</p>
                  <p className="text-lg font-semibold text-green-600">
                    {paymentStats.stats.find(s => s.status === 'PAID')?._count.status || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ödenmedi</p>
                  <p className="text-lg font-semibold text-red-600">
                    {paymentStats.stats.find(s => s.status === 'PENDING')?._count.status || 0}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mazeretli</p>
                  <p className="text-lg font-semibold text-yellow-600">
                    {paymentStats.stats.find(s => s.status === 'EXCUSED')?._count.status || 0}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Tutar</p>
                  <p className="text-lg font-semibold text-blue-600">
                    ₺{paymentStats.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ödeme Geçmişi Tablosu */}
      {selectedCourse && selectedCourseLevel && Object.keys(groupedPayments).length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Aylık Ödeme Durumları ({Object.keys(groupedPayments).length} öğrenci)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Öğrenci</th>
                    {months.map(month => (
                      <th key={month.value} className="text-center p-2 font-semibold min-w-[100px]">
                        {month.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedPayments).map(([studentName, data]) => (
                    <tr key={studentName} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{studentName}</td>
                      {months.map(month => {
                        const payment = data.payments[month.value];
                        return (
                          <td key={month.value} className="text-center p-2">
                            {payment ? (
                              <div className="space-y-1">
                                {getStatusBadge(payment.status)}
                                {payment.amount && (
                                  <div className="text-xs text-gray-600">
                                    ₺{payment.amount.toLocaleString('tr-TR')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : selectedCourse && selectedCourseLevel ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Bu kriterlerde ödeme kaydı bulunamadı.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Ödeme takibi için kurs ve kurs seviyesi seçin.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}