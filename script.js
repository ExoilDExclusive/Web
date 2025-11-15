// --- Kredensial Login ---
const CORRECT_USERNAME = "Harys";
const CORRECT_PASSWORD = "ANJAY77";
// ------------------------

// Ambil elemen-elemen dari DOM
const uname = document.querySelector('#uname');
const pass = document.querySelector('#pass');
const btnContainer = document.querySelector('.btn-container');
const btn = document.querySelector('#login-btn');
const form = document.querySelector('form');
const msg = document.querySelector('.msg');
// Tambahan untuk "Poho Sandi"
const forgotPasswordLink = document.querySelector('.action a');

// Setelan awal
btn.disabled = true;
// Inisialisasi posisi awal tombol agar `shiftButton` bisa bekerja saat mouseover pertama kali
btn.classList.add('shift-left');

// --- Fungsi Validasi & Shifting Tombol ---
function shiftButton() {
    if (btn.disabled) {
        showMsg();
        const positions = ['shift-left', 'shift-top', 'shift-right', 'shift-bottom'];
        const currentPositionClass = positions.find(dir => btn.classList.contains(dir));
        const currentIndex = currentPositionClass ? positions.indexOf(currentPositionClass) : 0;
        const nextPositionClass = positions[(currentIndex + 1) % positions.length];
        if (currentPositionClass) {
            btn.classList.remove(currentPositionClass);
        }
        btn.classList.add(nextPositionClass);
        btn.classList.remove('no-shift');
    }
}

function showMsg() {
    const isEmpty = uname.value === '' || pass.value === '';
    
    if (isEmpty) {
        btn.disabled = true;
        msg.style.color = 'rgb(218 49 49)';
        msg.innerText = 'Isi heula atuh';
        btn.classList.remove('no-shift');
    } else {
        msg.innerText = 'Nah kitu bener, Tiasa di proses';
        msg.style.color = '#92ff92';
        btn.disabled = false;
        btn.classList.add('no-shift');
    }
}

// --- Fungsi Handle Login ---
function handleSubmit(e) {
    e.preventDefault(); // Mencegah form reload
    
    const inputUsername = uname.value.trim();
    const inputPassword = pass.value.trim();
    
    if (inputUsername === CORRECT_USERNAME && inputPassword === CORRECT_PASSWORD) {
        // --- BERHASIL ---
        msg.textContent = "Login Berhasil! Selamat datang, " + inputUsername;
        msg.style.color = "#4CAF50"; // Warna hijau
        
        // Tampilkan pesan sebentar lalu pindah ke Portal.html
        setTimeout(() => {
            // Jika mau buka di tab baru: window.open('Portal.html', '_blank');
            window.location.href = "Pages/Portal.html";
        }, 300); // 300 ms delay supaya pengguna sempat lihat pesan. Ganti/dihapus sesuai kebutuhan.
        
    } else {
        // --- GAGAL ---
        msg.textContent = "Username atau password salah blok";
        msg.style.color = "#fa2929"; // Warna merah
        
        pass.value = ''; // Kosongkan field password
        
        // Set tombol kembali ke kondisi disabled dan siap bergeser lagi
        btn.disabled = true;
        btn.classList.remove('no-shift');
    }
}

// --- Fungsi Handle Lupa Sandi ---
function handleForgotPassword(e) {
    e.preventDefault(); // Mencegah link pindah halaman
    
    // Tampilkan pesan khusus (boleh diganti jika ingin lebih sopan)
    msg.textContent = "MAKANYA JANGAN COLI";
    msg.style.color = 'yellow';
    
    setTimeout(() => {
        showMsg();
    }, 4000);
}


// --- Event Listeners ---

// 1. Mouse/Touch: Tombol hanya bergeser jika input belum diisi
btnContainer.addEventListener('mouseover', shiftButton);
btn.addEventListener('mouseover', shiftButton);
btn.addEventListener('touchstart', shiftButton);

// 2. Input: Periksa validasi dan aktifkan/nonaktifkan tombol
form.addEventListener('input', showMsg);

// 3. Submit: Proses Login
form.addEventListener('submit', handleSubmit);

// 4. Lupa Sandi: Tampilkan pesan khusus
forgotPasswordLink.addEventListener('click', handleForgotPassword);
