"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  Settings, 
  ChevronRight,
  Trophy,
  Target,
  Calendar,
  CheckCircle,
  ArrowRight,
  Sparkles,
  UserCheck,
  Shield,
  Eye
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationType, setNavigationType] = useState<'staff' | 'parent' | null>(null);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigation = (path: string, type: 'staff' | 'parent') => {
    setNavigationType(type);
    setIsNavigating(true);
    
    // Animasyon süresi
    setTimeout(() => {
      router.push(path);
    }, 800); // 800ms animasyon süresi
  };

  const features = [
    {
      icon: Users,
      title: "Öğrenci Yönetimi",
      description: "Öğrencileri kolayca ekleyin, düzenleyin ve takip edin",
      color: "bg-blue-500",
      path: "/students",
      role: "staff"
    },
    {
      icon: ClipboardCheck,
      title: "Yoklama Alma",
      description: "Hızlı ve pratik yoklama alma sistemi",
      color: "bg-green-500",
      path: "/attendance",
      role: "staff"
    },
    {
      icon: BarChart3,
      title: "Raporlar",
      description: "Detaylı yoklama takibi ve istatistikler",
      color: "bg-purple-500",
      path: "/reports",
      role: "both"
    },
    {
      icon: Settings,
      title: "Yönetim",
      description: "Kurs ve sistem ayarlarını yönetin",
      color: "bg-orange-500",
      path: "/management",
      role: "staff"
    }
  ];

  const loginTypes = [
    {
      icon: Shield,
      title: "Çalışan Girişi",
      description: "Öğretmen ve yöneticiler için tam sistem erişimi",
      color: "bg-gradient-to-r from-blue-500 to-blue-700",
      path: "/students",
      type: "staff",
      features: ["Öğrenci Yönetimi", "Yoklama Alma", "Raporlar", "Sistem Yönetimi"]
    },
    {
      icon: Eye,
      title: "Veli Girişi", 
      description: "Sadece çocuğunuzun yoklama durumunu görüntüleyin",
      color: "bg-gradient-to-r from-green-500 to-green-700",
      path: "/parent-reports",
      type: "parent",
      features: ["Yoklama Takibi", "Devam Durumu", "İstatistikler"]
    }
  ];

  const stats = [
    { icon: Target, label: "Aktif Kurslar", value: "12+", color: "text-blue-600" },
    { icon: Calendar, label: "Günlük Yoklama", value: "50+", color: "text-green-600" },
    { icon: CheckCircle, label: "Kayıtlı Öğrenci", value: "200+", color: "text-purple-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden relative">
      {/* Animated Background Elements - Extended */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Additional background elements for full coverage */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-1000"></div>
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-3000"></div>
        <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-5000"></div>
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/30 backdrop-blur-[1px]"></div>
      </div>

      <div className={`relative z-10 min-h-screen transition-all duration-500 ${isNavigating ? 'fade-out' : ''}`}>
        {/* Header */}
        <header className="px-6 py-4 backdrop-blur-md bg-white/10 border-b border-white/20">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className={`flex items-center space-x-3 transition-all duration-1000 ease-out ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">
                AryaTAKSİS
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleNavigation('/students', 'staff')}
                size="sm"
                disabled={isNavigating}
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-4 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Shield className="mr-1 h-3 w-3" />
                {isNavigating && navigationType === 'staff' ? 'Yönlendiriliyor...' : 'Çalışan'}
              </Button>
              <Button 
                onClick={() => handleNavigation('/parent-reports', 'parent')}
                size="sm"
                variant="outline"
                disabled={isNavigating}
                className="border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white px-4 transition-all duration-300 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="mr-1 h-3 w-3" />
                {isNavigating && navigationType === 'parent' ? 'Yönlendiriliyor...' : 'Veli'}
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className={`transition-all duration-1000 ease-out delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2 mb-6 animate-float">
                <Sparkles className="h-4 w-4 text-blue-600 mr-2 animate-pulse-slow" />
                <span className="text-sm font-medium text-blue-700">Modern Yoklama Takip Sistemi</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-gradient block">
                  Yoklama Takibi
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Artık Çok Kolay
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Spor kulübünüzün tüm yoklama işlemlerini dijital ortamda yönetin. 
                Hızlı, güvenilir ve kullanıcı dostu arayüzle tanışın.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => handleNavigation('/staff-login', 'staff')}
                  disabled={isNavigating}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Shield className="mr-2 h-5 w-5" />
                  {isNavigating && navigationType === 'staff' ? 'Yönlendiriliyor...' : 'Çalışan Girişi'}
                  {!(isNavigating && navigationType === 'staff') && <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </Button>
                <Button 
                  size="lg"
                  onClick={() => handleNavigation('/parent-reports', 'parent')}
                  disabled={isNavigating}
                  className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  {isNavigating && navigationType === 'parent' ? 'Yönlendiriliyor...' : 'Veli Girişi'}
                  {!(isNavigating && navigationType === 'parent') && <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto transition-all duration-1000 ease-out delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              {stats.map((stat, index) => (
                <Card key={index} className="text-center card-hover bg-white/50 backdrop-blur-sm border border-white/20">
                  <CardContent className="p-6">
                    <div className="relative">
                      <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color} animate-float`} style={{animationDelay: `${index * 0.5}s`}} />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse-slow"></div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1 counter" data-target={stat.value}>{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Login Types Section */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className={`text-center mb-16 transition-all duration-1000 ease-out delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Giriş Türleri
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Rolünüze uygun giriş tipini seçin ve size özel özelliklere erişin
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {loginTypes.map((loginType, index) => (
                <Card 
                  key={index}
                  className={`group cursor-pointer card-hover border border-white/20 bg-white/50 backdrop-blur-sm relative overflow-hidden hover:scale-105 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} ${isNavigating ? 'pointer-events-none opacity-50' : ''}`}
                  style={{ transitionDelay: `${800 + index * 200}ms` }}
                  onClick={() => handleNavigation(loginType.path, loginType.type as 'staff' | 'parent')}
                >
                  <CardContent className="p-8 text-center relative z-10">
                    <div className={`w-20 h-20 ${loginType.color} rounded-3xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl`}>
                      <loginType.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {loginType.title}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-6">
                      {loginType.description}
                    </p>
                    
                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      {loginType.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center justify-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-base font-medium text-blue-600 mr-2">Giriş Yap</span>
                      <ChevronRight className="h-5 w-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Overview Section */}
        <section className="px-6 py-16 bg-white/30 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className={`text-center mb-16 transition-all duration-1000 ease-out delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Sistem Özellikleri
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Yoklama yönetiminin her aşamasında size yardımcı olacak araçlar
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`group border border-white/20 bg-white/50 backdrop-blur-sm relative overflow-hidden hover:scale-105 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  style={{ transitionDelay: `${1100 + index * 100}ms` }}
                >
                  <CardContent className="p-6 text-center relative z-10">
                    <div className={`w-16 h-16 ${feature.color} rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      {feature.role === 'staff' ? 'Sadece Çalışanlar' : 
                       feature.role === 'parent' ? 'Sadece Veliler' : 
                       'Tüm Kullanıcılar'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <Card className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-2xl transition-all duration-1000 delay-1200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <CardContent className="p-12">
                <h2 className="text-3xl font-bold mb-4">
                  Hemen Başlayın!
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Rolünüze uygun giriş yapın ve yoklama yönetimini modernleştirin
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    onClick={() => router.push('/students')}
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-xl shadow-lg group"
                  >
                    <Shield className="mr-2 h-5 w-5" />
                    Çalışan Girişi
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    size="lg"
                    onClick={() => router.push('/parent-reports')}
                    className="bg-green-500 text-white hover:bg-green-600 px-8 py-4 text-lg rounded-xl shadow-lg group"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    Veli Girişi
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Navigation Transition Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-lg">
          <div className="text-center">
            <div className="relative mb-8">
              {/* Modern Loader - Orbiting dots */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-300 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-green-500 border-l-green-300 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-purple-500 border-b-purple-300 animate-spin" style={{animationDuration: '2s'}}></div>
                
                {/* Center pulsing dot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse"></div>
                
                {/* Floating particles */}
                <div className="absolute -top-2 -right-2 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                <div className="absolute top-0 -left-2 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '600ms'}}></div>
                <div className="absolute bottom-0 -right-2 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '900ms'}}></div>
              </div>
              
              {/* Glowing effect */}
              <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-r from-blue-500/20 via-green-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="h-2 w-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
              
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
                {navigationType === 'staff' ? 'Çalışan Paneline' : 'Veli Paneline'} Geçiliyor
              </h3>
              
              <p className="text-gray-600 text-lg">
                Hazırlanıyor<span className="animate-pulse">...</span>
              </p>
            </div>
            
            {/* Modern progress indicator */}
            <div className="mt-8 relative">
              <div className="w-64 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 rounded-full animate-progress"></div>
              </div>
              <div className="w-64 h-1 bg-gradient-to-r from-blue-500/30 via-green-500/30 to-purple-500/30 rounded-full mx-auto mt-1 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0% { 
            transform: translate(0px, 0px) scale(1);
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          25% { 
            transform: translate(30px, -50px) scale(1.1);
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
          50% { 
            transform: translate(-20px, 20px) scale(0.9);
            border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%;
          }
          75% { 
            transform: translate(-30px, -20px) scale(1.05);
            border-radius: 60% 40% 60% 30% / 70% 30% 60% 40%;
          }
          100% { 
            transform: translate(0px, 0px) scale(1);
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-blob {
          animation: blob 8s infinite ease-in-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-3000 {
          animation-delay: 3s;
        }

        .animation-delay-5000 {
          animation-delay: 5s;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 0.8s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .group:hover .group-hover\\:animate-pulse-slow {
          animation: pulse 1s ease-in-out infinite;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Better focus states */
        button:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Card hover improvements */
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Text gradient animation */
        .text-gradient {
          background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981);
          background-size: 400% 400%;
          animation: gradientShift 4s ease infinite;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Loading shimmer effect */
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* Page transition effects */
        .fade-out {
          animation: fadeOut 0.5s ease-in-out forwards;
        }

        @keyframes fadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
        }

        .slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Modern loader animations */
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(-50%); }
          100% { transform: translateX(100%); }
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }

        /* Enhanced floating animation */
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(1deg); }
          50% { transform: translateY(-5px) rotate(0deg); }
          75% { transform: translateY(-15px) rotate(-1deg); }
        }

        .animate-float-gentle {
          animation: float-gentle 4s ease-in-out infinite;
        }

        /* Sophisticated glow effect */
        @keyframes sophisticated-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3),
                        0 0 40px rgba(34, 197, 94, 0.2),
                        0 0 60px rgba(147, 51, 234, 0.1); 
          }
          50% { 
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.5),
                        0 0 60px rgba(34, 197, 94, 0.3),
                        0 0 90px rgba(147, 51, 234, 0.2); 
          }
        }
      `}</style>
    </div>
  );
}
        