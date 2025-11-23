'use client';

import { useState, useEffect } from 'react';
import { api } from '../../../utils/trpc';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { 
  Search, 
  Plus, 
  Edit, 
  Filter, 
  Users, 
  GraduationCap, 
  Mail, 
  Phone, 
  Grid3X3, 
  List,
  Calendar,
  IdCard,
  MapPin,
  UserCheck,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ViewMode = 'card' | 'table';

export default function StaffStudentsPage() {
  const router = useRouter();
  const ctx = api.useContext();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [birthDateFrom, setBirthDateFrom] = useState<string>('');
  const [birthDateTo, setBirthDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<'firstName' | 'lastName' | 'createdAt' | 'birthDate'>('firstName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Öğrencileri getir
  const queryParams = {
    search: debouncedSearch || undefined,
    courseId: selectedCourse || undefined,
    gender: (selectedGender && selectedGender !== '') ? selectedGender as 'male' | 'female' : undefined,
    level: (selectedLevel && selectedLevel !== '') ? selectedLevel as 'temel' | 'teknik' | 'performans' : undefined,
    birthDateFrom: birthDateFrom ? new Date(birthDateFrom) : undefined,
    birthDateTo: birthDateTo ? new Date(birthDateTo) : undefined,
    sortBy,
    sortOrder,
  };
  
  const { data: students, isLoading } = api.student.getAllWithFilters.useQuery(queryParams);

  const deleteStudent = api.student.delete.useMutation({
    onSuccess: async () => {
      await ctx.student.getAllWithFilters.invalidate();
    }
  });

  // Kursları getir (filtreleme için)
  const { data: courses } = api.course.getAll.useQuery();

  const resetFilters = () => {
    setSearch('');
    setSelectedCourse('');
    setSelectedGender('');
    setSelectedLevel('');
    setBirthDateFrom('');
    setBirthDateTo('');
    setSortBy('firstName');
    setSortOrder('asc');
  };

  const getGenderLabel = (gender: string) => {
    return gender === 'male' ? 'Erkek' : 'Kız';
  };

  const getGenderBadgeColor = (gender: string) => {
    return gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800';
  };

  // Yaş hesaplama fonksiyonu
  const calculateAge = (birthDate: string | Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Tarih formatlama fonksiyonu
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  // TC kimlik maskeleme fonksiyonu
  const maskTcNumber = (tc: string) => {
    if (!tc || tc.length !== 11) return tc;
    return tc.substring(0, 3) + '*****' + tc.substring(8);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              Öğrenci Listesi
            </h1>
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl px-4 py-6 lg:p-8 text-white overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Users className="h-8 w-8" />
              Öğrenci Yönetimi
            </h1>
            <p className="text-blue-100 text-lg">
              Toplam {students?.length || 0} öğrenci kayıtlı
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Görünüm Seçimi */}
            <div className="flex bg-white/20 rounded-lg p-1">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className={`${
                  viewMode === 'card' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-white hover:bg-white/30'
                }`}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Kart
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={`${
                  viewMode === 'table' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-white hover:bg-white/30'
                }`}
              >
                <List className="h-4 w-4 mr-2" />
                Tablo
              </Button>
            </div>
            
            <Link href="/staff/add-student">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Yeni Öğrenci Ekle
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
          <CardTitle className="flex items-center gap-3 text-gray-800">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold">Gelişmiş Filtreleme</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Arama */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Search className="h-4 w-4" />
                Öğrenci Arama
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Öğrenci ara... (örn: Mehmet, Özkan, Mehmet Özkan)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                />
                {search && (
                  <div className="absolute right-3 top-3 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-md">
                    {search.includes(' ') ? '🔍 Tam isim' : '📝 İsim/Soyisim'}
                  </div>
                )}
              </div>
            </div>

            {/* Kurs Filtresi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                📚 Kurs Filtresi
              </label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-200">
                  <span className="flex-1 text-left">
                    {selectedCourse && selectedCourse !== '' 
                      ? courses?.find(course => course.id === selectedCourse)?.name || "Kurs seç"
                      : "Tüm Kurslar"
                    }
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm Kurslar</SelectItem>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cinsiyet Filtresi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                👥 Cinsiyet
              </label>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-200">
                  <SelectValue placeholder="Cinsiyet seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  <SelectItem value="male">Erkek</SelectItem>
                  <SelectItem value="female">Kız</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Doğum Tarihi Aralığı Filtresi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                📅 Doğum Tarihi Aralığı
              </label>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500">Başlangıç Tarihi</label>
                  <Input
                    type="date"
                    value={birthDateFrom}
                    onChange={(e) => setBirthDateFrom(e.target.value)}
                    className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                    placeholder="2020-01-01"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Bitiş Tarihi</label>
                  <Input
                    type="date"
                    value={birthDateTo}
                    onChange={(e) => setBirthDateTo(e.target.value)}
                    className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                    placeholder="2025-12-31"
                  />
                </div>
              </div>
            </div>

            {/* Sıralama */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                📊 Sıralama
              </label>
              <Select 
                value={`${sortBy}-${sortOrder}`} 
                onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field as 'firstName' | 'lastName' | 'createdAt' | 'birthDate');
                  setSortOrder(order as 'asc' | 'desc');
                }}
              >
                <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-200">
                  <SelectValue placeholder="Sıralama seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="firstName-asc">İsme göre (A-Z)</SelectItem>
                  <SelectItem value="firstName-desc">İsme göre (Z-A)</SelectItem>
                  <SelectItem value="lastName-asc">Soyisime göre (A-Z)</SelectItem>
                  <SelectItem value="lastName-desc">Soyisime göre (Z-A)</SelectItem>
                  <SelectItem value="birthDate-asc">Yaşa göre (Küçük-Büyük)</SelectItem>
                  <SelectItem value="birthDate-desc">Yaşa göre (Büyük-Küçük)</SelectItem>
                  <SelectItem value="createdAt-desc">Yeni kayıtlar önce</SelectItem>
                  <SelectItem value="createdAt-asc">Eski kayıtlar önce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Seviye Filtresi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Seviye</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-200">
                  <SelectValue placeholder="Seviye seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tümü</SelectItem>
                  <SelectItem value="temel">Temel</SelectItem>
                  <SelectItem value="teknik">Teknik</SelectItem>
                  <SelectItem value="performans">Performans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={resetFilters} variant="outline" size="sm">
              🗑️ Filtreleri Temizle
            </Button>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>{students?.length || 0} öğrenci bulundu</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Display */}
      {viewMode === 'table' ? (
        /* Tablo Görünümü */
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5 text-blue-600" />
              Öğrenci Tablosu
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Öğrenci Bilgileri
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      İletişim
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kişisel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Kurslar
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students?.map((student: any) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                          </div>
                          <div className="ml-3 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <IdCard className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{maskTcNumber(student.tcNumber)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-900 min-w-0">
                          {/* Mother */}
                          <div className="text-xs text-gray-500">Anne</div>
                          <div className="flex items-center gap-1 mb-2">
                            <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {[student.motherFirstName, student.motherLastName].filter(Boolean).join(' ') || '—'}
                              {student.motherPhone ? (
                                <span className="text-xs text-gray-500"> {` • ${student.motherPhone}`}</span>
                              ) : null}
                            </span>
                          </div>

                          {/* Father */}
                          <div className="text-xs text-gray-500">Baba</div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {[student.fatherFirstName, student.fatherLastName].filter(Boolean).join(' ') || '—'}
                              {student.fatherPhone ? (
                                <span className="text-xs text-gray-500"> {` • ${student.fatherPhone}`}</span>
                              ) : null}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${getGenderBadgeColor(student.gender)} text-xs`}>
                              {getGenderLabel(student.gender)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            {student.birthDate ? (
                              <>
                                <span className="hidden sm:inline">{formatDate(student.birthDate)} </span>
                                <span>({calculateAge(student.birthDate)} yaş)</span>
                              </>
                            ) : (
                              'Doğum tarihi yok'
                            )}
                          </div>
                          {student.address && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 md:hidden">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{student.address.length > 15 ? student.address.substring(0, 15) + '...' : student.address}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {student.courses?.length > 0 ? (
                            student.courses.slice(0, 2).map((course: any) => (
                              <Badge 
                                key={course.id} 
                                variant="secondary" 
                                className="text-xs bg-blue-100 text-blue-800"
                              >
                                {course.name} {course.level ? `• ${course.level === 'temel' ? 'Temel' : course.level === 'teknik' ? 'Teknik' : 'Performans'}` : ''}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">Kurs kaydı yok</span>
                          )}
                          {student.courses?.length > 2 && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                              +{student.courses.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/staff/students/${student.id}`)}
                            className="h-8 w-8 p-0"
                            title="Görüntüle"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/staff/students/${student.id}/edit`)}
                            className="h-8 w-8 p-0"
                            title="Düzenle"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              const ok = confirm('Bu öğrenciyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.');
                              if (!ok) return;
                              try {
                                await deleteStudent.mutateAsync({ id: student.id });
                              } catch (e) {
                                console.error(e);
                                alert('Silme işlemi sırasında hata oluştu');
                              }
                            }}
                            className="h-8 w-8 p-0"
                            title="Sil"
                          >
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Kart Görünümü */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students?.map((student: any) => (
            <Card 
              key={student.id} 
              className="hover:shadow-lg transition-all duration-300 group border-0 shadow-md cursor-pointer hover:scale-[1.02]"
              onClick={() => router.push(`/staff/students/${student.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {student.firstName} {student.lastName}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${getGenderBadgeColor(student.gender)} text-xs`}>
                          {getGenderLabel(student.gender)}
                        </Badge>
                        {student.birthDate && (
                          <span className="text-xs text-gray-500">
                            {calculateAge(student.birthDate)} yaş
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Kişisel Bilgiler */}
                <div className="text-sm">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <IdCard className="h-3 w-3" />
                    <span>TC: {maskTcNumber(student.tcNumber)}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Phone className="h-3 w-3" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                  {student.birthDate && (
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(student.birthDate)}</span>
                    </div>
                  )}
                </div>

                {/* Kurslar */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    Kayıtlı Kurslar:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {student.courses?.length > 0 ? (
                      student.courses.map((course: any) => (
                        <Badge 
                          key={course.id} 
                          variant="secondary" 
                          className="text-xs bg-blue-100 text-blue-800"
                        >
                          {course.name} {course.level ? `• ${course.level === 'temel' ? 'Temel' : course.level === 'teknik' ? 'Teknik' : 'Performans'}` : ''}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">Henüz kurs kaydı yok</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 group-hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/staff/students/${student.id}/edit`);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Düzenle
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/staff/take-attendance?courseId=${student.courses?.[0]?.id}&studentId=${student.id}`);
                    }}
                  >
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Yoklama
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const ok = confirm('Bu öğrenciyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.');
                      if (!ok) return;
                      try {
                        await deleteStudent.mutateAsync({ id: student.id });
                      } catch (err) {
                        console.error(err);
                        alert('Silme sırasında hata oluştu');
                      }
                    }}
                    className="flex-1"
                  >
                    Sil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {students?.length === 0 && (
        <Card className="text-center py-16 border-0 shadow-md">
          <CardContent>
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search || selectedCourse || selectedGender ? 'Öğrenci bulunamadı' : 'Henüz öğrenci yok'}
            </h3>
            <p className="text-gray-600 mb-4">
              {search || selectedCourse || selectedGender 
                ? 'Arama kriterlerinizi değiştirip tekrar deneyin.'
                : 'İlk öğrenciyi ekleyerek başlayın.'
              }
            </p>
            {!(search || selectedCourse || selectedGender) && (
              <Link href="/staff/add-student">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Öğrenciyi Ekle
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}