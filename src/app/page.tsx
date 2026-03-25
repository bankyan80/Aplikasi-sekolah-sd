'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  School, Users, BookOpen, ClipboardList, FileText, Settings, LogOut,
  Home, User, GraduationCap, Calendar, BarChart3, Plus, Edit, Trash2,
  Eye, Upload, Download, Search, CheckCircle, XCircle, Clock, Award,
  Menu, File, AlertCircle, Loader2
} from 'lucide-react';

// ==================== TYPES ====================
type UserRole = 'kepala_sekolah' | 'guru_kelas' | 'guru_mapel';

interface User {
  id: string;
  email: string;
  role: UserRole;
  nama: string;
  foto?: string;
  sekolahId?: string;
  sekolah?: {
    id: string;
    nama: string;
    npsn: string;
    alamat?: string;
    jenjang: string;
    tahunAjaran: string;
    logo?: string;
  };
  guru?: {
    id: string;
    nip: string;
    nama: string;
    jenisGuru: string;
    status: string;
  };
}

interface Guru {
  id: string;
  nip: string;
  nama: string;
  email: string;
  telepon?: string;
  alamat?: string;
  status: string;
  jenisGuru: string;
  sekolahId: string;
  userId: string;
}

interface Kelas {
  id: string;
  nama: string;
  tingkat: string;
  rombel: string;
  sekolahId: string;
}

interface MataPelajaran {
  id: string;
  nama: string;
  kode?: string;
  deskripsi?: string;
  kelasId: string;
  guruId: string;
  sekolahId: string;
  kelas?: Kelas;
  guru?: Guru;
}

interface Materi {
  id: string;
  judul: string;
  deskripsi: string;
  konten: string;
  gambar?: string;
  fileUrl?: string;
  kategori: string;
  mapelId: string;
  guruId: string;
  createdAt: string;
  mapel?: MataPelajaran;
  guru?: Guru;
}

interface Quiz {
  id: string;
  judul: string;
  deskripsi?: string;
  jenis: string;
  durasi: number;
  mapelId: string;
  guruId: string;
  aktif: boolean;
  createdAt: string;
  soal: SoalQuiz[];
  mapel?: MataPelajaran;
  guru?: Guru;
  _count?: { soal: number };
}

interface SoalQuiz {
  id: string;
  pertanyaan: string;
  opsiA: string;
  opsiB: string;
  opsiC?: string;
  opsiD?: string;
  jawaban: string;
  gambar?: string;
  quizId: string;
}

interface KehadiranGuru {
  id: string;
  guruId: string;
  userId: string;
  tanggal: string;
  status: string;
  keterangan?: string;
  guru?: Guru;
  user?: User;
}

// ==================== UTILITY FUNCTIONS ====================
const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

// ==================== MAIN COMPONENT ====================
export default function SekolahApp() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Data state
  const [guru, setGuru] = useState<Guru[]>([]);
  const [kelas, setKelas] = useState<Kelas[]>([]);
  const [mapel, setMapel] = useState<MataPelajaran[]>([]);
  const [materi, setMateri] = useState<Materi[]>([]);
  const [quiz, setQuiz] = useState<Quiz[]>([]);
  const [kehadiranGuru, setKehadiranGuru] = useState<KehadiranGuru[]>([]);

  // UI state
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editItem, setEditItem] = useState<any>(null);

  // Form states
  const [materiForm, setMateriForm] = useState({ judul: '', deskripsi: '', konten: '', kategori: 'umum', mapelId: '' });
  const [quizForm, setQuizForm] = useState({ judul: '', deskripsi: '', jenis: 'harian', durasi: 30, mapelId: '' });
  const [soalForm, setSoalForm] = useState<{ pertanyaan: string; opsiA: string; opsiB: string; opsiC: string; opsiD: string; jawaban: 'A' | 'B' | 'C' | 'D' }[]>([]);
  const [kehadiranForm, setKehadiranForm] = useState({ guruId: '', tanggal: formatDate(new Date()), status: 'hadir', keterangan: '' });

  // Profile state
  const [profileForm, setProfileForm] = useState({ nama: '', email: '', password: '', newPassword: '', confirmPassword: '' });
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Sekolah Form state
  const [sekolahForm, setSekolahForm] = useState({ nama: '', npsn: '', alamat: '', jenjang: 'SD', tahunAjaran: '2025/2026', logo: '' });
  const [sekolahLogo, setSekolahLogo] = useState<string>('');
  const [savingSekolah, setSavingSekolah] = useState(false);

  // File upload refs
  const materiFileRef = useRef<HTMLInputElement>(null);
  const quizFileRef = useRef<HTMLInputElement>(null);
  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const sekolahLogoRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // SD Theme with Glossy Effect
  const theme = {
    primary: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg',
    primaryText: 'text-red-600',
    primaryBg: 'bg-gradient-to-r from-red-500 to-red-600',
    primaryBgHover: 'hover:from-red-600 hover:to-red-700',
    sidebar: 'bg-gradient-to-b from-red-700 via-red-600 to-red-800 backdrop-blur-xl',
    gradient: 'from-red-100 via-pink-50 to-orange-100',
    lightBg: 'bg-red-50/80 backdrop-blur-sm',
    lightText: 'text-red-700',
    lightBorder: 'border-red-200',
    glass: 'bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl',
    glassCard: 'bg-white/80 backdrop-blur-lg border border-white/50 shadow-xl',
  };

  // ==================== API FUNCTIONS ====================
  const fetchData = useCallback(async () => {
    if (!currentUser?.sekolahId) return;
    setLoadingData(true);

    try {
      const sekolahId = currentUser.sekolahId;
      const guruId = currentUser.guru?.id;

      // Fetch all data in parallel
      const [kelasRes, mapelRes, guruRes, kehadiranRes] = await Promise.all([
        fetch(`/api/kelas?sekolahId=${sekolahId}`),
        fetch(`/api/mapel?sekolahId=${sekolahId}`),
        fetch(`/api/admin/users?sekolahId=${sekolahId}`),
        fetch(`/api/kehadiran?sekolahId=${sekolahId}`),
      ]);

      const kelasData = await kelasRes.json();
      const mapelData = await mapelRes.json();
      const guruData = await guruRes.json();
      const kehadiranData = await kehadiranRes.json();

      if (kelasData.success) setKelas(kelasData.data);
      if (mapelData.success) setMapel(mapelData.data);
      if (guruData.success) setGuru(guruData.data.filter((u: any) => u.guru).map((u: any) => u.guru));
      if (kehadiranData.success) setKehadiranGuru(kehadiranData.data);

      // Fetch materi and quiz based on role
      if (currentUser.role === 'kepala_sekolah') {
        const [materiRes, quizRes] = await Promise.all([
          fetch(`/api/materi?sekolahId=${sekolahId}`),
          fetch(`/api/quiz?sekolahId=${sekolahId}`),
        ]);
        const materiData = await materiRes.json();
        const quizData = await quizRes.json();
        if (materiData.success) setMateri(materiData.data);
        if (quizData.success) setQuiz(quizData.data);
      } else if (guruId) {
        const [materiRes, quizRes] = await Promise.all([
          fetch(`/api/materi?guruId=${guruId}`),
          fetch(`/api/quiz?guruId=${guruId}`),
        ]);
        const materiData = await materiRes.json();
        const quizData = await quizRes.json();
        if (materiData.success) setMateri(materiData.data);
        if (quizData.success) setQuiz(quizData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [currentUser]);

  // Check session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsAuthChecking(false);
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch data when user changes
  useEffect(() => {
    if (currentUser) {
      fetchData();
      // Initialize profile photo from current user
      setProfilePhoto(currentUser.foto || '');
      // Initialize sekolah form with current school data
      if (currentUser.sekolah) {
        setSekolahLogo(currentUser.sekolah.logo || '');
        setSekolahForm({
          nama: currentUser.sekolah.nama,
          npsn: currentUser.sekolah.npsn,
          alamat: currentUser.sekolah.alamat || '',
          jenjang: currentUser.sekolah.jenjang,
          tahunAjaran: currentUser.sekolah.tahunAjaran,
          logo: currentUser.sekolah.logo || '',
        });
      }
    }
  }, [currentUser, fetchData]);

  // ==================== AUTH HANDLERS ====================
  const handleLogin = async () => {
    setLoginError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
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
      await fetch('/api/auth', { method: 'DELETE' });
      setCurrentUser(null);
      setActiveMenu('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ==================== CRUD HANDLERS ====================

  // Materi handlers
  const handleAddMateri = async () => {
    const guruId = currentUser?.guru?.id;
    if (!guruId || !materiForm.mapelId) {
      alert('Pilih mata pelajaran terlebih dahulu');
      return;
    }

    try {
      const res = await fetch('/api/materi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...materiForm,
          guruId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMateri(prev => [...prev, data.data]);
        setMateriForm({ judul: '', deskripsi: '', konten: '', kategori: 'umum', mapelId: '' });
        setDialogOpen(false);
        alert('Materi berhasil ditambahkan!');
      } else {
        alert(data.message || 'Gagal menambah materi');
      }
    } catch (error) {
      console.error('Add materi error:', error);
      alert('Terjadi kesalahan saat menambah materi');
    }
  };

  const handleEditMateri = (m: Materi) => {
    setEditItem(m);
    setMateriForm({ judul: m.judul, deskripsi: m.deskripsi, konten: m.konten, kategori: m.kategori, mapelId: m.mapelId });
    setDialogType('editMateri');
    setDialogOpen(true);
  };

  const handleUpdateMateri = async () => {
    if (!editItem) return;
    try {
      const res = await fetch('/api/materi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editItem.id, ...materiForm }),
      });
      const data = await res.json();
      if (data.success) {
        setMateri(prev => prev.map(m => m.id === editItem.id ? data.data : m));
        setEditItem(null);
        setMateriForm({ judul: '', deskripsi: '', konten: '', kategori: 'umum', mapelId: '' });
        setDialogOpen(false);
        alert('Materi berhasil diperbarui!');
      } else {
        alert(data.message || 'Gagal memperbarui materi');
      }
    } catch (error) {
      console.error('Update materi error:', error);
      alert('Terjadi kesalahan saat memperbarui materi');
    }
  };

  const handleDeleteMateri = async (id: string) => {
    if (!confirm('Yakin ingin menghapus materi ini?')) return;
    try {
      const res = await fetch(`/api/materi?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMateri(prev => prev.filter(m => m.id !== id));
        alert('Materi berhasil dihapus!');
      } else {
        alert(data.message || 'Gagal menghapus materi');
      }
    } catch (error) {
      console.error('Delete materi error:', error);
      alert('Terjadi kesalahan saat menghapus materi');
    }
  };

  // Quiz handlers
  const handleAddQuiz = async () => {
    const guruId = currentUser?.guru?.id;
    if (!guruId || !quizForm.mapelId) {
      alert('Pilih mata pelajaran terlebih dahulu');
      return;
    }

    if (soalForm.length === 0) {
      alert('Tambahkan minimal 1 soal');
      return;
    }

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quizForm,
          guruId,
          soal: soalForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuiz(prev => [...prev, data.data]);
        setQuizForm({ judul: '', deskripsi: '', jenis: 'harian', durasi: 30, mapelId: '' });
        setSoalForm([]);
        setDialogOpen(false);
        alert('Quiz berhasil ditambahkan!');
      } else {
        alert(data.message || 'Gagal menambah quiz');
      }
    } catch (error) {
      console.error('Add quiz error:', error);
      alert('Terjadi kesalahan saat menambah quiz');
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Yakin ingin menghapus quiz ini?')) return;
    try {
      const res = await fetch(`/api/quiz?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setQuiz(prev => prev.filter(q => q.id !== id));
        alert('Quiz berhasil dihapus!');
      } else {
        alert(data.message || 'Gagal menghapus quiz');
      }
    } catch (error) {
      console.error('Delete quiz error:', error);
      alert('Terjadi kesalahan saat menghapus quiz');
    }
  };

  const handleToggleQuiz = async (id: string, aktif: boolean) => {
    try {
      const quizData = quiz.find(q => q.id === id);
      if (!quizData) return;

      const res = await fetch('/api/quiz', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          judul: quizData.judul,
          deskripsi: quizData.deskripsi,
          jenis: quizData.jenis,
          durasi: quizData.durasi,
          mapelId: quizData.mapelId,
          aktif: !aktif,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuiz(prev => prev.map(q => q.id === id ? { ...q, aktif: !aktif } : q));
        alert(`Quiz berhasil ${!aktif ? 'diaktifkan' : 'dinonaktifkan'}!`);
      } else {
        alert(data.message || 'Gagal mengubah status quiz');
      }
    } catch (error) {
      console.error('Toggle quiz error:', error);
      alert('Terjadi kesalahan saat mengubah status quiz');
    }
  };

  const addSoalToForm = () => {
    setSoalForm(prev => [...prev, { pertanyaan: '', opsiA: '', opsiB: '', opsiC: '', opsiD: '', jawaban: 'A' }]);
  };

  // Kehadiran Guru handler
  const handleAddKehadiranGuru = async () => {
    if (!kehadiranForm.guruId) {
      alert('Pilih guru terlebih dahulu');
      return;
    }

    try {
      const res = await fetch('/api/kehadiran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guruId: kehadiranForm.guruId,
          userId: currentUser?.id,
          tanggal: kehadiranForm.tanggal,
          status: kehadiranForm.status,
          keterangan: kehadiranForm.keterangan,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setKehadiranGuru(prev => [...prev, data.data]);
        setKehadiranForm({ guruId: '', tanggal: formatDate(new Date()), status: 'hadir', keterangan: '' });
        setDialogOpen(false);
        alert('Kehadiran berhasil dicatat!');
      } else {
        alert(data.message || 'Gagal menambah kehadiran');
      }
    } catch (error) {
      console.error('Add kehadiran error:', error);
      alert('Terjadi kesalahan saat mencatat kehadiran');
    }
  };

  // Profile update handler
  const handleUpdateProfile = async () => {
    if (!currentUser) return;

    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      alert('Password baru tidak cocok!');
      return;
    }

    setSavingProfile(true);
    try {
      // Update profile info
      const res = await fetch('/api/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: profileForm.nama || currentUser.nama,
          email: profileForm.email || currentUser.email,
          foto: profilePhoto,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Update password if provided
        if (profileForm.password && profileForm.newPassword) {
          const pwdRes = await fetch('/api/auth', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              currentPassword: profileForm.password,
              newPassword: profileForm.newPassword,
            }),
          });
          const pwdData = await pwdRes.json();
          if (!pwdData.success) {
            alert(pwdData.message || 'Gagal mengubah password');
            return;
          }
        }

        setCurrentUser(data.user);
        setProfileForm({ nama: '', email: '', password: '', newPassword: '', confirmPassword: '' });
        alert('Profil berhasil diperbarui!');
      } else {
        alert(data.message || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      alert('Terjadi kesalahan saat memperbarui profil');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle profile photo upload
  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfilePhoto(base64);
    };
    reader.readAsDataURL(file);
  };

  // Handle school logo upload
  const handleSekolahLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSekolahLogo(base64);
      setSekolahForm(prev => ({ ...prev, logo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  // Sekolah update handler
  const handleUpdateSekolah = async () => {
    setSavingSekolah(true);
    try {
      const res = await fetch('/api/sekolah', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: sekolahForm.nama || currentUser?.sekolah?.nama,
          alamat: sekolahForm.alamat,
          tahunAjaran: sekolahForm.tahunAjaran,
          logo: sekolahLogo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Update current user with new school data
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            sekolah: {
              ...currentUser.sekolah!,
              nama: data.data.nama,
              alamat: data.data.alamat,
              tahunAjaran: data.data.tahunAjaran,
              logo: data.data.logo,
            },
          });
        }
        alert('Data sekolah berhasil diperbarui!');
      } else {
        alert(data.message || 'Gagal memperbarui data sekolah');
      }
    } catch (error) {
      console.error('Update sekolah error:', error);
      alert('Terjadi kesalahan saat memperbarui data sekolah');
    } finally {
      setSavingSekolah(false);
    }
  };

  // Toggle guru status
  const toggleGuruStatus = async (guruId: string, currentStatus: string) => {
    alert('Fitur ubah status guru akan segera tersedia');
  };

  // Template upload handlers
  const handleMateriTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/templates/materi', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        // Pre-fill form with parsed data
        if (data.data) {
          setMateriForm(prev => ({
            ...prev,
            judul: data.data.judul || prev.judul,
            deskripsi: data.data.deskripsi || prev.deskripsi,
            konten: data.data.konten || prev.konten,
            kategori: data.data.kategori || prev.kategori,
          }));
        }
        alert(data.message || 'File berhasil diproses');
      } else {
        alert(data.message || 'Gagal memproses file');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat upload');
    } finally {
      setUploadingFile(false);
      if (materiFileRef.current) materiFileRef.current.value = '';
    }
  };

  const handleQuizTemplateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/templates/quiz', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        if (data.data) {
          setQuizForm(prev => ({
            ...prev,
            judul: data.data.judul || prev.judul,
            deskripsi: data.data.deskripsi || prev.deskripsi,
            jenis: data.data.jenis || prev.jenis,
            durasi: data.data.durasi || prev.durasi,
          }));
          if (data.data.soal && data.data.soal.length > 0) {
            setSoalForm(data.data.soal);
          }
        }
        alert(data.message || 'File berhasil diproses');
      } else {
        alert(data.message || 'Gagal memproses file');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat upload');
    } finally {
      setUploadingFile(false);
      if (quizFileRef.current) quizFileRef.current.value = '';
    }
  };

  // ==================== RENDER HELPERS ====================

  const renderLoginForm = () => (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f87171 0%, #ec4899 50%, #f97316 100%)' }}>
      {/* Glossy decorative elements */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-white/30 rounded-full blur-3xl float-animation"></div>
      <div className="absolute bottom-20 right-20 w-56 h-56 bg-yellow-300/40 rounded-full blur-3xl float-animation" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-pink-300/50 rounded-full blur-2xl float-animation" style={{animationDelay: '2s'}}></div>

      {/* Floating SD icons */}
      <div className="absolute top-20 right-20 opacity-20 float-animation" style={{animationDelay: '0.5s'}}>
        <School className="w-16 h-16 text-white" />
      </div>
      <div className="absolute bottom-32 left-32 opacity-20 float-animation" style={{animationDelay: '1.5s'}}>
        <GraduationCap className="w-12 h-12 text-white" />
      </div>

      <Card className="w-full max-w-md glossy-login-card rounded-3xl overflow-hidden relative">
        <div className="glossy-shimmer absolute inset-0 pointer-events-none"></div>

        <CardHeader className="text-center relative z-10 pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 glossy-icon-container rounded-2xl shadow-xl transform hover:scale-105 transition-transform pulse-glow">
              <School className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
            Aplikasi Sekolah SD
          </CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            Pembelajaran Jarak Jauh<br/>Tahun Pelajaran 2025/2026
          </CardDescription>
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 glossy-badge text-white rounded-full text-xs font-medium mx-auto">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            SD (Sekolah Dasar)
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Masukkan email"
                className="mt-1 glossy-input rounded-xl h-11"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Masukkan password"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="mt-1 glossy-input rounded-xl h-11"
              />
            </div>
            {loginError && (
              <Alert variant="destructive" className="bg-red-50/90 backdrop-blur-sm border-red-200 rounded-xl shadow-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            <Button
              className="w-full glossy-button text-white rounded-xl h-11 font-medium text-base"
              onClick={handleLogin}
            >
              Masuk
            </Button>

            <div className="mt-4 p-4 glossy-card rounded-xl">
              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Akun Demo:
              </p>
              <div className="text-xs space-y-1.5 text-gray-600">
                <p className="flex justify-between"><span className="font-medium text-red-600">Kepala Sekolah:</span> kepsek@sekolah.com / kepsek123</p>
                <p className="flex justify-between"><span className="font-medium text-red-600">Guru Kelas:</span> gurukelas@sekolah.com / guru123</p>
                <p className="flex justify-between"><span className="font-medium text-red-600">Guru Mapel:</span> gurumapel@sekolah.com / mapel123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSidebar = () => {
    if (!currentUser) return null;

    const menuItems: { id: string; label: string; icon: React.ReactNode; roles: UserRole[] }[] = [
      { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" />, roles: ['kepala_sekolah', 'guru_kelas', 'guru_mapel'] },
      { id: 'dataGuru', label: 'Data Guru', icon: <GraduationCap className="w-5 h-5" />, roles: ['kepala_sekolah'] },
      { id: 'kehadiranGuru', label: 'Kehadiran Guru', icon: <Calendar className="w-5 h-5" />, roles: ['kepala_sekolah'] },
      { id: 'laporanKS', label: 'Laporan', icon: <FileText className="w-5 h-5" />, roles: ['kepala_sekolah'] },
      { id: 'pengaturanSekolah', label: 'Pengaturan Sekolah', icon: <Settings className="w-5 h-5" />, roles: ['kepala_sekolah'] },
      { id: 'materi', label: 'Materi Ajar', icon: <BookOpen className="w-5 h-5" />, roles: ['guru_kelas', 'guru_mapel'] },
      { id: 'quizGuru', label: 'Quiz', icon: <ClipboardList className="w-5 h-5" />, roles: ['guru_kelas', 'guru_mapel'] },
      { id: 'rekapNilai', label: 'Rekap Nilai', icon: <BarChart3 className="w-5 h-5" />, roles: ['guru_kelas', 'guru_mapel'] },
      { id: 'laporanGuru', label: 'Laporan', icon: <FileText className="w-5 h-5" />, roles: ['guru_kelas', 'guru_mapel'] },
      { id: 'pengaturanSekolah', label: 'Pengaturan Sekolah', icon: <Settings className="w-5 h-5" />, roles: ['guru_kelas', 'guru_mapel'] },
      { id: 'profil', label: 'Pengaturan Profil', icon: <User className="w-5 h-5" />, roles: ['kepala_sekolah', 'guru_kelas', 'guru_mapel'] },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(currentUser.role));

    return (
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} min-h-screen transition-all duration-300 flex flex-col relative overflow-hidden glossy-sidebar`}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-0 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl"></div>
        <div className="absolute inset-0 glossy-shimmer pointer-events-none opacity-30"></div>

        <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/20">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-white/25 rounded-xl backdrop-blur-sm shadow-lg border border-white/30">
                <School className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-white">SD App</span>
                <p className="text-[10px] text-white/60">Sekolah Dasar</p>
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 backdrop-blur-sm rounded-xl border border-white/10" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-2 relative z-10 overflow-y-auto">
          {filteredMenu.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl mb-1.5 transition-all duration-200 ${
                activeMenu === item.id
                  ? 'glossy-menu-item active'
                  : 'glossy-menu-item'
              }`}
            >
              <div className={`${activeMenu === item.id ? 'text-white drop-shadow-lg' : 'text-white/80'}`}>
                {item.icon}
              </div>
              {sidebarOpen && <span className="font-medium text-white">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="relative z-10 p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/15 backdrop-blur-sm transition-all duration-200 border border-transparent hover:border-white/20"
          >
            <LogOut className="w-5 h-5 text-white" />
            {sidebarOpen && <span className="text-white">Keluar</span>}
          </button>
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    if (!currentUser) return null;

    const roleLabels: Record<UserRole, string> = {
      kepala_sekolah: 'Kepala Sekolah',
      guru_kelas: 'Guru Kelas',
      guru_mapel: 'Guru Mata Pelajaran'
    };

    return (
      <header className="glossy-card px-6 py-4 flex items-center justify-between border-b border-red-100/50">
        <div className="flex items-center gap-3">
          {/* Logo Dinas Pendidikan Kabupaten Cirebon */}
          <img
            src="https://i.pinimg.com/1200x/76/39/2d/76392d91c9c22d8ec5563b1126cd55b8.jpg"
            alt="Logo Dinas Pendidikan Kabupaten Cirebon"
            className="w-12 h-12 object-contain rounded-lg shadow-sm"
          />
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              {currentUser.sekolah?.nama || 'Sekolah SD'}
            </h1>
            <p className="text-sm text-gray-500">
              Tahun Pelajaran {currentUser.sekolah?.tahunAjaran || '2025/2026'} - SD (Sekolah Dasar)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="glossy-badge text-white border-0 px-3 py-1 rounded-full">
            {roleLabels[currentUser.role]}
          </Badge>
          <div className="flex items-center gap-3 p-2 rounded-xl glossy-card">
            <Avatar className="border-2 border-red-200">
              {currentUser.foto ? (
                <AvatarImage src={currentUser.foto} alt={currentUser.nama} />
              ) : null}
              <AvatarFallback className="glossy-icon-container border-0">
                {currentUser.nama.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">{currentUser.nama}</p>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </header>
    );
  };

  // ==================== CONTENT RENDERERS ====================

  const renderDashboard = () => {
    if (loadingData) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      );
    }

    if (currentUser?.role === 'kepala_sekolah') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 glossy-icon-container rounded-xl">
              <Home className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Dashboard Kepala Sekolah</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glossy-stat-card rounded-2xl border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 glossy-icon-container rounded-xl">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Guru</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">{guru.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glossy-stat-card rounded-2xl border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl shadow-lg">
                    <School className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Kelas</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{kelas.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glossy-stat-card rounded-2xl border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Materi</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{materi.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="glossy-stat-card rounded-2xl border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Guru Aktif</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{guru.filter(g => g.status === 'aktif').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glossy-card rounded-2xl border-0">
            <CardHeader className="border-b border-red-100/50">
              <CardTitle className="text-red-700 flex items-center gap-2">
                <School className="w-5 h-5" />
                Informasi Sekolah SD
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl">
                  <p className="text-sm text-gray-500">Nama Sekolah</p>
                  <p className="font-medium text-gray-800">{currentUser.sekolah?.nama || '-'}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                  <p className="text-sm text-gray-500">NPSN</p>
                  <p className="font-medium text-gray-800">{currentUser.sekolah?.npsn || '-'}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <p className="text-sm text-gray-500">Jenjang</p>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <Badge className="glossy-badge text-white border-0">SD</Badge>
                    Sekolah Dasar
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl">
                  <p className="text-sm text-gray-500">Alamat</p>
                  <p className="font-medium text-gray-800">{currentUser.sekolah?.alamat || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dinas Pendidikan Card */}
          <Card className="glossy-card rounded-2xl border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-white rounded-xl shadow-lg p-2 flex items-center justify-center border border-red-100">
                    <img
                      src="https://i.pinimg.com/1200x/76/39/2d/76392d91c9c22d8ec5563b1126cd55b8.jpg"
                      alt="Logo Dinas Pendidikan Kabupaten Cirebon"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Dinas Pendidikan</p>
                  <p className="text-xs text-gray-400 text-center">Kabupaten Cirebon</p>
                </div>
                <div className="flex-1 text-center">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    Aplikasi Pembelajaran Jarak Jauh
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Tahun Pelajaran {currentUser.sekolah?.tahunAjaran || '2025/2026'}</p>
                  <p className="text-xs text-gray-500 mt-2">Jenjang SD (Sekolah Dasar)</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-white rounded-xl shadow-lg p-2 flex items-center justify-center border border-red-100">
                    {currentUser.sekolah?.logo ? (
                      <img
                        src={currentUser.sekolah.logo}
                        alt="Logo Sekolah"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <School className="w-12 h-12 text-red-300" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Logo Sekolah</p>
                  <p className="text-xs text-gray-400 text-center">{currentUser.sekolah?.nama || 'SD'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Guru Dashboard
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 glossy-icon-container rounded-xl">
            <Home className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Dashboard {currentUser.role === 'guru_kelas' ? 'Guru Kelas' : 'Guru Mapel'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glossy-stat-card rounded-2xl border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Materi</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{materi.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glossy-stat-card rounded-2xl border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl shadow-lg">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Quiz</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{quiz.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glossy-stat-card rounded-2xl border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mata Pelajaran</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{mapel.filter(m => m.guruId === currentUser.guru?.id).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glossy-stat-card rounded-2xl border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 glossy-icon-container rounded-xl shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jenis Guru</p>
                  <p className="text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent capitalize">
                    {currentUser.guru?.jenisGuru?.replace('_', ' ') || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {currentUser.guru && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Guru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">NIP</p>
                  <p className="font-medium">{currentUser.guru.nip}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nama</p>
                  <p className="font-medium">{currentUser.guru.nama}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jenis Guru</p>
                  <p className="font-medium capitalize">{currentUser.guru.jenisGuru?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={currentUser.guru.status === 'aktif' ? 'default' : 'secondary'} className={currentUser.guru.status === 'aktif' ? 'bg-green-600' : ''}>
                    {currentUser.guru.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dinas Pendidikan Card */}
        <Card className="glossy-card rounded-2xl border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-xl shadow-lg p-2 flex items-center justify-center border border-red-100">
                  <img
                    src="https://i.pinimg.com/1200x/76/39/2d/76392d91c9c22d8ec5563b1126cd55b8.jpg"
                    alt="Logo Dinas Pendidikan Kabupaten Cirebon"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Dinas Pendidikan</p>
                <p className="text-xs text-gray-400 text-center">Kabupaten Cirebon</p>
              </div>
              <div className="flex-1 text-center">
                <h3 className="text-lg font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Aplikasi Pembelajaran Jarak Jauh
                </h3>
                <p className="text-sm text-gray-600 mt-1">Tahun Pelajaran {currentUser.sekolah?.tahunAjaran || '2025/2026'}</p>
                <p className="text-xs text-gray-500 mt-2">Jenjang SD (Sekolah Dasar)</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-xl shadow-lg p-2 flex items-center justify-center border border-red-100">
                  {currentUser.sekolah?.logo ? (
                    <img
                      src={currentUser.sekolah.logo}
                      alt="Logo Sekolah"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <School className="w-12 h-12 text-red-300" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">Logo Sekolah</p>
                <p className="text-xs text-gray-400 text-center">{currentUser.sekolah?.nama || 'SD'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDataGuru = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Data Guru</h2>
        <Badge variant="outline">Total: {guru.length} guru</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIP</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Jenis Guru</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guru.map(g => (
                  <TableRow key={g.id}>
                    <TableCell>{g.nip}</TableCell>
                    <TableCell className="font-medium">{g.nama}</TableCell>
                    <TableCell>{g.email}</TableCell>
                    <TableCell>{g.telepon || '-'}</TableCell>
                    <TableCell className="capitalize">{g.jenisGuru?.replace('_', ' ')}</TableCell>
                    <TableCell>
                      <Badge variant={g.status === 'aktif' ? 'default' : 'secondary'}
                        className={g.status === 'aktif' ? 'bg-green-600' : ''}>
                        {g.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderKehadiranGuru = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kehadiran Guru</h2>
        <Dialog open={dialogOpen && dialogType === 'addKehadiranGuru'} onOpenChange={(open) => { setDialogOpen(open); setDialogType(open ? 'addKehadiranGuru' : ''); }}>
          <DialogTrigger asChild>
            <Button className={`${theme.primary}`}>
              <Plus className="w-4 h-4 mr-2" /> Tambah Kehadiran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kehadiran Guru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Guru</Label>
                <Select value={kehadiranForm.guruId} onValueChange={(v) => setKehadiranForm(prev => ({ ...prev, guruId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Guru" />
                  </SelectTrigger>
                  <SelectContent>
                    {guru.map(g => (
                      <SelectItem key={g.id} value={g.id}>{g.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tanggal</Label>
                <Input type="date" value={kehadiranForm.tanggal} onChange={(e) => setKehadiranForm(prev => ({ ...prev, tanggal: e.target.value }))} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={kehadiranForm.status} onValueChange={(v) => setKehadiranForm(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hadir">Hadir</SelectItem>
                    <SelectItem value="izin">Izin</SelectItem>
                    <SelectItem value="sakit">Sakit</SelectItem>
                    <SelectItem value="alpha">Alpha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Keterangan</Label>
                <Input value={kehadiranForm.keterangan} onChange={(e) => setKehadiranForm(prev => ({ ...prev, keterangan: e.target.value }))} />
              </div>
              <Button className={`w-full ${theme.primary}`} onClick={handleAddKehadiranGuru}>Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama Guru</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kehadiranGuru.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map(k => (
                  <TableRow key={k.id}>
                    <TableCell>{formatDate(k.tanggal)}</TableCell>
                    <TableCell className="font-medium">{k.guru?.nama || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={k.status === 'hadir' ? 'default' : k.status === 'izin' ? 'outline' : 'destructive'}
                        className={k.status === 'hadir' ? 'bg-green-600' : ''}>
                        {k.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{k.keterangan || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderLaporanKS = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Laporan</h2>

      <Tabs defaultValue="rekapGuru">
        <TabsList>
          <TabsTrigger value="rekapGuru">Rekap Guru</TabsTrigger>
          <TabsTrigger value="rekapKehadiranGuru">Rekap Kehadiran Guru</TabsTrigger>
          <TabsTrigger value="rekapMateri">Rekap Materi</TabsTrigger>
          <TabsTrigger value="rekapQuiz">Rekap Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="rekapGuru">
          <Card>
            <CardHeader>
              <CardTitle>Rekap Data Guru</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIP</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jenis Guru</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guru.map(g => (
                    <TableRow key={g.id}>
                      <TableCell>{g.nip}</TableCell>
                      <TableCell className="font-medium">{g.nama}</TableCell>
                      <TableCell className="capitalize">{g.jenisGuru?.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge variant={g.status === 'aktif' ? 'default' : 'secondary'} className={g.status === 'aktif' ? 'bg-green-600' : ''}>
                          {g.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rekapKehadiranGuru">
          <Card>
            <CardHeader>
              <CardTitle>Rekap Kehadiran Guru</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Guru</TableHead>
                    <TableHead>Hadir</TableHead>
                    <TableHead>Izin</TableHead>
                    <TableHead>Sakit</TableHead>
                    <TableHead>Alpha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guru.map(g => {
                    const kehadiranG = kehadiranGuru.filter(k => k.guruId === g.id);
                    return (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">{g.nama}</TableCell>
                        <TableCell>{kehadiranG.filter(k => k.status === 'hadir').length}</TableCell>
                        <TableCell>{kehadiranG.filter(k => k.status === 'izin').length}</TableCell>
                        <TableCell>{kehadiranG.filter(k => k.status === 'sakit').length}</TableCell>
                        <TableCell>{kehadiranG.filter(k => k.status === 'alpha').length}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rekapMateri">
          <Card>
            <CardHeader>
              <CardTitle>Rekap Materi per Guru</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guru</TableHead>
                    <TableHead>Jumlah Materi</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guru.map(g => {
                    const materiG = materi.filter(m => m.guruId === g.id);
                    const mapelIds = [...new Set(materiG.map(m => m.mapelId))];
                    return (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">{g.nama}</TableCell>
                        <TableCell>{materiG.length}</TableCell>
                        <TableCell>{mapelIds.length}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rekapQuiz">
          <Card>
            <CardHeader>
              <CardTitle>Rekap Quiz per Guru</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guru</TableHead>
                    <TableHead>Jumlah Quiz</TableHead>
                    <TableHead>Quiz Aktif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guru.map(g => {
                    const quizG = quiz.filter(q => q.guruId === g.id);
                    return (
                      <TableRow key={g.id}>
                        <TableCell className="font-medium">{g.nama}</TableCell>
                        <TableCell>{quizG.length}</TableCell>
                        <TableCell>{quizG.filter(q => q.aktif).length}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderMateri = () => {
    const guruId = currentUser?.guru?.id;
    const guruMapel = mapel.filter(m => m.guruId === guruId);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Materi Ajar</h2>
          <Dialog open={dialogOpen && (dialogType === 'addMateri' || dialogType === 'editMateri')} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditItem(null); setDialogType(''); }}}>
            <DialogTrigger asChild>
              <Button className={`${theme.primary}`} onClick={() => { setDialogType('addMateri'); setMateriForm({ judul: '', deskripsi: '', konten: '', kategori: 'umum', mapelId: '' }); setDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Materi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editItem ? 'Edit Materi' : 'Tambah Materi Baru'}</DialogTitle>
                <DialogDescription>Sesuai Kurikulum Merdeka</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Template buttons */}
                <div className="flex gap-2 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open('/api/templates/materi', '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" /> Download Template
                  </Button>
                  <div className="flex-1">
                    <input
                      ref={materiFileRef}
                      type="file"
                      accept=".docx"
                      className="hidden"
                      onChange={handleMateriTemplateUpload}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => materiFileRef.current?.click()}
                      disabled={uploadingFile}
                    >
                      {uploadingFile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      Upload Template
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Judul Materi</Label>
                  <Input value={materiForm.judul} onChange={(e) => setMateriForm(prev => ({ ...prev, judul: e.target.value }))} />
                </div>
                <div>
                  <Label>Deskripsi</Label>
                  <Input value={materiForm.deskripsi} onChange={(e) => setMateriForm(prev => ({ ...prev, deskripsi: e.target.value }))} />
                </div>
                <div>
                  <Label>Mata Pelajaran</Label>
                  <Select value={materiForm.mapelId} onValueChange={(v) => setMateriForm(prev => ({ ...prev, mapelId: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Mata Pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {guruMapel.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Kategori</Label>
                  <Select value={materiForm.kategori} onValueChange={(v) => setMateriForm(prev => ({ ...prev, kategori: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="umum">Umum</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Konten Materi</Label>
                  <Textarea rows={10} value={materiForm.konten} onChange={(e) => setMateriForm(prev => ({ ...prev, konten: e.target.value }))} placeholder="Tulis konten materi (mendukung HTML)" />
                </div>
                <Button className={`w-full ${theme.primary}`} onClick={editItem ? handleUpdateMateri : handleAddMateri}>
                  {editItem ? 'Update' : 'Simpan'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materi.map(m => {
            const mapelData = mapel.find(mp => mp.id === m.mapelId);
            return (
              <Card key={m.id} className="overflow-hidden">
                {!m.gambar && (
                  <div className="h-40 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-green-600" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{m.judul}</CardTitle>
                    <Badge variant={m.kategori === 'template' ? 'secondary' : 'default'} className="bg-green-600">
                      {m.kategori}
                    </Badge>
                  </div>
                  <CardDescription>{mapelData?.nama || '-'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">{m.deskripsi}</p>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => handleEditMateri(m)}>
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteMateri(m.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {materi.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada materi. Klik "Tambah Materi" untuk membuat materi baru.</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderQuizGuru = () => {
    const guruId = currentUser?.guru?.id;
    const guruMapel = mapel.filter(m => m.guruId === guruId);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Quiz</h2>
          <Dialog open={dialogOpen && dialogType === 'addQuiz'} onOpenChange={(open) => { setDialogOpen(open); setDialogType(open ? 'addQuiz' : ''); }}>
            <DialogTrigger asChild>
              <Button className={`${theme.primary}`} onClick={() => { setSoalForm([]); setQuizForm({ judul: '', deskripsi: '', jenis: 'harian', durasi: 30, mapelId: '' }); setDialogType('addQuiz'); setDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Quiz Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Template buttons */}
                <div className="flex gap-2 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open('/api/templates/quiz', '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" /> Download Template
                  </Button>
                  <div className="flex-1">
                    <input
                      ref={quizFileRef}
                      type="file"
                      accept=".docx"
                      className="hidden"
                      onChange={handleQuizTemplateUpload}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => quizFileRef.current?.click()}
                      disabled={uploadingFile}
                    >
                      {uploadingFile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      Upload Template
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Judul Quiz</Label>
                    <Input value={quizForm.judul} onChange={(e) => setQuizForm(prev => ({ ...prev, judul: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Mata Pelajaran</Label>
                    <Select value={quizForm.mapelId} onValueChange={(v) => setQuizForm(prev => ({ ...prev, mapelId: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Mapel" />
                      </SelectTrigger>
                      <SelectContent>
                        {guruMapel.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Jenis Quiz</Label>
                    <Select value={quizForm.jenis} onValueChange={(v) => setQuizForm(prev => ({ ...prev, jenis: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="harian">Harian</SelectItem>
                        <SelectItem value="uts">UTS</SelectItem>
                        <SelectItem value="uas">UAS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Durasi (menit)</Label>
                    <Input type="number" value={quizForm.durasi} onChange={(e) => setQuizForm(prev => ({ ...prev, durasi: parseInt(e.target.value) }))} />
                  </div>
                </div>
                <div>
                  <Label>Deskripsi</Label>
                  <Textarea value={quizForm.deskripsi} onChange={(e) => setQuizForm(prev => ({ ...prev, deskripsi: e.target.value }))} />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Soal-soal Quiz</Label>
                    <Button size="sm" onClick={addSoalToForm}>
                      <Plus className="w-4 h-4 mr-1" /> Tambah Soal
                    </Button>
                  </div>

                  {soalForm.map((soal, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Soal {index + 1}</span>
                          <Button size="sm" variant="ghost" onClick={() => setSoalForm(prev => prev.filter((_, i) => i !== index))}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                        <Textarea value={soal.pertanyaan} onChange={(e) => setSoalForm(prev => prev.map((s, i) => i === index ? { ...s, pertanyaan: e.target.value } : s))} placeholder="Pertanyaan" />
                        <div className="grid grid-cols-2 gap-2">
                          <Input value={soal.opsiA} onChange={(e) => setSoalForm(prev => prev.map((s, i) => i === index ? { ...s, opsiA: e.target.value } : s))} placeholder="Opsi A" />
                          <Input value={soal.opsiB} onChange={(e) => setSoalForm(prev => prev.map((s, i) => i === index ? { ...s, opsiB: e.target.value } : s))} placeholder="Opsi B" />
                          <Input value={soal.opsiC} onChange={(e) => setSoalForm(prev => prev.map((s, i) => i === index ? { ...s, opsiC: e.target.value } : s))} placeholder="Opsi C" />
                          <Input value={soal.opsiD} onChange={(e) => setSoalForm(prev => prev.map((s, i) => i === index ? { ...s, opsiD: e.target.value } : s))} placeholder="Opsi D" />
                        </div>
                        <div>
                          <Label>Jawaban Benar</Label>
                          <Select value={soal.jawaban} onValueChange={(v: 'A' | 'B' | 'C' | 'D') => setSoalForm(prev => prev.map((s, i) => i === index ? { ...s, jawaban: v } : s))}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button className={`w-full ${theme.primary}`} onClick={handleAddQuiz}>Simpan Quiz</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quiz.map(q => {
            const mapelData = mapel.find(m => m.id === q.mapelId);
            const soalCount = q.soal?.length || q._count?.soal || 0;

            return (
              <Card key={q.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{q.judul}</CardTitle>
                      <CardDescription>{mapelData?.nama || '-'}</CardDescription>
                    </div>
                    <Badge variant={q.jenis === 'harian' ? 'default' : q.jenis === 'uts' ? 'secondary' : 'destructive'}
                      className={q.jenis === 'harian' ? 'bg-green-600' : ''}>
                      {q.jenis.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span><Clock className="w-4 h-4 inline mr-1" />{q.durasi} menit</span>
                      <span><ClipboardList className="w-4 h-4 inline mr-1" />{soalCount} soal</span>
                    </div>
                    <Badge variant={q.aktif ? 'default' : 'secondary'} className={q.aktif ? 'bg-green-600' : ''}>
                      {q.aktif ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleToggleQuiz(q.id, q.aktif)}>
                      {q.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteQuiz(q.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {quiz.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada quiz. Klik "Tambah Quiz" untuk membuat quiz baru.</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderRekapNilai = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rekap Nilai</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Fitur rekap nilai akan segera tersedia. Nilai dari quiz yang dikerjakan akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderLaporanGuru = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Laporan</h2>

      <Tabs defaultValue="rekapMateri">
        <TabsList>
          <TabsTrigger value="rekapMateri">Rekap Materi</TabsTrigger>
          <TabsTrigger value="rekapQuiz">Rekap Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="rekapMateri">
          <Card>
            <CardHeader>
              <CardTitle>Rekap Materi Anda</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materi.map(m => {
                    const mapelData = mapel.find(mp => mp.id === m.mapelId);
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.judul}</TableCell>
                        <TableCell>{mapelData?.nama || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={m.kategori === 'template' ? 'secondary' : 'default'} className="bg-green-600">
                            {m.kategori}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(m.createdAt)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rekapQuiz">
          <Card>
            <CardHeader>
              <CardTitle>Rekap Quiz Anda</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quiz.map(q => {
                    const mapelData = mapel.find(mp => mp.id === q.mapelId);
                    return (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">{q.judul}</TableCell>
                        <TableCell>{mapelData?.nama || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={q.jenis === 'harian' ? 'default' : q.jenis === 'uts' ? 'secondary' : 'destructive'}
                            className={q.jenis === 'harian' ? 'bg-green-600' : ''}>
                            {q.jenis.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={q.aktif ? 'default' : 'secondary'} className={q.aktif ? 'bg-green-600' : ''}>
                            {q.aktif ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderProfil = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Pengaturan Profil</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block">
                <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-red-100 shadow-lg">
                  {profilePhoto || currentUser?.foto ? (
                    <AvatarImage src={profilePhoto || currentUser?.foto} alt={currentUser?.nama} />
                  ) : null}
                  <AvatarFallback className={`text-4xl ${theme.primaryBg} text-white`}>
                    {currentUser?.nama.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => profilePhotoRef.current?.click()}
                  className="absolute bottom-4 right-0 p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-lg hover:from-red-600 hover:to-pink-600 transition-all"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={profilePhotoRef}
                  onChange={handleProfilePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <h3 className="text-xl font-bold">{currentUser?.nama}</h3>
              <p className="text-gray-500">{currentUser?.email}</p>
              {(profilePhoto || currentUser?.foto) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 text-red-600 border-red-200"
                  onClick={() => setProfilePhoto('')}
                >
                  Hapus Foto
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informasi Akun</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Nama</Label>
                  <Input value={profileForm.nama} onChange={(e) => setProfileForm(prev => ({ ...prev, nama: e.target.value }))} placeholder={currentUser?.nama} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={profileForm.email} onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))} placeholder={currentUser?.email} />
                </div>

                <Separator />

                <h4 className="font-medium">Ubah Password</h4>
                <div>
                  <Label>Password Lama</Label>
                  <Input type="password" value={profileForm.password} onChange={(e) => setProfileForm(prev => ({ ...prev, password: e.target.value }))} />
                </div>
                <div>
                  <Label>Password Baru</Label>
                  <Input type="password" value={profileForm.newPassword} onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))} />
                </div>
                <div>
                  <Label>Konfirmasi Password Baru</Label>
                  <Input type="password" value={profileForm.confirmPassword} onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))} />
                </div>

                <Button className={`${theme.primary}`} onClick={handleUpdateProfile} disabled={savingProfile}>
                  {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {currentUser?.guru && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Guru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">NIP</p>
                  <p className="font-medium">{currentUser.guru.nip}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jenis Guru</p>
                  <p className="font-medium capitalize">{currentUser.guru.jenisGuru?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={currentUser.guru.status === 'aktif' ? 'default' : 'secondary'} className={currentUser.guru.status === 'aktif' ? 'bg-green-600' : ''}>
                    {currentUser.guru.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderPengaturanSekolah = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Pengaturan Sekolah</h2>
          <Badge variant="outline" className="bg-red-50/80 backdrop-blur-sm text-red-700 border-red-200 px-3 py-1 rounded-full">
            SD (Sekolah Dasar)
          </Badge>
        </div>

        <Card className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-b border-red-100">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <School className="w-5 h-5" />
              Data Sekolah Dasar
            </CardTitle>
            <CardDescription>Kelola informasi sekolah untuk pembelajaran jarak jauh</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Logo Upload Section */}
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100">
                <div className="relative">
                  <div className="w-32 h-32 rounded-xl border-4 border-red-200 shadow-lg overflow-hidden bg-white flex items-center justify-center">
                    {sekolahLogo || currentUser?.sekolah?.logo ? (
                      <img
                        src={sekolahLogo || currentUser?.sekolah?.logo}
                        alt="Logo Sekolah"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <School className="w-12 h-12 text-red-300" />
                    )}
                  </div>
                  <button
                    onClick={() => sekolahLogoRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-lg hover:from-red-600 hover:to-pink-600 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <input
                    type="file"
                    ref={sekolahLogoRef}
                    onChange={handleSekolahLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-3 text-center">Logo Sekolah</p>
                <p className="text-xs text-gray-400">Klik untuk mengunggah logo</p>
                {(sekolahLogo || currentUser?.sekolah?.logo) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-red-600 border-red-200"
                    onClick={() => {
                      setSekolahLogo('');
                      setSekolahForm(prev => ({ ...prev, logo: '' }));
                    }}
                  >
                    Hapus Logo
                  </Button>
                )}
              </div>

              {/* School Data Form */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium">Nama Sekolah</Label>
                    <Input
                      value={sekolahForm.nama || currentUser?.sekolah?.nama || ''}
                      onChange={(e) => setSekolahForm(prev => ({ ...prev, nama: e.target.value }))}
                      placeholder="Masukkan nama sekolah"
                      className="mt-1 bg-white/60 backdrop-blur-sm border-gray-200 focus:border-red-400 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">NPSN</Label>
                    <Input
                      value={sekolahForm.npsn || currentUser?.sekolah?.npsn || ''}
                      onChange={(e) => setSekolahForm(prev => ({ ...prev, npsn: e.target.value }))}
                      placeholder="Masukkan NPSN"
                      className="mt-1 bg-white/60 backdrop-blur-sm border-gray-200 focus:border-red-400 rounded-xl"
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Alamat</Label>
                  <Textarea
                    value={sekolahForm.alamat || currentUser?.sekolah?.alamat || ''}
                    onChange={(e) => setSekolahForm(prev => ({ ...prev, alamat: e.target.value }))}
                    placeholder="Masukkan alamat sekolah"
                    rows={2}
                    className="mt-1 bg-white/60 backdrop-blur-sm border-gray-200 focus:border-red-400 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-700 font-medium">Jenjang Pendidikan</Label>
                    <div className="mt-1 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <School className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-red-700">SD (Sekolah Dasar)</p>
                        <p className="text-xs text-gray-500">Jenjang tetap untuk aplikasi ini</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-700 font-medium">Tahun Pelajaran</Label>
                    <Input
                      value={sekolahForm.tahunAjaran || currentUser?.sekolah?.tahunAjaran || '2025/2026'}
                      onChange={(e) => setSekolahForm(prev => ({ ...prev, tahunAjaran: e.target.value }))}
                      placeholder="Contoh: 2025/2026"
                      className="mt-1 bg-white/60 backdrop-blur-sm border-gray-200 focus:border-red-400 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <Button
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg rounded-xl"
                onClick={handleUpdateSekolah}
                disabled={savingSekolah}
              >
                {savingSekolah ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setSekolahForm({ nama: '', npsn: '', alamat: '', jenjang: 'SD', tahunAjaran: currentUser?.sekolah?.tahunAjaran || '2025/2026', logo: '' });
                  setSekolahLogo('');
                }}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-b border-red-100">
            <CardTitle className="text-red-700">Statistik Sekolah</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-white rounded-xl border border-red-100 shadow-sm">
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">{guru.filter(g => g.status === 'aktif').length}</p>
                <p className="text-sm text-gray-500">Guru Aktif</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-white rounded-xl border border-pink-100 shadow-sm">
                <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">{kelas.length}</p>
                <p className="text-sm text-gray-500">Total Kelas</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 shadow-sm">
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{materi.length}</p>
                <p className="text-sm text-gray-500">Total Materi</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 shadow-sm">
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{quiz.length}</p>
                <p className="text-sm text-gray-500">Total Quiz</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ==================== MAIN CONTENT RENDERER ====================
  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeMenu) {
      case 'dashboard':
        return renderDashboard();
      case 'dataGuru':
        return renderDataGuru();
      case 'kehadiranGuru':
        return renderKehadiranGuru();
      case 'laporanKS':
        return renderLaporanKS();
      case 'materi':
        return renderMateri();
      case 'quizGuru':
        return renderQuizGuru();
      case 'rekapNilai':
        return renderRekapNilai();
      case 'laporanGuru':
        return renderLaporanGuru();
      case 'profil':
        return renderProfil();
      case 'pengaturanSekolah':
        return renderPengaturanSekolah();
      default:
        return renderDashboard();
    }
  };

  // ==================== MAIN RENDER ====================
  if (isLoading || isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f87171 0%, #ec4899 50%, #f97316 100%)' }}>
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/30 rounded-full blur-3xl float-animation"></div>
        <div className="absolute bottom-20 right-20 w-56 h-56 bg-yellow-300/40 rounded-full blur-3xl float-animation" style={{animationDelay: '1s'}}></div>

        <div className="text-center relative z-10">
          <div className="p-6 glossy-card rounded-3xl">
            <div className="p-4 glossy-icon-container rounded-2xl mx-auto mb-4 w-fit pulse-glow">
              <School className="w-10 h-10 text-white" />
            </div>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Memuat Aplikasi SD...</p>
            <p className="text-xs text-gray-500 mt-1">Sekolah Dasar</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return renderLoginForm();
  }

  return (
    <div className="min-h-screen flex relative"
      style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fdf2f8 50%, #fff7ed 100%)' }}>
      {/* Glossy background decorations */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-red-300/20 rounded-full blur-[100px] -z-10"></div>
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-pink-300/20 rounded-full blur-[80px] -z-10"></div>
      <div className="fixed top-1/2 left-1/2 w-[300px] h-[300px] bg-orange-200/20 rounded-full blur-[60px] -z-10"></div>

      {renderSidebar()}
      <div className="flex-1 flex flex-col">
        {renderHeader()}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
