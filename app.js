// MAIN APPLICATION SCRIPT
// =======================

// Global variables
let appData = {
    mou: [],
    media: [],
    partners: [],
    lastUpdated: null,
    chart: null
};

// Initialize application
async function initializeApp() {
    console.log('Initializing Relation & Media Dashboard...');
    
    try {
        // Update loading progress
        updateLoadingProgress(30);
        
        // Load data from Google Sheets
        await loadAllData();
        
        updateLoadingProgress(70);
        
        // Initialize charts
        initializeCharts();
        
        updateLoadingProgress(90);
        
        // Show main app
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('app').style.display = 'block';
            updateLoadingProgress(100);
            
            // Show dashboard by default
            showPage('dashboard');
            
            // Start auto-refresh if enabled
            if (CONFIG.settings.autoRefresh) {
                setInterval(refreshData, CONFIG.settings.refreshInterval);
            }
            
            console.log('App initialized successfully!');
        }, 500);
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load data. Using demo data instead.');
        useDemoData();
    }
}

// Load all data from Google Sheets
async function loadAllData() {
    console.log('Loading data from Google Sheets...');
    
    try {
        // Load MOU data
        appData.mou = await fetchSheetData('mou');
        console.log(`Loaded ${appData.mou.length} MOU records`);
        
        // Load Media data
        appData.media = await fetchSheetData('media');
        console.log(`Loaded ${appData.media.length} Media records`);
        
        // Load Partners data
        appData.partners = await fetchSheetData('partners');
        console.log(`Loaded ${appData.partners.length} Partner records`);
        
        // Update timestamp
        appData.lastUpdated = new Date();
        updateLastUpdated();
        
        // Update UI
        updateStats();
        updateMOUTable();
        updateMediaGrid();
        
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

// Fetch data from Google Sheets
async function fetchSheetData(sheetName) {
    const sheetConfig = CONFIG.sheets[sheetName];
    if (!sheetConfig) {
        throw new Error(`Sheet ${sheetName} not configured`);
    }
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${sheetConfig}?key=${CONFIG.apiKey}`;
    
    console.log(`Fetching ${sheetName} data from:`, url);
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.values || data.values.length === 0) {
            console.warn(`No data found in sheet: ${sheetConfig}`);
            return [];
        }
        
        // Convert sheet data to objects
        const headers = data.values[0];
        const rows = data.values.slice(1);
        
        return rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                // Convert header to camelCase
                const key = header.toLowerCase().replace(/\s+/g, '_');
                obj[key] = row[index] || '';
            });
            return obj;
        });
        
    } catch (error) {
        console.error(`Error fetching ${sheetName}:`, error);
        throw error;
    }
}

// Use demo data (fallback)
function useDemoData() {
    console.log('Using demo data...');
    appData = {
        mou: DEMO_DATA.mou,
        media: DEMO_DATA.media,
        partners: DEMO_DATA.partners,
        lastUpdated: new Date()
    };
    
    updateLastUpdated();
    updateStats();
    updateMOUTable();
    updateMediaGrid();
    initializeCharts();
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    showPage('dashboard');
}

// Update statistics
function updateStats() {
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);
    
    // Active MOU count
    const activeMOU = appData.mou.filter(item => {
        const endDate = new Date(item.end_date);
        return endDate >= today && item.status?.toLowerCase() !== 'expired';
    }).length;
    
    // Ending soon MOU count
    const endingMOU = appData.mou.filter(item => {
        const endDate = new Date(item.end_date);
        return endDate >= today && endDate <= threeMonthsLater;
    }).length;
    
    // Media this month count
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const mediaThisMonth = appData.media.filter(item => {
        const date = new Date(item.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).length;
    
    // Total partners count
    const totalPartners = appData.partners.filter(p => p.status?.toLowerCase() === 'active').length;
    
    // Update DOM
    document.getElementById('stat-active-mou').textContent = activeMOU;
    document.getElementById('stat-ending-mou').textContent = endingMOU;
    document.getElementById('stat-media-count').textContent = mediaThisMonth;
    document.getElementById('stat-partners').textContent = totalPartners;
}

// Update MOU table
function updateMOUTable() {
    const tbody = document.getElementById('mou-table');
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);
    
    // Filter active MOU and sort by end date
    const activeMOU = appData.mou
        .filter(item => {
            const endDate = new Date(item.end_date);
            return endDate >= today;
        })
        .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
        .slice(0, 10); // Show only 10 latest
    
    let html = '';
    
    if (activeMOU.length === 0) {
        html = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="text-muted">
                        <i class="fas fa-folder-open fa-2x mb-3"></i>
                        <p>No active MOU agreements found</p>
                    </div>
                </td>
            </tr>
        `;
    } else {
        activeMOU.forEach(item => {
            const endDate = new Date(item.end_date);
            let status = 'active';
            let statusClass = 'active';
            
            if (endDate <= threeMonthsLater) {
                status = 'ending soon';
                statusClass = 'ending';
            }
            
            if (item.status?.toLowerCase() === 'expired' || endDate < today) {
                status = 'expired';
                statusClass = 'expired';
            }
            
            html += `
                <tr>
                    <td>
                        <strong>${item.partner || 'N/A'}</strong>
                        ${item.description ? `<br><small class="text-muted">${item.description.substring(0, 50)}...</small>` : ''}
                    </td>
                    <td>${item.category || 'General'}</td>
                    <td>${formatDate(item.start_date)}</td>
                    <td>${formatDate(item.end_date)}</td>
                    <td><span class="badge ${statusClass}">${status}</span></td>
                    <td>${item.contact || 'N/A'}</td>
                </tr>
            `;
        });
    }
    
    tbody.innerHTML = html;
}

// Update media grid
function updateMediaGrid() {
    const container = document.getElementById('media-grid');
    
    // Sort by date and get latest 6
    const recentMedia = [...appData.media]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);
    
    let html = '';
    
    if (recentMedia.length === 0) {
        html = `
            <div class="col-12 text-center py-4">
                <div class="text-muted">
                    <i class="fas fa-newspaper fa-2x mb-3"></i>
                    <p>No media releases found</p>
                </div>
            </div>
        `;
    } else {
        recentMedia.forEach(item => {
            html += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="media-card">
                        <div class="media-header">
                            <span class="media-date">${formatDate(item.date)}</span>
                            <span class="media-category">${item.category || 'General'}</span>
                        </div>
                        <h6 class="media-title">${item.title || 'Untitled'}</h6>
                        <p class="media-content">${item.content || item.description || 'No description available'}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge ${item.status || 'draft'}">
                                ${item.status || 'draft'}
                            </span>
                            <span class="text-muted small">${item.author || 'Unknown'}</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    container.innerHTML = html;
}

// Initialize charts
function initializeCharts() {
    const ctx = document.getElementById('publication-chart').getContext('2d');
    
    // Prepare chart data
    const currentYear = new Date().getFullYear();
    const monthlyData = Array(12).fill(0);
    
    appData.media.forEach(item => {
        const date = new Date(item.date);
        if (date.getFullYear() === currentYear) {
            monthlyData[date.getMonth()]++;
        }
    });
    
    // Destroy existing chart
    if (appData.chart) {
        appData.chart.destroy();
    }
    
    // Create new chart
    appData.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Publications',
                data: monthlyData,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Navigation functions
function showPage(page) {
    // Hide all pages
    document.getElementById('dashboard-page').style.display = 'none';
    document.getElementById('other-pages').style.display = 'none';
    
    // Remove active class from all nav links
    document.querySelectorAll('.app-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current nav link
    document.querySelector(`.app-nav .nav-link[onclick*="${page}"]`).classList.add('active');
    
    // Show selected page
    if (page === 'dashboard') {
        document.getElementById('dashboard-page').style.display = 'block';
    } else {
        document.getElementById('other-pages').style.display = 'block';
        loadPageContent(page);
    }
}

// Load content for other pages
function loadPageContent(page) {
    const container = document.getElementById('other-pages');
    
    switch(page) {
        case 'mou':
            container.innerHTML = `
                <div class="card shadow-sm">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-file-contract text-primary me-2"></i>
                            All MOU Agreements
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Partner</th>
                                        <th>Category</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Status</th>
                                        <th>Contact</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody id="all-mou-table">
                                    Loading...
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            loadAllMOU();
            break;
            
        case 'media':
            container.innerHTML = `
                <div class="card shadow-sm">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-newspaper text-primary me-2"></i>
                            All Media Releases
                        </h5>
                        <input type="text" class="form-control form-control-sm w-auto" 
                               placeholder="Search media..." onkeyup="searchMedia(this.value)">
                    </div>
                    <div class="card-body">
                        <div class="row" id="all-media-grid">
                            Loading...
                        </div>
                    </div>
                </div>
            `;
            loadAllMedia();
            break;
            
        case 'partners':
            container.innerHTML = `
                <div class="card shadow-sm">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-users text-primary me-2"></i>
                            All Partners
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Institution</th>
                                        <th>Category</th>
                                        <th>Contact</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Website</th>
                                    </tr>
                                </thead>
                                <tbody id="all-partners-table">
                                    Loading...
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
            loadAllPartners();
            break;
            
        case 'reports':
            container.innerHTML = `
                <div class="card shadow-sm">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-chart-bar text-primary me-2"></i>
                            Reports & Analytics
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <div class="card border-primary">
                                    <div class="card-body text-center">
                                        <i class="fas fa-file-contract fa-3x text-primary mb-3"></i>
                                        <h5>MOU Report</h5>
                                        <p class="text-muted">Download all MOU data</p>
                                        <button class="btn btn-primary" onclick="exportMOU()">
                                            <i class="fas fa-download me-2"></i> Export Excel
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card border-success">
                                    <div class="card-body text-center">
                                        <i class="fas fa-newspaper fa-3x text-success mb-3"></i>
                                        <h5>Media Report</h5>
                                        <p class="text-muted">Download all media data</p>
                                        <button class="btn btn-success" onclick="exportMedia()">
                                            <i class="fas fa-download me-2"></i> Export Excel
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 mb-3">
                                <div class="card border-warning">
                                    <div class="card-body text-center">
                                        <i class="fas fa-chart-pie fa-3x text-warning mb-3"></i>
                                        <h5>Analytics</h5>
                                        <p class="text-muted">View detailed analytics</p>
                                        <button class="btn btn-warning" onclick="showAnalytics()">
                                            <i class="fas fa-chart-bar me-2"></i> View Analytics
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
}

// Load all MOU data for MOU page
function loadAllMOU() {
    const tbody = document.getElementById('all-mou-table');
    const today = new Date();
    
    let html = '';
    
    if (appData.mou.length === 0) {
        html = `<tr><td colspan="7" class="text-center py-4">No MOU data found</td></tr>`;
    } else {
        appData.mou.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        
        appData.mou.forEach(item => {
            const endDate = new Date(item.end_date);
            let status = 'active';
            let statusClass = 'active';
            
            if (endDate < today) {
                status = 'expired';
                statusClass = 'expired';
            } else if (endDate <= new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)) {
                status = 'ending soon';
                statusClass = 'ending';
            }
            
            html += `
                <tr>
                    <td><strong>${item.partner || 'N/A'}</strong></td>
                    <td>${item.category || 'General'}</td>
                    <td>${formatDate(item.start_date)}</td>
                    <td>${formatDate(item.end_date)}</td>
                    <td><span class="badge ${statusClass}">${status}</span></td>
                    <td>${item.contact || 'N/A'}</td>
                    <td>${item.description || 'N/A'}</td>
                </tr>
            `;
        });
    }
    
    tbody.innerHTML = html;
}

// Load all media for Media page
function loadAllMedia() {
    const container = document.getElementById('all-media-grid');
    
    let html = '';
    
    if (appData.media.length === 0) {
        html = `<div class="col-12 text-center py-4">No media releases found</div>`;
    } else {
        appData.media.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        appData.media.forEach(item => {
            html += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="media-card">
                        <div class="media-header">
                            <span class="media-date">${formatDate(item.date)}</span>
                            <span class="badge ${item.status || 'draft'}">
                                ${item.status || 'draft'}
                            </span>
                        </div>
                        <h6 class="media-title">${item.title || 'Untitled'}</h6>
                        <p class="media-content">${item.content || item.description || 'No description'}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="media-category">${item.category || 'General'}</span>
                            <span class="text-muted small">By: ${item.author || 'Unknown'}</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    container.innerHTML = html;
}

// Load all partners
function loadAllPartners() {
    const tbody = document.getElementById('all-partners-table');
    
    let html = '';
    
    if (appData.partners.length === 0) {
        html = `<tr><td colspan="6" class="text-center py-4">No partners found</td></tr>`;
    } else {
        appData.partners.forEach(item => {
            html += `
                <tr>
                    <td><strong>${item.institution || 'N/A'}</strong></td>
                    <td>${item.category || 'General'}</td>
                    <td>${item.contact || 'N/A'}</td>
                    <td>${item.email || 'N/A'}</td>
                    <td><span class="badge ${item.status === 'active' ? 'active' : 'expired'}">
                        ${item.status || 'inactive'}
                    </span></td>
                    <td>${item.website ? `<a href="${item.website}" target="_blank">${item.website}</a>` : 'N/A'}</td>
                </tr>
            `;
        });
    }
    
    tbody.innerHTML = html;
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function updateLastUpdated() {
    const element = document.getElementById('last-updated');
    if (element && appData.lastUpdated) {
        element.textContent = `Last updated: ${appData.lastUpdated.toLocaleTimeString('id-ID')}`;
    }
}

function updateLoadingProgress(percent) {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
    }
}

function refreshData() {
    console.log('Refreshing data...');
    
    // Show loading indicator
    const originalContent = document.getElementById('content').innerHTML;
    document.getElementById('content').innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary"></div>
            <p class="mt-3">Refreshing data from Google Sheets...</p>
        </div>
    `;
    
    // Reload data
    loadAllData().then(() => {
        document.getElementById('content').innerHTML = originalContent;
        updateStats();
        updateMOUTable();
        updateMediaGrid();
        showNotification('Data refreshed successfully!', 'success');
    }).catch(error => {
        document.getElementById('content').innerHTML = originalContent;
        showNotification('Failed to refresh data', 'error');
        console.error('Refresh error:', error);
    });
}

function exportData() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.spreadsheetId}/export?format=xlsx`;
    window.open(url, '_blank');
}

function exportMOU() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.spreadsheetId}/export?format=xlsx&gid=0`;
    window.open(url, '_blank');
}

function exportMedia() {
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.spreadsheetId}/export?format=xlsx&gid=1`;
    window.open(url, '_blank');
}

function searchTable(tableId, query) {
    // This is a simple search implementation
    // In a real app, you would filter the table data
    console.log(`Searching ${tableId} for: ${query}`);
    showNotification(`Search: ${query}`, 'info');
}

function filterMedia(filter) {
    // This is a simple filter implementation
    console.log(`Filtering media by: ${filter}`);
    showNotification(`Filtered by: ${filter}`, 'info');
}

function showAnalytics() {
    alert('Analytics feature would show detailed charts and statistics');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
    `;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

function showError(message) {
    showNotification(message, 'danger');
}

// Make functions available globally
window.showPage = showPage;
window.refreshData = refreshData;
window.exportData = exportData;
window.exportMOU = exportMOU;
window.exportMedia = exportMedia;
window.searchTable = searchTable;
window.filterMedia = filterMedia;
window.showAnalytics = showAnalytics;
window.useDemoData = useDemoData;
window.searchMedia = searchTable;