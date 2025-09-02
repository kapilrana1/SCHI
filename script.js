// Show total certificate count next to search icon
window.addEventListener('DOMContentLoaded', function() {
    updateCertificateCount();
});

function updateCertificateCount() {
    // First show count from hardcoded array as fallback
    var fallbackCount = allCertificates.length;
    var el = document.getElementById('totalCertificates');
    if (el) {
        el.textContent = `Total certificates: ${fallbackCount}`;
    }
    
    // Then try to get actual count from certificates directory
    fetch('./certificates/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Directory not accessible');
            }
            return response.text();
        })
        .then(html => {
            // Parse file links from directory listing HTML
            const matches = html.match(/href=\"([^\"]+\.(jpg|jpeg|png|pdf))\"/gi);
            const actualCount = matches ? matches.length : fallbackCount;
            
            // Update display with actual count
            if (el) {
                el.textContent = `Total certificates: ${actualCount}`;
            }
        })
        .catch(error => {
            // If fetch fails, keep the fallback count
            console.log('Using fallback certificate count:', fallbackCount);
        });
}
// === Bulk Download Logic ===
const BULK_PASSWORD = 'School12@'; // Change this to your desired password
const allCertificates = [
  'Abhimannyu_6_D.jpg', 'AditYakUmar_6_D.jpg', 'AdityaSingh_8_A.jpg', 'AjaiKarthickV_8_H.jpg',
  'AniruddhDubey_8_A.jpg', 'Anjali_8_A.jpg', 'Annanjika_9_A.jpg', 'AnshKumar_6_D.jpg',
  'AnupKumar_9_E.jpg', 'AravChauhan_7_G .jpg', 'AravChauhan_7_G.jpg', 'Arju_6_A.jpg',
  'ArulBisht_8_H.jpg', 'AshwinRoy_6_G.jpg', 'AyushRaj_6_G.jpg', 'BhaskarKumar_8_H.jpg',
  'DaksheshDahiya_6_A .jpg', 'DevishiNehra_7_C.jpg', 'GunjanSamota_6_A.jpg', 'GunpreetSingh_9_E.jpg',
  'MeesalaDoleshVardhan_6_A.jpg', 'NidhiSudarshanTambe_6_D.jpg', 'NikhilRoy_6_G.jpg', 'NivyanshKumar_6_A.jpg',
  'SahilKumar_8_H.jpg', 'SallyKumari_6_A.jpg', 'Shaunak_6_D.jpg', 'ShauryaVardhanSingh_6_D.jpg',
  'ShreyaKumari_8_H.jpg', 'SnehalChauhan_7_G.jpg', 'SomyajeetTarai_6_D.jpg', 'Swaati_6_D.jpg',
  'TanmaiSuyal_9_E.jpg', 'Vaishnavi_6_G.jpg'
];

function openBulkDownloadModal() {
    document.getElementById('bulkDownloadModal').style.display = 'block';
    document.getElementById('bulkPassword').value = '';
    document.getElementById('bulkDownloadError').style.display = 'none';
}

function closeBulkDownloadModal() {
    document.getElementById('bulkDownloadModal').style.display = 'none';
}

function handleBulkDownload() {
    const password = document.getElementById('bulkPassword').value;
    const errorDiv = document.getElementById('bulkDownloadError');
    if (password === BULK_PASSWORD) {
        errorDiv.style.display = 'none';
        closeBulkDownloadModal();
        bulkDownloadCertificates();
    } else {
        errorDiv.textContent = '❌ Incorrect password!';
        errorDiv.style.display = 'block';
    }
}

function bulkDownloadCertificates() {
    // Use JSZip to zip all certificate files and trigger download
    showNotification('⏳ Preparing ZIP, please wait...', 'success');
    const zip = new JSZip();
    let completed = 0;
    allCertificates.forEach(filename => {
        fetch(certificatesPath + encodeURIComponent(filename))
            .then(response => {
                if (!response.ok) throw new Error('File not found: ' + filename);
                return response.blob();
            })
            .then(blob => {
                zip.file(filename, blob);
            })
            .catch(() => {/* skip missing files */})
            .finally(() => {
                completed++;
                if (completed === allCertificates.length) {
                    zip.generateAsync({type: 'blob'}).then(function(content) {
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(content);
                        link.download = 'all_certificates.zip';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        showNotification('📦 Bulk ZIP download ready!', 'success');
                    });
                }
            });
    });
}

// Certificate file extensions to check
const imageExtensions = ['jpg', 'jpeg', 'png', 'pdf'];

// Base path for certificates folder
const certificatesPath = './certificates/';

function searchCertificates() {
    const studentName = document.getElementById('studentName').value.trim();
    const studentClass = document.getElementById('studentClass').value;
    const studentSection = document.getElementById('studentSection').value;
    const certificateType = document.getElementById('certificateType').value;

    if (!studentName || !studentClass || !studentSection) {
        showNotification('❌ Please fill Student Name, Class and Section', 'error');
        return;
    }

    // Show loading
    document.getElementById('searchResults').innerHTML = '<div class="loading">Searching certificates...</div>';

    // Generate possible filenames
    const possibleFilenames = generateFilenames(studentName, studentClass, studentSection, certificateType);
    
    // Search for certificates
    findCertificates(possibleFilenames);
}

function generateFilenames(name, className, section, type) {
    // Clean student name (remove spaces, convert to proper case)
    const cleanName = name.replace(/\s+/g, '').toLowerCase();
    const properName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    
    let filenames = [];
    
    // Generate different filename patterns
    const patterns = [
        `${name.replace(/\s+/g, '')}_${className}_${section}`,
    ];

    // If certificate type is specified, add type-specific patterns
    if (type) {
        patterns.forEach(pattern => {
            filenames.push(`${pattern}_${type}`);
        });
    }

    // Add base patterns
    filenames = filenames.concat(patterns);

    // Generate full filenames with extensions
    const fullFilenames = [];
    filenames.forEach(filename => {
        imageExtensions.forEach(ext => {
            fullFilenames.push(`${filename}.${ext}`);
        });
    });

    return fullFilenames;
}

async function findCertificates(filenames) {
    const foundCertificates = [];
    
    // Check each possible filename
    for (let filename of filenames) {
        try {
            const response = await fetch(certificatesPath + filename);
            if (response.ok) {
                const fileInfo = {
                    filename: filename,
                    path: certificatesPath + filename,
                    size: response.headers.get('content-length'),
                    type: response.headers.get('content-type')
                };
                
                // Parse info from filename
                const parts = filename.split('_');
                if (parts.length >= 3) {
                    fileInfo.studentName = parts[0];
                    fileInfo.className = parts[1];
                    fileInfo.section = parts[2].split('.')[0];
                    if (parts.length > 3) {
                        fileInfo.certificateType = parts[3].split('.')[0];
                    }
                }
                
                foundCertificates.push(fileInfo);
            }
        } catch (error) {
            // File doesn't exist, continue searching
            continue;
        }
    }

    displayResults(foundCertificates);
}

function displayResults(certificates) {
    const resultsContainer = document.getElementById('searchResults');

    if (certificates.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p> ❌ No certificates found</p>
                
            </div>
        `;
        return;
    }

    let html = '<div class="results-grid">';
    
    certificates.forEach((cert, index) => {
        const isImage = cert.type && cert.type.startsWith('image/');
        const fileSize = cert.size ? `${(cert.size / 1024).toFixed(1)} KB` : 'Unknown';
        
        html += `
            <div class="certificate-card">
                ${isImage ? `
                    <img src="${cert.path}" 
                         alt="Certificate" 
                         class="certificate-preview" 
                         onclick="openModal('${cert.path}')"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNlcnRpZmljYXRlPC90ZXh0Pjwvc3ZnPg=='">
                ` : `
                    <div class="certificate-preview" style="display: flex; align-items: center; justify-content: center; background: #f0f0f0; color: #666;">
                        📄 ${cert.filename.split('.').pop().toUpperCase()} File
                    </div>
                `}
                
                <div class="certificate-info">
                    <h3>📜 Certificate Found!</h3>
                    <p><strong>Student:</strong> <span>${cert.studentName || 'Unknown'}</span></p>
                    <p><strong>Class:</strong> <span>${cert.className || 'Unknown'}</span></p>
                    <p><strong>Section:</strong> <span>${cert.section || 'Unknown'}</span></p>
                    ${cert.certificateType ? `<p><strong>Type:</strong> <span>${cert.certificateType}</span></p>` : ''}
                    <p><strong>File:</strong> <span>${cert.filename}</span></p>
                    <p><strong>Size:</strong> <span>${fileSize}</span></p>
                </div>
                
                <button class="btn download-btn" onclick="downloadCertificate('${cert.path}', '${cert.filename}')">
                    📥 Download Certificate
                </button>
                
                ${isImage ? `
                    <button class="btn view-btn" onclick="openModal('${cert.path}')">
                        👁️ View Full Size
                    </button>
                ` : ''}
            </div>
        `;
    });

    html += '</div>';
    resultsContainer.innerHTML = html;

    showNotification(`✅ ${certificates.length} certificate(s) found!`, 'success');
}

function downloadCertificate(filePath, filename) {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`📥 ${filename} download started!`, 'success');
}

function openModal(imagePath) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImg.src = imagePath;
}

function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
}

function clearSearch() {
    document.getElementById('searchForm').reset();
    document.getElementById('searchResults').innerHTML = `
        <div class="no-results">
            <p>Fill the form above to search for certificates</p>
        </div>
    `;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #28a745, #20c997)' : 'linear-gradient(135deg, #dc3545, #c82333)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 1001;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        animation: slideInRight 0.5s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Close modal when clicking outside the image
window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Allow Enter key to search
document.getElementById('searchForm').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        searchCertificates();
    }
});