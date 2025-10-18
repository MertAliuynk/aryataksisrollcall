'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../utils/trpc';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { 
  CreditCard, 
  Calendar, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  DollarSign,
  FileText
} from 'lucide-react';

type PaymentStatus = 'PAID' | 'PENDING' | 'EXCUSED';

export default function PaymentControlPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedCourseLevel, setSelectedCourseLevel] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [students, setStudents] = useState<any[]>([]);
  const [hasPaymentControl, setHasPaymentControl] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<{[key: string]: {status: PaymentStatus, amount?: number, notes?: string}}>({});

  // API queries
  const { data: courses } = api.course.getAll.useQuery();
  const { data: courseLevels } = api.course.getLevels.useQuery(
    selectedCourse,
    { enabled: !!selectedCourse }
  );

  // Debug için
  console.log('Selected Course:', selectedCourse);
  console.log('Course Levels:', courseLevels);

  const { data: paymentControlCheck } = api.payment.checkMonthlyPaymentControl.useQuery(
    {
      courseId: selectedCourse,
      courseLevelId: selectedCourseLevel,
      month: selectedMonth,
      year: selectedYear,
    },
    { enabled: !!selectedCourse && !!selectedCourseLevel }
  );

  const { data: studentsData } = api.payment.getStudentsForPaymentControl.useQuery(
    {
      courseId: selectedCourse,
      courseLevelId: selectedCourseLevel,
      month: selectedMonth,
      year: selectedYear,
    },
    { enabled: !!selectedCourse && !!selectedCourseLevel }
  );

  const updatePaymentMutation = api.payment.updatePaymentStatus.useMutation({
    onSuccess: () => {
      // Refresh data after successful update
      window.location.reload();
    },
  });

  useEffect(() => {
    if (paymentControlCheck) {
      setHasPaymentControl(paymentControlCheck.hasPaymentControl);
    }
  }, [paymentControlCheck]);

  useEffect(() => {
    if (studentsData) {
      setStudents(studentsData);
      // Initialize payment data
      const initialPaymentData: {[key: string]: {status: PaymentStatus, amount?: number, notes?: string}} = {};
      studentsData.forEach((student: any) => {
        if (student.payment) {
          initialPaymentData[student.studentId] = {
            status: student.payment.status,
            amount: student.payment.amount,
            notes: student.payment.notes,
          };
        } else {
          initialPaymentData[student.studentId] = {
            status: 'PENDING',
          };
        }
      });
      setPaymentData(initialPaymentData);
    }
  }, [studentsData]);

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

  const years = [2024, 2025, 2026, 2027, 2028];

  const handlePaymentStatusChange = (studentId: string, status: PaymentStatus) => {
    setPaymentData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      }
    }));
  };

  const handlePaymentAmountChange = (studentId: string, amount: string) => {
    const numericAmount = parseFloat(amount) || 0;
    setPaymentData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        amount: numericAmount,
      }
    }));
  };

  const handlePaymentNotesChange = (studentId: string, notes: string) => {
    setPaymentData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      }
    }));
  };

  const handleSavePayments = async () => {
    try {
      const promises = students.map(student => {
        const data = paymentData[student.studentId];
        return updatePaymentMutation.mutateAsync({
          studentId: student.studentId,
          courseId: selectedCourse,
          courseLevelId: selectedCourseLevel,
          month: selectedMonth,
          year: selectedYear,
          status: data.status,
          amount: data.amount,
          notes: data.notes,
        });
      });

      await Promise.all(promises);
      alert('Ödeme durumları başarıyla güncellendi!');
    } catch (error) {
      alert('Hata oluştu: ' + (error as Error).message);
    }
  };

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Ödeme Kontrolü</h1>
      </div>

      {/* Kurs ve Tarih Seçimi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Kurs ve Dönem Seçimi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="block text-sm font-medium mb-2">Ay</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </div>
        </CardContent>
      </Card>

      {/* Uyarı Mesajı */}
      {hasPaymentControl && selectedCourse && selectedCourseLevel && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Bu ay için ödeme kontrolü daha önce yapılmış. Mevcut kayıtları güncelleyebilirsiniz.
          </AlertDescription>
        </Alert>
      )}

      {/* Öğrenci Listesi */}
      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Öğrenci Ödeme Durumları ({students.length} öğrenci)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.studentId} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {student.student.firstName} {student.student.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {student.course.name} - {student.courseLevel.level.charAt(0).toUpperCase() + student.courseLevel.level.slice(1)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(paymentData[student.studentId]?.status || 'PENDING')}
                      {getStatusBadge(paymentData[student.studentId]?.status || 'PENDING')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ödeme Durumu</label>
                      <Select
                        value={paymentData[student.studentId]?.status || 'PENDING'}
                        onValueChange={(value: string) => handlePaymentStatusChange(student.studentId, value as PaymentStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PAID">Ödendi</SelectItem>
                          <SelectItem value="PENDING">Ödenmedi</SelectItem>
                          <SelectItem value="EXCUSED">Mazeretli</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        Tutar (₺)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={paymentData[student.studentId]?.amount || ''}
                        onChange={(e) => handlePaymentAmountChange(student.studentId, e.target.value)}
                        placeholder="Ödeme tutarı"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <FileText className="h-4 w-4 inline mr-1" />
                        Notlar
                      </label>
                      <Textarea
                        value={paymentData[student.studentId]?.notes || ''}
                        onChange={(e) => handlePaymentNotesChange(student.studentId, e.target.value)}
                        placeholder="Ek notlar..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleSavePayments}
                disabled={updatePaymentMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updatePaymentMutation.isPending ? 'Kaydediliyor...' : 'Ödeme Durumlarını Kaydet'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Boş Durum */}
      {selectedCourse && selectedCourseLevel && students.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Bu kurs seviyesinde öğrenci bulunamadı.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}