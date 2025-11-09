// [SALIN SEMUA KODE JAVASCRIPT LAMA ANDA DARI AWAL SAMPAI SEBELUM FUNGSI `initializeCountryData`]
// ... (semua variabel `encryptedTitle`, `countryConfig`, dll.)

// PERBAIKAN: Fungsi ini sekarang lebih tangguh terhadap kegagalan API
async function initializeCountryData() {
    console.log('🔍 Starting country detection...');
    updateDetectionStatus('detecting', 'Detecting location...');

    try {
        const detectedCountry = await detectUserLocation();
        console.log('📍 Detected country:', detectedCountry);

        // Pastikan detectedCountry valid sebelum digunakan
        if (detectedCountry && countryConfig[detectedCountry]) {
            currentCountry = detectedCountry;
            updateDetectionStatus('success', `Location detected: ${countryConfig[currentCountry].name}`);
        } else {
            console.warn('⚠️ Detection failed or country not supported, defaulting to India.');
            currentCountry = 'IN'; // Fallback aman
            updateDetectionStatus('error', 'Detection failed, using default.');
        }

    } catch (error) {
        console.error('Location detection process failed:', error);
        currentCountry = 'IN'; // Fallback aman jika ada error tak terduga
        updateDetectionStatus('error', 'Detection failed, using default.');
    }

    // Kode ini sekarang akan selalu berjalan, bahkan jika deteksi gagal
    countryData = countryConfig[currentCountry];
    if (!countryData) { // Double check, if IN somehow fails
        currentCountry = 'IN';
        countryData = countryConfig[currentCountry];
    }
    
    console.log('📊 Country data loaded:', countryData.name);

    updateCountryDisplay();
    updateCountryButtons();

    // Set default values based on the determined country
    const defaultUniversity = countryData.universities[0];
    const collegeInputEl = document.getElementById('collegeNameInput');
    if (collegeInputEl) {
        collegeInputEl.value = defaultUniversity;
        // Memicu semua fungsi update terkait (logo, alamat, dll)
        collegeInputEl.dispatchEvent(new Event('input'));
    }

    const mobileInput = document.getElementById('mobileInput');
    if (mobileInput) {
        const firstVisitDigits = generateMobileDigits(currentCountry);
        mobileInput.value = formatMobileFromDigits(firstVisitDigits, countryData.phoneCode);
        mobileInput.dispatchEvent(new Event('input'));
    }
    
    const nameInput = document.getElementById('nameInput');
    if (nameInput && !nameInput.value) { // Hanya isi jika kosong
        nameInput.value = getRandomName();
        nameInput.dispatchEvent(new Event('input'));
    }
    
    // Sembunyikan pesan status setelah beberapa saat
    setTimeout(() => {
        const statusEl = document.getElementById('detectionStatus');
        if (statusEl) statusEl.style.display = 'none';
    }, 3000);
}

// [SALIN SEMUA KODE LAMA ANDA DARI `updateDetectionStatus` SAMPAI SEBELUM `document.addEventListener`]
// ... (fungsi switchCountry, updateCountryButtons, dll.)

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing EDUID system...');
    initDOMCache();
    decryptTitle();

    // PERBAIKAN 3: Memasang event listener untuk tombol negara di sini agar selalu aktif
    document.getElementById('switchToBD').addEventListener('click', () => switchCountry('BD'));
    document.getElementById('switchToIN').addEventListener('click', () => switchCountry('IN'));
    document.getElementById('switchToPK').addEventListener('click', () => switchCountry('PK'));
    document.getElementById('switchToUK').addEventListener('click', () => switchCountry('UK'));
    document.getElementById('switchToNG').addEventListener('click', () => switchCountry('NG'));
    document.getElementById('switchToAU').addEventListener('click', () => switchCountry('AU'));

    // Inisialisasi utama
    await initializeCountryData();
    
    // [SALIN SEMUA SISA KODE LAMA ANDA YANG ADA DI DALAM `DOMContentLoaded`]
    // ... (semua event listener untuk input, tombol random, dll.)
    
    // GANTI event listener tombol download yang lama dengan yang ini:
    // PERBAIKAN 4: Konfigurasi html2canvas yang lebih baik untuk download
    document.getElementById('downloadCardButton').addEventListener('click', async () => {
        const card = document.getElementById('id-card');
        const scaleFactor = 4; // Skala lebih tinggi untuk kualitas gambar yang lebih baik

        try {
            console.log("Starting card generation...");
            const canvas = await html2canvas(card, {
                scale: scaleFactor,
                useCORS: true, // Wajib untuk memuat gambar dari domain lain (jika ada)
                backgroundColor: null, // Memastikan latar belakang gradien ikut ter-render
                logging: true, // Aktifkan log untuk membantu debugging jika masih gagal
                onclone: (clonedDoc) => {
                    // Trik ini membantu canvas untuk merender font eksternal dengan benar
                    const fontLink = clonedDoc.createElement('link');
                    fontLink.rel = 'stylesheet';
                    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap';
                    clonedDoc.head.appendChild(fontLink);
                }
            });
            console.log("Canvas created successfully.");

            const jpgUrl = canvas.toDataURL('image/jpeg', 0.95); // Kualitas 95%
            const link = document.createElement('a');
            
            const studentName = document.getElementById('nameInput').value || 'Student';
            const studentId = document.getElementById('idInput').value || 'ID';
            const firstName = studentName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
            const cleanId = studentId.replace(/[^a-zA-Z0-9]/g, '');
            const filename = `${firstName}_${cleanId}.jpg`;
            
            link.href = jpgUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log("Download initiated.");
        } catch (error) {
            console.error("Error generating card image:", error);
            alert("Gagal membuat gambar kartu. Silakan coba lagi atau cek console untuk detail error.");
        }
    });
});
