'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  School, Users, LogOut, Home, Plus, Edit, Trash2, AlertCircle,
  CheckCircle, Key, UserPlus, Building2, RefreshCw, Download, Upload
} from 'lucide-react';

// Types
interface AdminUser {
  id: string;
  email: string;
  nama: string;
  role: string;
  sekolahId?: string;
  sekolah?: SekolahData;
}

interface SekolahData {
  id: string;
  nama: string;
  npsn: string;
  alamat?: string;
  jenjang: string;
  tahunAjaran: string;
  _count?: {
    guru: number;
    kelas: number;
    users: number;
  };
}

interface UserData {
  id: string;
  email: string;
  nama: string;
  role: string;
  isActive: boolean;
  sekolahId?: string;
  sekolah?: SekolahData;
  guru?: {
    id: string;
    nip: string;
    telepon?: string;
    alamat?: string;
    jenisGuru: string;
  };
  createdAt: string;
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data states
  const [schools, setSchools] = useState<SekolahData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);

  // Dialog states
  const [schoolDialogOpen, setSchoolDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editSchool, setEditSchool] = useState<SekolahData | null>(null);
  const [editUser, setEditUser] = useState<UserData | null>(null);

  // Form states
  const [schoolForm, setSchoolForm] = useState({
    nama: '',
    npsn: '',
    alamat: '',
    jenjang: 'SD',
    tahunAjaran: '2025/2026',
  });

  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    nama: '',
    role: 'guru_kelas',
    sekolahId: '',
    nip: '',
    telepon: '',
    alamat: '',
  });

  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Check auth on mount - using IIFE pattern to avoid setState warning
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();

        if (mounted && data.authenticated) {
          setCurrentUser(data.user);
          // Load data after auth
          const [schoolsRes, usersRes] = await Promise.all([
            fetch('/api/admin/sekolah'),
            fetch('/api/admin/users'),
          ]);
          const schoolsData = await schoolsRes.json();
          const usersData = await usersRes.json();
          if (mounted) {
            if (schoolsData.success) setSchools(schoolsData.data);
            if (usersData.success) setUsers(usersData.data);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
      if (mounted) setIsLoading(false);
    };
    
    initAuth();
    
    return () => { mounted = false; };
  }, []);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return; // Prevent double-click
    
    try {
      setIsLoggingIn(true);
      setLoginError('');
      
      console.log('Attempting login with:', { email: loginForm.email });
      
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
        credentials: 'include', // Important for cookies
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (data.success) {
        console.log('Login successful, setting user...');
        setCurrentUser(data.user);
        setLoginForm({ email: '', password: '' });
        
        // Load data after login - with error handling
        try {
          const [schoolsRes, usersRes] = await Promise.all([
            fetch('/api/admin/sekolah'),
            fetch('/api/admin/users'),
          ]);
          const schoolsData = await schoolsRes.json();
          const usersData = await usersRes.json();
          if (schoolsData.success) setSchools(schoolsData.data);
          if (usersData.success) setUsers(usersData.data);
        } catch (loadError) {
          console.error('Error loading data after login:', loadError);
          // Don't fail the login if data loading fails
        }
      } else {
        console.log('Login failed:', data.message);
        setLoginError(data.message || 'Login gagal');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Terjadi kesalahan server. Silakan coba lagi.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const loadData = async () => {
    const [schoolsRes, usersRes] = await Promise.all([
      fetch('/api/admin/sekolah'),
      fetch('/api/admin/users'),
    ]);
    const schoolsData = await schoolsRes.json();
    const usersData = await usersRes.json();
    if (schoolsData.success) setSchools(schoolsData.data);
    if (usersData.success) setUsers(usersData.data);
  };

  const loadSchools = async () => {
    try {
      const res = await fetch('/api/admin/sekolah');
      const data = await res.json();
      if (data.success) setSchools(data.data);
    } catch (error) {
      console.error('Load schools error:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) {
      console.error('Load users error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // School CRUD
  const handleSaveSchool = async () => {
    try {
      const url = '/api/admin/sekolah';
      const method = editSchool ? 'PUT' : 'POST';
      const body = editSchool ? { ...schoolForm, id: editSchool.id } : schoolForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        await loadSchools();
        setSchoolDialogOpen(false);
        setEditSchool(null);
        setSchoolForm({
          nama: '',
          npsn: '',
          alamat: '',
          jenjang: 'SD',
          tahunAjaran: '2025/2026',
        });
        alert(editSchool ? 'Sekolah berhasil diperbarui!' : 'Sekolah berhasil ditambahkan!');
      } else {
        alert(data.message || 'Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Save school error:', error);
      alert('Terjadi kesalahan server');
    }
  };

  const handleDeleteSchool = async (id: string) => {
    if (!confirm('Yakin ingin menghapus sekolah ini? Semua data terkait akan ikut terhapus.')) return;

    try {
      const res = await fetch(`/api/admin/sekolah?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        await loadSchools();
        alert('Sekolah berhasil dihapus!');
      } else {
        alert(data.message || 'Gagal menghapus sekolah');
      }
    } catch (error) {
      console.error('Delete school error:', error);
      alert('Terjadi kesalahan server');
    }
  };

  // User CRUD
  const handleSaveUser = async () => {
    try {
      const url = '/api/admin/users';
      const method = editUser ? 'PUT' : 'POST';
      const body = editUser
        ? { ...userForm, id: editUser.id, isActive: editUser.isActive }
        : userForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        await loadUsers();
        setUserDialogOpen(false);
        setEditUser(null);
        setUserForm({
          email: '',
          password: '',
          nama: '',
          role: 'guru_kelas',
          sekolahId: '',
          nip: '',
          telepon: '',
          alamat: '',
        });
        alert(editUser ? 'User berhasil diperbarui!' : 'User berhasil ditambahkan!');
      } else {
        alert(data.message || 'Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Save user error:', error);
      alert('Terjadi kesalahan server');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Yakin ingin menghapus user ini?')) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        await loadUsers();
        alert('User berhasil dihapus!');
      } else {
        alert(data.message || 'Gagal menghapus user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      alert('Terjadi kesalahan server');
    }
  };

  const handleToggleUserStatus = async (user: UserData) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
          sekolahId: user.sekolahId,
          isActive: !user.isActive,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await loadUsers();
        alert(`User berhasil ${user.isActive ? 'dinonaktifkan' : 'diaktifkan'}!`);
      } else {
        alert(data.message || 'Gagal mengubah status');
      }
    } catch (error) {
      console.error('Toggle user status error:', error);
      alert('Terjadi kesalahan server');
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUserId || !newPassword) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: resetPasswordUserId, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Password berhasil direset');
        setResetPasswordUserId(null);
        setNewPassword('');
      } else {
        alert(data.message || 'Gagal reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      alert('Terjadi kesalahan server');
    }
  };

  const handleSeedData = async () => {
    if (!confirm('Ingin membuat data awal (2 sekolah dan beberapa user)?')) return;

    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        alert(data.message || 'Data awal berhasil dibuat!');
        loadData();
      } else {
        alert(data.message || 'Gagal membuat data awal');
      }
    } catch (error) {
      console.error('Seed data error:', error);
      alert('Terjadi kesalahan server');
    }
  };

  // Render login form
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 via-pink-500 to-orange-500">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f87171 0%, #ec4899 50%, #f97316 100%)' }}>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-56 h-56 bg-yellow-300/40 rounded-full blur-3xl"></div>

        <Card className="w-full max-w-md glossy-login-card rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-4 glossy-icon-container rounded-2xl shadow-xl">
                <Building2 className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              Admin Panel
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Aplikasi Sekolah SD
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <Alert variant="destructive" className="bg-red-50/90 backdrop-blur-sm border-red-200 rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <Button
                className="w-full glossy-button text-white rounded-xl h-11 font-medium text-base"
                onClick={handleLogin}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? 'Memproses...' : 'Masuk'}
              </Button>

              <div className="mt-4 p-4 glossy-card rounded-xl">
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Akun Admin:
                </p>
                <div className="text-xs space-y-1.5 text-gray-600">
                  <p className="flex justify-between">
                    <span className="font-medium text-red-600">Super Admin:</span>
                    <span>admin@sekolah.com / admin123</span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main admin dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="glossy-card px-6 py-4 flex items-center justify-between border-b border-red-100/50 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 glossy-icon-container rounded-xl">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              Admin Panel - Aplikasi Sekolah SD
            </h1>
            <p className="text-sm text-gray-500">Manajemen Sekolah dan User</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="glossy-badge text-white border-0 px-3 py-1 rounded-full">
            {currentUser.role === 'admin' ? 'Super Admin' : currentUser.role}
          </Badge>
          <div className="flex items-center gap-3 p-2 rounded-xl glossy-card">
            <div className="w-8 h-8 rounded-full glossy-icon-container flex items-center justify-center text-white font-medium">
              {currentUser.nama.charAt(0)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">{currentUser.nama}</p>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
              <Home className="w-4 h-4 mr-2" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="schools" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
              <School className="w-4 h-4 mr-2" /> Daftar Sekolah
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
              <Users className="w-4 h-4 mr-2" /> Daftar User
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 glossy-icon-container rounded-xl">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Dashboard Admin
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glossy-stat-card rounded-2xl border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 glossy-icon-container rounded-xl">
                        <School className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Sekolah</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                          {schools.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glossy-stat-card rounded-2xl border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total User</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {users.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glossy-stat-card rounded-2xl border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">User Aktif</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {users.filter(u => u.isActive).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glossy-stat-card rounded-2xl border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl shadow-lg">
                        <UserPlus className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Kepala Sekolah</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                          {users.filter(u => u.role === 'kepala_sekolah').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glossy-card rounded-2xl border-0">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Inisialisasi Data
                  </CardTitle>
                  <CardDescription>
                    Buat data awal untuk testing (2 sekolah dan beberapa user)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="glossy-button text-white" onClick={handleSeedData}>
                    <Download className="w-4 h-4 mr-2" /> Buat Data Awal
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schools Tab */}
          <TabsContent value="schools">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Daftar Sekolah
                </h2>
                <Dialog open={schoolDialogOpen} onOpenChange={setSchoolDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="glossy-button text-white"
                      onClick={() => {
                        setEditSchool(null);
                        setSchoolForm({
                          nama: '',
                          npsn: '',
                          alamat: '',
                          jenjang: 'SD',
                          tahunAjaran: '2025/2026',
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Tambah Sekolah
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editSchool ? 'Edit Sekolah' : 'Tambah Sekolah Baru'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Nama Sekolah</Label>
                        <Input
                          value={schoolForm.nama}
                          onChange={(e) => setSchoolForm(prev => ({ ...prev, nama: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>NPSN</Label>
                        <Input
                          value={schoolForm.npsn}
                          onChange={(e) => setSchoolForm(prev => ({ ...prev, npsn: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Alamat</Label>
                        <Textarea
                          value={schoolForm.alamat}
                          onChange={(e) => setSchoolForm(prev => ({ ...prev, alamat: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Jenjang</Label>
                        <Input value="SD" disabled className="mt-1 bg-gray-100" />
                      </div>
                      <div>
                        <Label>Tahun Ajaran</Label>
                        <Input
                          value={schoolForm.tahunAjaran}
                          onChange={(e) => setSchoolForm(prev => ({ ...prev, tahunAjaran: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <Button className="w-full glossy-button text-white" onClick={handleSaveSchool}>
                        {editSchool ? 'Update' : 'Simpan'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="glossy-card rounded-2xl border-0">
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader className="glossy-table-header sticky top-0">
                        <TableRow>
                          <TableHead>Nama Sekolah</TableHead>
                          <TableHead>NPSN</TableHead>
                          <TableHead>Alamat</TableHead>
                          <TableHead>Tahun Ajaran</TableHead>
                          <TableHead>Jumlah Guru</TableHead>
                          <TableHead>Jumlah Kelas</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {schools.map((school) => (
                          <TableRow key={school.id} className="glossy-table-row">
                            <TableCell className="font-medium">{school.nama}</TableCell>
                            <TableCell>{school.npsn}</TableCell>
                            <TableCell>{school.alamat || '-'}</TableCell>
                            <TableCell>{school.tahunAjaran}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {school._count?.guru || 0} guru
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {school._count?.kelas || 0} kelas
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditSchool(school);
                                    setSchoolForm({
                                      nama: school.nama,
                                      npsn: school.npsn,
                                      alamat: school.alamat || '',
                                      jenjang: school.jenjang,
                                      tahunAjaran: school.tahunAjaran,
                                    });
                                    setSchoolDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteSchool(school.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {schools.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              Belum ada data sekolah. Klik "Tambah Sekolah" untuk menambah data.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Daftar User
                </h2>
                <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="glossy-button text-white"
                      onClick={() => {
                        setEditUser(null);
                        setUserForm({
                          email: '',
                          password: '',
                          nama: '',
                          role: 'guru_kelas',
                          sekolahId: '',
                          nip: '',
                          telepon: '',
                          alamat: '',
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Tambah User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editUser ? 'Edit User' : 'Tambah User Baru'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Nama Lengkap</Label>
                        <Input
                          value={userForm.nama}
                          onChange={(e) => setUserForm(prev => ({ ...prev, nama: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      {!editUser && (
                        <div>
                          <Label>Password</Label>
                          <Input
                            type="password"
                            value={userForm.password}
                            onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                      )}
                      <div>
                        <Label>Role</Label>
                        <Select
                          value={userForm.role}
                          onValueChange={(v) => setUserForm(prev => ({ ...prev, role: v }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kepala_sekolah">Kepala Sekolah</SelectItem>
                            <SelectItem value="guru_kelas">Guru Kelas</SelectItem>
                            <SelectItem value="guru_mapel">Guru Mapel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Sekolah</Label>
                        <Select
                          value={userForm.sekolahId}
                          onValueChange={(v) => setUserForm(prev => ({ ...prev, sekolahId: v }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Pilih Sekolah" />
                          </SelectTrigger>
                          <SelectContent>
                            {schools.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.nama}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {(userForm.role === 'guru_kelas' || userForm.role === 'guru_mapel') && (
                        <>
                          <div>
                            <Label>NIP</Label>
                            <Input
                              value={userForm.nip}
                              onChange={(e) => setUserForm(prev => ({ ...prev, nip: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Telepon</Label>
                            <Input
                              value={userForm.telepon}
                              onChange={(e) => setUserForm(prev => ({ ...prev, telepon: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                        </>
                      )}
                      <Button className="w-full glossy-button text-white" onClick={handleSaveUser}>
                        {editUser ? 'Update' : 'Simpan'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="glossy-card rounded-2xl border-0">
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader className="glossy-table-header sticky top-0">
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Sekolah</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="glossy-table-row">
                            <TableCell className="font-medium">{user.nama}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  user.role === 'kepala_sekolah'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : user.role === 'guru_kelas'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-green-50 text-green-700 border-green-200'
                                }
                              >
                                {user.role === 'kepala_sekolah'
                                  ? 'Kepala Sekolah'
                                  : user.role === 'guru_kelas'
                                  ? 'Guru Kelas'
                                  : 'Guru Mapel'}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.sekolah?.nama || '-'}</TableCell>
                            <TableCell>
                              <Badge
                                variant={user.isActive ? 'default' : 'secondary'}
                                className={user.isActive ? 'bg-green-600' : 'bg-gray-400'}
                              >
                                {user.isActive ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleUserStatus(user)}
                                >
                                  {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setResetPasswordUserId(user.id)}
                                >
                                  <Key className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditUser(user);
                                    setUserForm({
                                      email: user.email,
                                      password: '',
                                      nama: user.nama,
                                      role: user.role,
                                      sekolahId: user.sekolahId || '',
                                      nip: user.guru?.nip || '',
                                      telepon: user.guru?.telepon || '',
                                      alamat: user.guru?.alamat || '',
                                    });
                                    setUserDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {users.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              Belum ada data user. Klik "Tambah User" untuk menambah data.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPasswordUserId} onOpenChange={() => setResetPasswordUserId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Password Baru</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button className="w-full glossy-button text-white" onClick={handleResetPassword}>
              Reset Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
