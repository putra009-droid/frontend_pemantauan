const API_BASE = 'http://localhost:5000/api';

async function loadData() {
    await loadGuru();
    await loadKehadiran();
}

async function loadGuru() {
    try {
        const response = await fetch(API_BASE + '/teachers');
        const guru = await response.json();
        
        document.getElementById('totalGuru').textContent = guru.length;
        
        const select = document.getElementById('selectGuru');
        select.innerHTML = '<option value="">Pilih Guru</option>';
        guru.forEach(g => {
            const option = document.createElement('option');
            option.value = g.id;
            option.textContent = g.name + ' - ' + g.subject;
            select.appendChild(option);
        });
        
        // Show teachers list
        let html = '<table><tr><th>Nama</th><th>Email</th><th>Mapel</th><th>Kelas</th></tr>';
        guru.forEach(g => {
            html += '<tr><td>' + g.name + '</td><td>' + g.email + '</td><td>' + g.subject + '</td><td>' + g.class + '</td></tr>';
        });
        html += '</table>';
        document.getElementById('daftarGuru').innerHTML = html;
        
    } catch (error) {
        document.getElementById('daftarGuru').innerHTML = 'Error loading data';
    }
}

async function loadKehadiran() {
    try {
        const date = document.getElementById('tanggal').value;
        const response = await fetch(API_BASE + '/attendance?date=' + date);
        const data = await response.json();
        
        let html = '<table><tr><th>Nama</th><th>Mapel</th><th>Status</th><th>Waktu</th><th>Catatan</th></tr>';
        data.forEach(item => {
            html += '<tr><td>' + item.teacher_name + '</td><td>' + item.teacher_subject + '</td><td>' + item.status + '</td><td>' + (item.check_in_time || '-') + '</td><td>' + (item.notes || '-') + '</td></tr>';
        });
        html += '</table>';
        document.getElementById('daftarKehadiran').innerHTML = html;
        
        // Update stats
        const hadir = data.filter(d => d.status === 'hadir').length;
        const tidakHadir = data.filter(d => d.status === 'tidak_hadir').length;
        document.getElementById('hadirHariIni').textContent = hadir;
        document.getElementById('tidakHadir').textContent = tidakHadir;
        
    } catch (error) {
        document.getElementById('daftarKehadiran').innerHTML = 'Error loading data';
    }
}

async function checkInGuru() {
    const teacherId = document.getElementById('selectGuru').value;
    const status = document.getElementById('statusGuru').value;
    const catatan = document.getElementById('catatan').value;
    
    if (!teacherId) {
        alert('Pilih guru dulu!');
        return;
    }
    
    try {
        const response = await fetch(API_BASE + '/attendance', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                teacher_id: parseInt(teacherId),
                date: new Date().toISOString().split('T')[0],
                status: status,
                check_in_time: new Date().toLocaleTimeString(),
                notes: catatan
            })
        });
        
        if (response.ok) {
            alert('Berhasil disimpan!');
            document.getElementById('catatan').value = '';
            loadKehadiran();
        } else {
            const errorData = await response.json();
            alert('Error: ' + (errorData.error || 'Gagal menyimpan data'));
        }
    } catch (error) {
        alert('Error: ' + error);
    }
}

function tambahGuru() {
    document.getElementById('modalGuru').style.display = 'block';
}

function tutupModal() {
    document.getElementById('modalGuru').style.display = 'none';
}

async function simpanGuru() {
    const nama = document.getElementById('namaGuru').value;
    const email = document.getElementById('emailGuru').value;
    const mapel = document.getElementById('mapelGuru').value;
    const kelas = document.getElementById('kelasGuru').value;
    
    // Validasi input
    if (!nama || !email || !mapel || !kelas) {
        alert('Semua field harus diisi!');
        return;
    }
    
    const formData = {
        name: nama,
        email: email,
        subject: mapel,
        class: kelas
    };
    
    console.log('Mengirim data:', formData);
    
    try {
        const response = await fetch(API_BASE + '/teachers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Success:', result);
            alert('Guru berhasil ditambah!');
            tutupModal();
            
            // Reset form
            document.getElementById('namaGuru').value = '';
            document.getElementById('emailGuru').value = '';
            document.getElementById('mapelGuru').value = '';
            document.getElementById('kelasGuru').value = '';
            
            // Reload data
            loadGuru();
        } else {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            alert('Error: ' + (errorData.error || errorData.errors?.[0]?.msg || 'Gagal menambah guru'));
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Error koneksi: ' + error.message);
    }
}

// Load data when page opens
document.addEventListener('DOMContentLoaded', loadData);

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modalGuru');
    if (event.target === modal) {
        tutupModal();
    }
}