# Project Worklog

---
## Task ID: 1 - Update Main Application Page
### Work Task
Update the main application page at /home/z/my-project/src/app/page.tsx to connect to database via API calls, support multi-school, update roles for SD only, and add download/upload template buttons.

### Work Summary
Successfully updated the main application page with the following changes:

1. **API Integration instead of localStorage**:
   - Login/logout now uses `/api/auth` endpoint with session cookies
   - Materi CRUD operations use `/api/materi` endpoint
   - Quiz CRUD operations use `/api/quiz` endpoint
   - Kelas data fetched from `/api/kelas`
   - Mata Pelajaran data fetched from `/api/mapel`
   - Kehadiran Guru data uses `/api/kehadiran`
   - All data is fetched on user authentication and role change

2. **Multi-School Support**:
   - After login, user's `sekolahId` is retrieved from session
   - All data is filtered by `sekolahId` via API query parameters
   - School name is displayed in the header (from `currentUser.sekolah.nama`)

3. **Updated Roles for SD Only**:
   - Removed `wali_kelas`, `wali_siswa`, and `siswa` roles
   - Remaining roles:
     - `kepala_sekolah`: Dashboard, Data Guru, Kehadiran Guru, Laporan, Pengaturan Sekolah, Profil
     - `guru_kelas`: Dashboard, Materi Ajar, Quiz, Rekap Nilai, Laporan, Pengaturan Sekolah, Profil
     - `guru_mapel`: Dashboard, Materi Ajar, Quiz, Rekap Nilai, Laporan, Pengaturan Sekolah, Profil

4. **Template Download/Upload Buttons**:
   - Added "Download Template" button in "Tambah Materi" dialog linking to `/api/templates/materi`
   - Added "Upload Template" file input that posts to `/api/templates/materi` for parsing
   - Added "Download Template" button in "Tambah Quiz" dialog linking to `/api/templates/quiz`
   - Added "Upload Template" file input that posts to `/api/templates/quiz` for parsing

5. **Preserved Glossy/Glassmorphism Theme**:
   - All existing glossy effects maintained
   - Red theme for SD level preserved
   - Removed non-functional buttons (siswa-related features, unused dialogs)

6. **Removed Non-Working Features**:
   - Removed siswa-related data and menus (no longer needed for SD-only)
   - Removed wali_siswa search functionality
   - Removed kehadiran siswa functionality
   - Removed unused form states and handlers
