'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  School, BookOpen, ClipboardList, LogOut,
  Home, User, Users, Calendar, Award,
  Menu, AlertCircle, Loader2, CheckCircle, BarChart3
} from 'lucide-react';

// Types
interface AnakData {
  id: string;
  nisn: string;
  nama: string;
  jenkel?: string;
  kelas?: { id: string; nama: string; tingkat: string; rombel: string };
  sekolah?: { id: string; nama: string; npsn: string; logo?: string; tahunAjaran: string };
  nilaiQuiz?: {
    id: string;
    nilai: number;
    selesai: boolean;
    quiz?: {
      judul: string;
      jenis: string;
      mapel?: { nama: string };
    };
  }[];
  kehadiran?: {
    id: string;
    tanggal: string;
    status: string;
    keterangan?: string;
  }[];
}

interface WaliData {
  id: string;
  nama: string;
  email: string;
  telepon?: string;
  hubungan: string;
  pekerjaan?: string;
  anak?: AnakData[];
}

interface User {
  id: string;
  email: string;
  nama: string;
  foto?: string;
  wali?: WaliData;
}

export default function WaliApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data
  const [anak, setAnak] = useState<AnakData[]>([]);
  const [selectedAnak, setSelectedAnak] = useState<AnakData | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Profile
  const [profilePhoto, setProfilePhoto] = useState<string>('');

  // Theme - Green for Wali
  const theme = {
    primary: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg',
    primaryText: 'text-green-600',
    primaryBg: 'bg-gradient-to-r from-green-500 to-green-600',
    sidebar: 'bg-gradient-to-b from-green-700 via-green-600 to-green-800 backdrop-blur-xl',
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/wali/auth');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setProfilePhoto(data.user.foto || '');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/wali/anak');
      const data = await res.json();
      if (data.success) {
        setAnak(data.anak || []);
        if (data.anak && data.anak.length > 0) {
          setSelectedAnak(data.anak[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async () => {
    setLoginError('');
    try {
      const res = await fetch('/api/wali/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setProfilePhoto(data.user.foto || '');
        setLoginForm({ email: '', password: '' });
      } else {
        setLoginError(data.message || 'Login gagal');
      }
    } catch (error) {
      setLoginError('Terjadi kesalahan server');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/wali/auth', { method: 'DELETE' });
      setCurrentUser(null);
      setActiveMenu('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  };

  const renderLoginForm = () => (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #22c55e 0%, #10b981 50%, #059669 100%)' }}>
      <div className="absolute top-10 left-10 w-40 h-40 bg-white/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-56 h-56 bg-yellow-300/40 rounded-full blur-3xl"></div>

      <Card className="w-full max-w-md rounded-3xl overflow-hidden bg-white/90 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl">
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Aplikasi Wali Siswa SD
          </CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            Pantau Perkembangan Anak<br/>Tahun Pelajaran 2025/2026
          </CardDescription>
          <Badge className="bg-green-100 text-green-700 mt-2 mx-auto">Wali Siswa</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Masukkan email"
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Masukkan password"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="mt-1 rounded-xl"
              />
            </div>
            {loginError && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            <Button
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl"
              onClick={handleLogin}
            >
              Masuk
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSidebar = () => {
    if (!currentUser) return null;

    const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
      { id: 'nilai', label: 'Nilai Anak', icon: <Award className="w-5 h-5" /> },
      { id: 'kehadiran', label: 'Kehadiran', icon: <Calendar className="w-5 h-5" /> },
      { id: 'profil', label: 'Profil', icon: <User className="w-5 h-5" /> },
    ];

    return (
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} min-h-screen transition-all duration-300 flex flex-col ${theme.sidebar}`}>
        <div className="p-4 flex items-center justify-between border-b border-white/20">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/25 rounded-xl">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Wali Siswa</span>
            </div>
          )}
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1 transition-all ${
                activeMenu === item.id
                  ? 'bg-white/25 text-white'
                  : 'text-white/80 hover:bg-white/10'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/15 text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    if (!currentUser) return null;

    return (
      <header className="bg-white/80 backdrop-blur-lg px-6 py-4 flex items-center justify-between border-b border-green-100 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img
            src="https://i.pinimg.com/1200x/76/39/2d/76392d91c9c22d8ec5563b1126cd55b8.jpg"
            alt="Logo Dinas Pendidikan"
            className="w-10 h-10 object-contain rounded-lg"
          />
          <div>
            <h1 className="text-lg font-bold text-green-700">
              {selectedAnak?.sekolah?.nama || 'Aplikasi Wali Siswa'}
            </h1>
            <p className="text-xs text-gray-500">Pantau perkembangan anak Anda</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="border-2 border-green-200">
            {profilePhoto ? <AvatarImage src={profilePhoto} /> : null}
            <AvatarFallback className="bg-green-500 text-white">{currentUser.nama.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{currentUser.nama}</p>
            <p className="text-xs text-gray-500">{currentUser.wali?.hubungan === 'ayah' ? 'Ayah' : currentUser.wali?.hubungan === 'ibu' ? 'Ibu' : 'Wali'}</p>
          </div>
        </div>
      </header>
    );
  };

  const renderAnakSelector = () => {
    if (anak.length <= 1) return null;

    return (
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {anak.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedAnak(a)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedAnak?.id === a.id
                ? 'bg-green-500 text-white'
                : 'bg-white/80 text-gray-700 hover:bg-green-100'
            }`}
          >
            {a.nama}
          </button>
        ))}
      </div>
    );
  };

  const renderDashboard = () => {
    if (!selectedAnak) {
      return (
        <Card className="bg-white/80 backdrop-blur-lg">
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada data anak terdaftar</p>
          </CardContent>
        </Card>
      );
    }

    const totalNilai = selectedAnak.nilaiQuiz?.filter(n => n.selesai) || [];
    const avgNilai = totalNilai.length > 0
      ? totalNilai.reduce((sum, n) => sum + n.nilai, 0) / totalNilai.length
      : 0;
    const kehadiranHadir = selectedAnak.kehadiran?.filter(k => k.status === 'hadir').length || 0;
    const totalKehadiran = selectedAnak.kehadiran?.length || 0;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-green-700">Dashboard Wali Siswa</h2>

        {renderAnakSelector()}

        {/* Child Info Card */}
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-4 border-green-200">
                <AvatarFallback className="bg-green-500 text-white text-2xl">{selectedAnak.nama.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-green-700">{selectedAnak.nama}</h3>
                <p className="text-gray-500">NISN: {selectedAnak.nisn}</p>
                <p className="text-sm text-gray-600">Kelas: {selectedAnak.kelas?.nama}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-lg border-green-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-xl text-white">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Quiz Selesai</p>
                  <p className="text-xl font-bold text-green-700">{totalNilai.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-lg border-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-xl text-white">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rata-rata Nilai</p>
                  <p className="text-xl font-bold text-blue-700">{avgNilai.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-lg border-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-xl text-white">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Kehadiran</p>
                  <p className="text-xl font-bold text-purple-700">
                    {totalKehadiran > 0 ? ((kehadiranHadir / totalKehadiran) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-lg border-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500 rounded-xl text-white">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sekolah</p>
                  <p className="text-sm font-bold text-orange-700 truncate">{selectedAnak.sekolah?.nama}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* School Info */}
        <Card className="bg-white/80 backdrop-blur-lg border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-xl shadow p-2 border border-green-100">
                  <img
                    src="https://i.pinimg.com/1200x/76/39/2d/76392d91c9c22d8ec5563b1126cd55b8.jpg"
                    alt="Logo Dinas Pendidikan"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Dinas Pendidikan</p>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-green-700">Aplikasi Pembelajaran Jarak Jauh</h3>
                <p className="text-sm text-gray-600">Tahun Pelajaran {selectedAnak.sekolah?.tahunAjaran || '2025/2026'}</p>
                <p className="text-xs text-gray-500 mt-1">Jenjang SD (Sekolah Dasar)</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-xl shadow p-2 border border-green-100 flex items-center justify-center">
                  {selectedAnak.sekolah?.logo ? (
                    <img src={selectedAnak.sekolah.logo} alt="Logo Sekolah" className="w-full h-full object-contain" />
                  ) : (
                    <School className="w-10 h-10 text-green-300" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{selectedAnak.sekolah?.nama || 'Sekolah'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card className="bg-white/80 backdrop-blur-lg border-green-100">
          <CardHeader>
            <CardTitle className="text-green-700">Nilai Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {totalNilai.slice(0, 5).map((n, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-xl mb-2">
                <div>
                  <p className="font-medium">{n.quiz?.judul}</p>
                  <p className="text-sm text-gray-500">{n.quiz?.mapel?.nama}</p>
                </div>
                <Badge className={n.nilai >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {n.nilai.toFixed(0)}
                </Badge>
              </div>
            ))}
            {totalNilai.length === 0 && (
              <p className="text-gray-500 text-center py-4">Belum ada nilai</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderNilai = () => {
    if (!selectedAnak) return null;

    const totalNilai = selectedAnak.nilaiQuiz?.filter(n => n.selesai) || [];

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-green-700">Nilai {selectedAnak.nama}</h2>

        {renderAnakSelector()}

        <Card className="bg-white/80 backdrop-blur-lg border-green-100">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="p-3 text-left">Quiz</th>
                    <th className="p-3 text-left">Mata Pelajaran</th>
                    <th className="p-3 text-left">Jenis</th>
                    <th className="p-3 text-center">Nilai</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {totalNilai.map((n, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3">{n.quiz?.judul}</td>
                      <td className="p-3">{n.quiz?.mapel?.nama}</td>
                      <td className="p-3">
                        <Badge variant="outline">{n.quiz?.jenis?.toUpperCase()}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`font-bold text-lg ${n.nilai >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                          {n.nilai.toFixed(0)}
                        </span>
                      </td>
                      <td className="p-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalNilai.length === 0 && (
              <p className="text-gray-500 text-center py-8">Belum ada nilai</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderKehadiran = () => {
    if (!selectedAnak) return null;

    const kehadiran = selectedAnak.kehadiran || [];

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-green-700">Kehadiran {selectedAnak.nama}</h2>

        {renderAnakSelector()}

        <Card className="bg-white/80 backdrop-blur-lg border-green-100">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="p-3 text-left">Tanggal</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {kehadiran.map((k, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3">{formatDate(k.tanggal)}</td>
                      <td className="p-3">
                        <Badge className={
                          k.status === 'hadir' ? 'bg-green-100 text-green-700' :
                          k.status === 'izin' ? 'bg-yellow-100 text-yellow-700' :
                          k.status === 'sakit' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {k.status.charAt(0).toUpperCase() + k.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-3">{k.keterangan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {kehadiran.length === 0 && (
              <p className="text-gray-500 text-center py-8">Belum ada data kehadiran</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderProfil = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-green-700">Profil Wali</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-lg border-green-100">
          <CardContent className="p-6 text-center">
            <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-green-100">
              {profilePhoto ? <AvatarImage src={profilePhoto} /> : null}
              <AvatarFallback className="bg-green-500 text-white text-4xl">{currentUser?.nama.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold">{currentUser?.nama}</h3>
            <p className="text-gray-500">{currentUser?.email}</p>
            <Badge className="bg-green-100 text-green-700 mt-2">
              {currentUser?.wali?.hubungan === 'ayah' ? 'Ayah' : currentUser?.wali?.hubungan === 'ibu' ? 'Ibu' : 'Wali'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-white/80 backdrop-blur-lg border-green-100">
          <CardHeader>
            <CardTitle>Informasi Wali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nama</p>
                <p className="font-medium">{currentUser?.wali?.nama}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hubungan</p>
                <p className="font-medium capitalize">{currentUser?.wali?.hubungan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Telepon</p>
                <p className="font-medium">{currentUser?.wali?.telepon || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pekerjaan</p>
                <p className="font-medium">{currentUser?.wali?.pekerjaan || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daftar Anak */}
      <Card className="bg-white/80 backdrop-blur-lg border-green-100">
        <CardHeader>
          <CardTitle>Daftar Anak Terdaftar</CardTitle>
        </CardHeader>
        <CardContent>
          {anak.map((a) => (
            <div key={a.id} className="flex items-center gap-4 p-3 bg-green-50 rounded-xl mb-2">
              <Avatar>
                <AvatarFallback className="bg-green-500 text-white">{a.nama.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{a.nama}</p>
                <p className="text-sm text-gray-500">Kelas {a.kelas?.nama} • {a.sekolah?.nama}</p>
              </div>
            </div>
          ))}
          {anak.length === 0 && (
            <p className="text-gray-500 text-center py-4">Belum ada anak terdaftar</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Main render
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!currentUser) {
    return renderLoginForm();
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {renderSidebar()}
      <div className="flex-1 flex flex-col">
        {renderHeader()}
        <main className="flex-1 p-6 overflow-y-auto">
          {loadingData ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : (
            <>
              {activeMenu === 'dashboard' && renderDashboard()}
              {activeMenu === 'nilai' && renderNilai()}
              {activeMenu === 'kehadiran' && renderKehadiran()}
              {activeMenu === 'profil' && renderProfil()}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
