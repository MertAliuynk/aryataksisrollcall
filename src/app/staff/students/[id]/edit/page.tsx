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
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

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

  // Öğrenci verilerini form alanlarına yükle
  useEffect(() => {
    if (student) {
      setFirstName(student.firstName);
      setLastName(student.lastName);
      setPhone(student.phone || '');
      setParentName(student.parentName);
      setParentPhone(student.parentPhone);
      setBirthDate(student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : '');
      setGender(student.gender as 'male' | 'female');
    }
  }, [student]);

  // Öğrencinin kurslarını yükle
  useEffect(() => {
    if (studentCourses) {
      setSelectedCourses(studentCourses.map((course: any) => course.id));
    }
  }, [studentCourses]);

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim() || !parentName.trim() || !parentPhone.trim() || !birthDate || selectedCourses.length === 0) {
      alert('Lütfen tüm zorunlu alanları doldurun ve en az bir kurs seçin.');
      return;
    }

    updateStudent.mutate({
      id: studentId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || undefined,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      birthDate: new Date(birthDate),
      gender,
      courseIds: selectedCourses,
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

            {/* Veli Bilgileri */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Veli Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="parentName" className="text-sm font-medium text-gray-700">
                    Veli Adı *
                  </Label>
                  <Input
                    id="parentName"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Veli adı soyadı"
                    className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentPhone" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Veli Telefonu *
                  </Label>
                  <Input
                    id="parentPhone"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="Veli telefon numarası"
                    className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                  />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course: any) => (
                    <div key={course.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={() => handleCourseToggle(course.id)}
                      />
                      <Label htmlFor={`course-${course.id}`} className="flex-1 cursor-pointer">
                        <span className="font-medium">{course.name}</span>
                        <span className="block text-sm text-gray-500">{course.description}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Henüz kurs bulunmuyor.</p>
              )}
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