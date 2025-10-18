'use client';

import { useState, useEffect } from 'react';
import { api } from '../../utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  GraduationCap,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StaffLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showInitialSetup, setShowInitialSetup] = useState(false);

  // Staff sayısını kontrol et
  const { data: staffCount } = api.auth.getStaffCount.useQuery();

  // Login mutation
  const loginMutation = api.auth.login.useMutation({
    onSuccess: (data) => {
      // Token'ı localStorage'a kaydet
      localStorage.setItem('staffToken', data.token);
      localStorage.setItem('staffData', JSON.stringify(data.staff));
      
      // Staff paneline yönlendir
      router.push('/staff/dashboard');
    },
    onError: (error) => {
      setError(error.message);
      setIsSubmitting(false);
    }
  });

  // İlk kurulum kontrolü
  useEffect(() => {
    if (staffCount?.count === 0) {
      setShowInitialSetup(true);
    }
  }, [staffCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!username.trim() || !password.trim()) {
      setError('Kullanıcı adı ve şifre gerekli');
      setIsSubmitting(false);
      return;
    }

    loginMutation.mutate({
      username: username.trim(),
      password: password,
    });
  };

  if (showInitialSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              İlk Kurulum
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Sisteme ilk admin kullanıcısını eklemeniz gerekiyor
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/setup')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              İlk Admin Oluştur
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Çalışan Girişi
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Yönetim paneline erişmek için giriş yapın
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Kullanıcı adınızı girin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-11"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </Button>

            {/* Helper Text */}
            <div className="text-center pt-4">
              <p className="text-xs text-gray-500">
                Giriş bilgilerinizi unuttuysan, sistem yöneticisine başvurun
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}