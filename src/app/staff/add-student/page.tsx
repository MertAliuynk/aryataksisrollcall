'use client';

import { useState } from 'react';
import { api } from '../../../utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { 
  UserPlus, 
  User, 
  Phone, 
  Calendar,
  Save,
  ArrowLeft,
  CheckCircle,
  BookOpen
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddStudentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Kursları çek
  const { data: courses = [] } = api.course.getAll.useQuery();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    motherFirstName: '',
    motherLastName: '',
    motherPhone: '',
    fatherFirstName: '',
    fatherLastName: '',
    fatherPhone: '',
    birthDate: '',
    gender: 'male' as 'male' | 'female',
    courseLevelIds: [] as string[]
  });

  const createStudent = api.student.create.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/staff/students');
      }, 2000);
    },
    onError: (error) => {
      console.error('Öğrenci ekleme hatası:', error);
      alert('Öğrenci eklenirken bir hata oluştu!');
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCourseLevelToggle = (courseLevelId: string) => {
    setFormData(prev => ({
      ...prev,
      courseLevelIds: prev.courseLevelIds.includes(courseLevelId)
        ? prev.courseLevelIds.filter(id => id !== courseLevelId)
        : [...prev.courseLevelIds, courseLevelId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Temel bilgiler zorunlu
    if (!formData.firstName || !formData.lastName) {
      alert('Lütfen öğrenci adı ve soyadını doldurun!');
      return;
    }

    // En az bir ebeveyn bilgisi zorunlu
    const hasMotherInfo = formData.motherFirstName && formData.motherLastName;
    const hasFatherInfo = formData.fatherFirstName && formData.fatherLastName;
    
    if (!hasMotherInfo && !hasFatherInfo) {
      alert('Lütfen en az bir ebeveynin adı soyadını doldurun!');
      return;
    }

    if (formData.courseLevelIds.length === 0) {
      alert('Lütfen en az bir kurs seviyesi seçin!');
      return;
    }

    setIsSubmitting(true);
    
    createStudent.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      motherFirstName: formData.motherFirstName || undefined,
      motherLastName: formData.motherLastName || undefined,
      motherPhone: formData.motherPhone || undefined,
      fatherFirstName: formData.fatherFirstName || undefined,
      fatherLastName: formData.fatherLastName || undefined,
      fatherPhone: formData.fatherPhone || undefined,
      birthDate: formData.birthDate ? new Date(formData.birthDate) : new Date(),
      gender: formData.gender,
      courseLevelIds: formData.courseLevelIds
    });
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">Başarılı!</h2>
            <p className="text-green-600">
              Öğrenci başarıyla eklendi. Öğrenci listesine yönlendiriliyorsunuz...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
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
          
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Yeni Öğrenci Ekle</h1>
                <p className="text-blue-100">Öğrenci bilgilerini girerek sisteme kaydedin</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Kişisel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    Ad *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Öğrencinin adı"
                    className="mt-1"
                    required
                  />
                </div>
                <div className="min-w-0">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Soyad *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Öğrencinin soyadı"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <Label htmlFor="birthDate" className="text-sm font-medium text-gray-700">
                    Doğum Tarihi
                  </Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      className="pl-10 max-w-full"
                    />
                  </div>
                </div>
                <div className="min-w-0">
                  <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                    Cinsiyet
                  </Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Cinsiyet seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Erkek</SelectItem>
                      <SelectItem value="female">Kız</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Kurs Seviyeleri *
                  </Label>
                  <div className="mt-2 space-y-4">
                    {courses && courses.length > 0 ? (
                      courses.map((course) => (
                        <div key={course.id} className="border border-gray-200 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            {course.name}
                          </h4>
                          
                          {course.courseLevels && course.courseLevels.length > 0 ? (
                            <div className="space-y-2">
                              {course.courseLevels.map((level: any) => {
                                const levelInfo = {
                                  temel: { color: 'blue', label: 'Temel' },
                                  teknik: { color: 'purple', label: 'Teknik' },
                                  performans: { color: 'green', label: 'Performans' }
                                };
                                const info = levelInfo[level.level as keyof typeof levelInfo] || { color: 'gray', label: level.level };
                                
                                return (
                                  <div key={level.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                                    <input
                                      type="checkbox"
                                      id={`level-${level.id}`}
                                      checked={formData.courseLevelIds.includes(level.id)}
                                      onChange={() => handleCourseLevelToggle(level.id)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label 
                                      htmlFor={`level-${level.id}`}
                                      className="flex-1 text-sm cursor-pointer"
                                    >
                                      <span className="font-medium text-gray-800">
                                        {info.label}
                                      </span>
                                      <span className="text-gray-600 ml-2 text-xs">
                                        ({(() => {
                                          const raw = level.attendanceDays;
                                          const days: string[] = Array.isArray(raw)
                                            ? raw
                                            : typeof raw === 'string' && raw.length > 0
                                              ? raw.split(',')
                                              : [];

                                          const dayMap: { [key: string]: string } = {
                                            monday: 'Pzt', tuesday: 'Sal', wednesday: 'Çar',
                                            thursday: 'Per', friday: 'Cum', saturday: 'Cmt', sunday: 'Paz'
                                          };

                                          return days.map((day: string) => dayMap[day] || day).join(', ');
                                        })()})
                                      </span>
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic">Bu kurs için henüz seviye tanımlanmamış</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Henüz kurs bulunmuyor</p>
                    )}
                  </div>
                  {formData.courseLevelIds.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">En az bir kurs seviyesi seçmelisiniz</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Information */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Ebeveyn Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Anne Bilgileri */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Anne Bilgileri</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="min-w-0">
                    <Label htmlFor="motherFirstName" className="text-sm font-medium text-gray-700">
                      Anne Adı
                    </Label>
                    <Input
                      id="motherFirstName"
                      value={formData.motherFirstName}
                      onChange={(e) => handleInputChange('motherFirstName', e.target.value)}
                      placeholder="Anne adı"
                      className="mt-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="motherLastName" className="text-sm font-medium text-gray-700">
                      Anne Soyadı
                    </Label>
                    <Input
                      id="motherLastName"
                      value={formData.motherLastName}
                      onChange={(e) => handleInputChange('motherLastName', e.target.value)}
                      placeholder="Anne soyadı"
                      className="mt-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="motherPhone" className="text-sm font-medium text-gray-700">
                      Anne Telefonu
                    </Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="motherPhone"
                        value={formData.motherPhone}
                        onChange={(e) => handleInputChange('motherPhone', e.target.value)}
                        placeholder="0555 123 45 67"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Baba Bilgileri */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Baba Bilgileri</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="min-w-0">
                    <Label htmlFor="fatherFirstName" className="text-sm font-medium text-gray-700">
                      Baba Adı
                    </Label>
                    <Input
                      id="fatherFirstName"
                      value={formData.fatherFirstName}
                      onChange={(e) => handleInputChange('fatherFirstName', e.target.value)}
                      placeholder="Baba adı"
                      className="mt-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="fatherLastName" className="text-sm font-medium text-gray-700">
                      Baba Soyadı
                    </Label>
                    <Input
                      id="fatherLastName"
                      value={formData.fatherLastName}
                      onChange={(e) => handleInputChange('fatherLastName', e.target.value)}
                      placeholder="Baba soyadı"
                      className="mt-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="fatherPhone" className="text-sm font-medium text-gray-700">
                      Baba Telefonu
                    </Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fatherPhone"
                        value={formData.fatherPhone}
                        onChange={(e) => handleInputChange('fatherPhone', e.target.value)}
                        placeholder="0555 123 45 67"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                * En az bir ebeveynin adı soyadı doldurulmalıdır
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Öğrenciyi Kaydet
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}