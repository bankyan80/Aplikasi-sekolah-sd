'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  School, BookOpen, ClipboardList, FileText, Settings, LogOut,
  Home, User, GraduationCap, Calendar, BarChart3, Clock, Award,
  Menu, AlertCircle, Loader2, CheckCircle, XCircle, Play
} from 'lucide-react';

// Types
interface SiswaData {
  id: string;
  nisn: string;
  nama: string;
  jenkel?: string;
  kelasId: string;
  sekolahId: string;
  kelas?: { id: string; nama: string; tingkat: string; rombel: string };
  sekolah?: { id: string; nama: string; npsn: string; logo?: string; tahunAjaran: string };
  wali?: { id: string; nama: string; hubungan: string };
}

interface User {
  id: string;
  email: string;
  nama: string;
  foto?: string;
  siswa?: SiswaData;
  sekolah?: SiswaData['sekolah'];
}

interface Materi {
  id: string;
  judul: string;
  deskripsi: string;
  konten: string;
  kategori: string;
  createdAt: string;
  mapel?: { nama: string; kelas?: { nama: string } };
  guru?: { nama: string };
}

interface Quiz {
  id: string;
  judul: string;
  deskripsi?: string;
  jenis: string;
  durasi: number;
  aktif: boolean;
  createdAt: string;
  mapel?: { nama: string };
  guru?: { nama: string };
  _count?: { soal: number };
}

interface Soal {
  id: string;
  pertanyaan: string;
  opsiA: string;
  opsiB: string;
  opsiC?: string;
  opsiD?: string;
  gambar?: string;
}

interface NilaiQuiz {
  id: string;
  quizId: string;
  nilai: number;
  selesai: boolean;
  waktuMulai?: string;
  waktuSelesai?: string;
  quiz?: Quiz;
}

const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

export default function SiswaApp() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data states
  const [materi, setMateri] = useState<Materi[]>([]);
  const [quiz, setQuiz] = useState<Quiz[]>([]);
  const [nilai, setNilai] = useState<NilaiQuiz[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Quiz taking state
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizSoal, setQuizSoal] = useState<Soal[]>([]);
  const [quizAttempt, setQuizAttempt] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [quizStarted, setQuizStarted] = useState(false);

  // Profile state
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const profilePhotoRef = useRef<HTMLInputElement>(null);

  // Theme - Blue for Siswa
  const theme = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg',
    primaryText: 'text-blue-600',
    primaryBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
    sidebar: 'bg-gradient-to-b from-blue-700 via-blue-600 to-blue-800 backdrop-blur-xl',
    glass: 'bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl',
    glassCard: 'bg-white/80 backdrop-blur-lg border border-white/50 shadow-xl',
  };

  // Check session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/siswa/auth');
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

  // Fetch data when user changes
  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [materiRes, quizRes] = await Promise.all([
        fetch('/api/siswa/materi'),
        fetch('/api/siswa/quiz'),
      ]);
      const materiData = await materiRes.json();
      const quizData = await quizRes.json();

      if (materiData.success) setMateri(materiData.data);
      if (quizData.success) {
        setQuiz(quizData.data);
        setNilai(quizData.nilai || []);
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
      const res = await fetch('/api/siswa/auth', {
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
      await fetch('/api/siswa/auth', { method: 'DELETE' });
      setCurrentUser(null);
      setActiveMenu('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleStartQuiz = async (q: Quiz) => {
    try {
      // Check if already completed
      const checkRes = await fetch(`/api/siswa/nilai?quizId=${q.id}`);
      const checkData = await checkRes.json();

      if (checkData.alreadyCompleted) {
        setQuizResult(checkData.nilai);
        setSelectedQuiz(q);
        setQuizDialogOpen(true);
        return;
      }

      // Start new attempt
      const startRes = await fetch('/api/siswa/nilai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: q.id }),
      });
      const startData = await startRes.json();

      if (startData.success) {
        setSelectedQuiz(q);
        setQuizSoal(checkData.quiz?.soal || []);
        setQuizAttempt(startData.data);
        setQuizAnswers({});
        setTimeLeft(q.durasi * 60);
        setQuizStarted(true);
        setQuizResult(null);
        setQuizDialogOpen(true);
      }
    } catch (error) {
      console.error('Start quiz error:', error);
      alert('Gagal memulai quiz');
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quizAttempt || !selectedQuiz) return;

    try {
      const res = await fetch('/api/siswa/nilai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: selectedQuiz.id,
          nilaiId: quizAttempt.id,
          jawaban: quizAnswers,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setQuizResult(data);
        setQuizStarted(false);
        fetchData();
      } else {
        alert(data.message || 'Gagal mengirim jawaban');
      }
    } catch (error) {
      console.error('Submit quiz error:', error);
      alert('Terjadi kesalahan');
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderLoginForm = () => (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)' }}>
      <div className="absolute top-10 left-10 w-40 h-40 bg-white/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-56 h-56 bg-cyan-300/40 rounded-full blur-3xl"></div>

      <Card className="w-full max-w-md rounded-3xl overflow-hidden bg-white/90 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Aplikasi Siswa SD
          </CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            Pembelajaran Jarak Jauh<br/>Tahun Pelajaran 2025/2026
          </CardDescription>
          <Badge className="bg-blue-100 text-blue-700 mt-2 mx-auto">Siswa</Badge>
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
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl"
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
      { id: 'materi', label: 'Materi', icon: <BookOpen className="w-5 h-5" /> },
      { id: 'quiz', label: 'Quiz', icon: <ClipboardList className="w-5 h-5" /> },
      { id: 'nilai', label: 'Nilai Saya', icon: <Award className="w-5 h-5" /> },
      { id: 'profil', label: 'Profil', icon: <User className="w-5 h-5" /> },
    ];

    return (
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} min-h-screen transition-all duration-300 flex flex-col ${theme.sidebar}`}>
        <div className="p-4 flex items-center justify-between border-b border-white/20">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/25 rounded-xl">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Siswa</span>
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
      <header className="bg-white/80 backdrop-blur-lg px-6 py-4 flex items-center justify-between border-b border-blue-100 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img
            src="https://i.pinimg.com/1200x/76/39/2d/76392d91c9c22d8ec5563b1126cd55b8.jpg"
            alt="Logo Dinas Pendidikan"
            className="w-10 h-10 object-contain rounded-lg"
          />
          <div>
            <h1 className="text-lg font-bold text-blue-700">{currentUser.sekolah?.nama || 'Sekolah SD'}</h1>
            <p className="text-xs text-gray-500">Kelas {currentUser.siswa?.kelas?.nama || '-'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="border-2 border-blue-200">
            {profilePhoto ? <AvatarImage src={profilePhoto} /> : null}
            <AvatarFallback className="bg-blue-500 text-white">{currentUser.nama.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{currentUser.nama}</p>
            <p className="text-xs text-gray-500">{currentUser.email}</p>
          </div>
        </div>
      </header>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Dashboard Siswa</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-xl text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Materi</p>
                <p className="text-2xl font-bold text-blue-700">{materi.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-xl text-white">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Quiz Tersedia</p>
                <p className="text-2xl font-bold text-green-700">{quiz.filter(q => q.aktif).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-xl text-white">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Quiz Selesai</p>
                <p className="text-2xl font-bold text-purple-700">{nilai.filter(n => n.selesai).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* School Info Card */}
      <Card className="bg-white/80 backdrop-blur-lg border-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-xl shadow p-2 border border-blue-100">
                <img
                  src="https://i.pinimg.com/1200x/76/39/2d/76392d91c9c22d8ec5563b1126cd55b8.jpg"
                  alt="Logo Dinas Pendidikan"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Dinas Pendidikan</p>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-blue-700">Aplikasi Pembelajaran Jarak Jauh</h3>
              <p className="text-sm text-gray-600">Tahun Pelajaran {currentUser?.sekolah?.tahunAjaran || '2025/2026'}</p>
              <p className="text-xs text-gray-500 mt-1">Jenjang SD (Sekolah Dasar)</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-xl shadow p-2 border border-blue-100 flex items-center justify-center">
                {currentUser?.sekolah?.logo ? (
                  <img src={currentUser.sekolah.logo} alt="Logo Sekolah" className="w-full h-full object-contain" />
                ) : (
                  <School className="w-10 h-10 text-blue-300" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{currentUser?.sekolah?.nama || 'Sekolah'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Quiz */}
      <Card className="bg-white/80 backdrop-blur-lg border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-700">Quiz Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {quiz.filter(q => q.aktif).slice(0, 3).map(q => (
            <div key={q.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl mb-2">
              <div>
                <p className="font-medium">{q.judul}</p>
                <p className="text-sm text-gray-500">{q.mapel?.nama} • {q._count?.soal || 0} soal</p>
              </div>
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600" onClick={() => handleStartQuiz(q)}>
                <Play className="w-4 h-4 mr-1" /> Mulai
              </Button>
            </div>
          ))}
          {quiz.filter(q => q.aktif).length === 0 && (
            <p className="text-gray-500 text-center py-4">Tidak ada quiz tersedia</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderMateri = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Materi Pembelajaran</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {materi.map(m => (
          <Card key={m.id} className="bg-white/80 backdrop-blur-lg border-blue-100">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{m.judul}</CardTitle>
                <Badge className="bg-blue-100 text-blue-700">{m.kategori}</Badge>
              </div>
              <CardDescription>{m.mapel?.nama}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">{m.deskripsi}</p>
              <p className="text-xs text-gray-500">Oleh: {m.guru?.nama}</p>
              <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => {
                setSelectedQuiz(null);
                // Show materi detail in dialog
              }}>
                Lihat Detail
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {materi.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-lg">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada materi tersedia</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderQuiz = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Daftar Quiz</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quiz.filter(q => q.aktif).map(q => {
          const sudahDikerjakan = nilai.find(n => n.quizId === q.id && n.selesai);
          return (
            <Card key={q.id} className={`bg-white/80 backdrop-blur-lg ${sudahDikerjakan ? 'border-green-200' : 'border-blue-100'}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{q.judul}</CardTitle>
                    <CardDescription>{q.mapel?.nama}</CardDescription>
                  </div>
                  <Badge className={sudahDikerjakan ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                    {sudahDikerjakan ? 'Selesai' : q.jenis.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span><Clock className="w-4 h-4 inline mr-1" />{q.durasi} menit</span>
                  <span><ClipboardList className="w-4 h-4 inline mr-1" />{q._count?.soal || 0} soal</span>
                </div>
                {sudahDikerjakan && (
                  <p className="text-sm text-green-600 mb-3">Nilai: {sudahDikerjakan.nilai.toFixed(0)}</p>
                )}
                <Button
                  size="sm"
                  className={`w-full ${sudahDikerjakan ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                  onClick={() => handleStartQuiz(q)}
                >
                  {sudahDikerjakan ? 'Lihat Hasil' : 'Kerjakan Quiz'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {quiz.filter(q => q.aktif).length === 0 && (
        <Card className="bg-white/80 backdrop-blur-lg">
          <CardContent className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada quiz tersedia</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderNilai = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Nilai Saya</h2>

      <Card className="bg-white/80 backdrop-blur-lg border-blue-100">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="p-3 text-left">Quiz</th>
                  <th className="p-3 text-left">Mata Pelajaran</th>
                  <th className="p-3 text-left">Jenis</th>
                  <th className="p-3 text-center">Nilai</th>
                  <th className="p-3 text-left">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {nilai.filter(n => n.selesai).map(n => (
                  <tr key={n.id} className="border-t">
                    <td className="p-3">{n.quiz?.judul}</td>
                    <td className="p-3">{n.quiz?.mapel?.nama}</td>
                    <td className="p-3">
                      <Badge className={n.quiz?.jenis === 'harian' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                        {n.quiz?.jenis?.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-bold text-lg ${n.nilai >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {n.nilai.toFixed(0)}
                      </span>
                    </td>
                    <td className="p-3">{formatDate(n.waktuSelesai || '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {nilai.filter(n => n.selesai).length === 0 && (
            <p className="text-gray-500 text-center py-8">Belum ada nilai</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderProfil = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-blue-700">Profil Saya</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-lg border-blue-100">
          <CardContent className="p-6 text-center">
            <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-blue-100">
              {profilePhoto ? <AvatarImage src={profilePhoto} /> : null}
              <AvatarFallback className="bg-blue-500 text-white text-4xl">{currentUser?.nama.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold">{currentUser?.nama}</h3>
            <p className="text-gray-500">{currentUser?.email}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-white/80 backdrop-blur-lg border-blue-100">
          <CardHeader>
            <CardTitle>Informasi Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">NISN</p>
                <p className="font-medium">{currentUser?.siswa?.nisn}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kelas</p>
                <p className="font-medium">{currentUser?.siswa?.kelas?.nama}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sekolah</p>
                <p className="font-medium">{currentUser?.sekolah?.nama}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Wali</p>
                <p className="font-medium">{currentUser?.siswa?.wali?.nama || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderQuizDialog = () => (
    <Dialog open={quizDialogOpen} onOpenChange={(open) => {
      setQuizDialogOpen(open);
      if (!open) {
        setQuizStarted(false);
        setQuizResult(null);
        setSelectedQuiz(null);
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {quizResult ? (
          // Show result
          <div className="text-center py-8">
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${quizResult.score >= 70 ? 'bg-green-100' : 'bg-red-100'}`}>
              {quizResult.score >= 70 ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : (
                <XCircle className="w-12 h-12 text-red-500" />
              )}
            </div>
            <h2 className="text-2xl font-bold mt-4">Quiz Selesai!</h2>
            <p className="text-4xl font-bold mt-2" style={{ color: quizResult.score >= 70 ? '#22c55e' : '#ef4444' }}>
              {quizResult.score.toFixed(0)}
            </p>
            <p className="text-gray-500 mt-2">
              Benar: {quizResult.correct} dari {quizResult.total} soal
            </p>
            <Button className="mt-6 bg-blue-500 hover:bg-blue-600" onClick={() => setQuizDialogOpen(false)}>
              Tutup
            </Button>
          </div>
        ) : quizStarted && selectedQuiz ? (
          // Show quiz questions
          <>
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle>{selectedQuiz.judul}</DialogTitle>
                <div className="flex items-center gap-2 text-lg font-bold text-red-500">
                  <Clock className="w-5 h-5" />
                  {formatTime(timeLeft)}
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {quizSoal.map((soal, index) => (
                <Card key={soal.id}>
                  <CardContent className="p-4">
                    <p className="font-medium mb-3">{index + 1}. {soal.pertanyaan}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map((opt) => {
                        const opsiKey = `opsi${opt}` as keyof Soal;
                        const opsiVal = soal[opsiKey] as string;
                        if (!opsiVal) return null;
                        return (
                          <button
                            key={opt}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [soal.id]: opt }))}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              quizAnswers[soal.id] === opt
                                ? 'bg-blue-100 border-blue-500'
                                : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <span className="font-medium">{opt}.</span> {opsiVal}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button className="w-full bg-green-500 hover:bg-green-600" onClick={handleSubmitQuiz}>
                Kirim Jawaban
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            <p className="mt-4">Memuat quiz...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  // Main render
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (!currentUser) {
    return renderLoginForm();
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {renderSidebar()}
      <div className="flex-1 flex flex-col">
        {renderHeader()}
        <main className="flex-1 p-6 overflow-y-auto">
          {loadingData ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {activeMenu === 'dashboard' && renderDashboard()}
              {activeMenu === 'materi' && renderMateri()}
              {activeMenu === 'quiz' && renderQuiz()}
              {activeMenu === 'nilai' && renderNilai()}
              {activeMenu === 'profil' && renderProfil()}
            </>
          )}
        </main>
      </div>
      {renderQuizDialog()}
    </div>
  );
}
