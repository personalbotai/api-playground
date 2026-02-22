/**
 * API Testing Playground - PicoClaw
 * Lightweight REST API tester with collection management
 */

class APIPlayground {
    constructor() {
        this.collections = this.loadCollections();
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCollections();
        this.loadLastRequest();
    }

    bindEvents() {
        // Send request
        document.getElementById('sendBtn').addEventListener('click', () => this.sendRequest());
        document.getElementById('url').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendRequest();
        });

        // Clear
        document.getElementById('clearBtn').addEventListener('click', () => this.clearRequest());

        // Generate cURL
        document.getElementById('generateCurlBtn').addEventListener('click', () => this.generateCurl());

        // Collections
        document.getElementById('saveCollectionBtn').addEventListener('click', () => this.saveToCollection());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportCollections());
        document.getElementById('importFile').addEventListener('change', (e) => this.importCollections(e));

        // Clear all
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            if (confirm('Hapus semua data (collections & history)?')) {
                localStorage.clear();
                location.reload();
            }
        });

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Modal - using event delegation
        document.getElementById('curlModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('close') || e.target.classList.contains('close-modal')) {
                e.target.closest('.modal').style.display = 'none';
            }
        });
        document.getElementById('copyModalBtn').addEventListener('click', () => this.copyToClipboard('curlModalContent'));

        // Copy cURL from tab
        document.getElementById('copyCurlBtn').addEventListener('click', () => {
            this.generateCurl();
            this.copyToClipboard('curlCommand');
        });

        // Close modal on outside click
        window.onclick = (e) => {
            const modal = document.getElementById('curlModal');
            if (e.target == modal) modal.style.display = 'none';
        };
    }

    async sendRequest() {
        const url = document.getElementById('url').value.trim();
        const method = document.getElementById('method').value;
        const headersText = document.getElementById('headers').value.trim();
        const bodyText = document.getElementById('body').value.trim();

        if (!url) {
            alert('Masukkan URL terlebih dahulu!');
            return;
        }

        // Parse headers
        let headers = {};
        if (headersText) {
            try {
                headers = JSON.parse(headersText);
            } catch (e) {
                alert('Format headers JSON tidak valid!');
                return;
            }
        }

        // Parse body
        let body = null;
        if (bodyText && ['POST', 'PUT', 'PATCH'].includes(method)) {
            try {
                body = JSON.parse(bodyText);
            } catch (e) {
                alert('Format body JSON tidak valid!');
                return;
            }
        }

        // Prepare fetch options
        const options = {
            method: method,
            headers: headers
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        // Send request
        const startTime = performance.now();
        document.getElementById('sendBtn').disabled = true;
        document.getElementById('sendBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

        try {
            const response = await fetch(url, options);
            const endTime = performance.now();
            const duration = (endTime - startTime).toFixed(2);

            // Get response
            const responseHeaders = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            const contentType = response.headers.get('content-type') || '';
            let responseBody;
            if (contentType.includes('application/json')) {
                responseBody = await response.json();
            } else {
                responseBody = await response.text();
            }

            // Display response
            this.displayResponse({
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
                body: responseBody,
                duration: duration,
                size: JSON.stringify(responseBody).length
            });

            // Save to history
            this.saveToHistory({ url, method, headers, body, response: { status: response.status, size: JSON.stringify(responseBody).length } });

        } catch (error) {
            this.displayError(error);
        } finally {
            document.getElementById('sendBtn').disabled = false;
            document.getElementById('sendBtn').innerHTML = '<i class="fas fa-play"></i> Send';
        }
    }

    displayResponse(data) {
        // Status
        const statusEl = document.getElementById('statusCode');
        statusEl.textContent = `${data.status} ${data.statusText}`;
        statusEl.className = 'text-xl font-bold ' + (data.status >= 200 && data.status < 300 ? 'text-green-400' : data.status >= 400 ? 'text-red-400' : 'text-yellow-400');

        // Meta
        document.getElementById('responseTime').textContent = `${data.duration} ms`;
        document.getElementById('responseSize').textContent = this.formatBytes(data.size);

        // Body
        document.getElementById('responseBody').textContent = this.formatJSON(data.body);

        // Headers
        document.getElementById('responseHeaders').textContent = this.formatJSON(data.headers);

        // Switch to body tab
        this.switchTab('body');
    }

    displayError(error) {
        const statusEl = document.getElementById('statusCode');
        statusEl.textContent = 'ERROR';
        statusEl.className = 'text-xl font-bold text-red-400';

        document.getElementById('responseTime').textContent = '-';
        document.getElementById('responseSize').textContent = '-';

        document.getElementById('responseBody').textContent = error.message;
        document.getElementById('responseHeaders').textContent = 'No headers (request failed)';

        this.switchTab('body');
    }

    formatJSON(obj) {
        try {
            return JSON.stringify(obj, null, 2);
        } catch (e) {
            return String(obj);
        }
    }

    formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    generateCurl() {
        const url = document.getElementById('url').value.trim();
        const method = document.getElementById('method').value;
        const headersText = document.getElementById('headers').value.trim();
        const bodyText = document.getElementById('body').value.trim();

        if (!url) {
            alert('Masukkan URL terlebih dahulu!');
            return;
        }

        let headers = {};
        if (headersText) {
            try { headers = JSON.parse(headersText); } catch (e) { /* ignore */ }
        }

        let body = null;
        if (bodyText && ['POST', 'PUT', 'PATCH'].includes(method)) {
            try { body = JSON.parse(bodyText); } catch (e) { /* ignore */ }
        }

        let curl = `curl -X ${method} "${url}"`;
        for (const [key, value] of Object.entries(headers)) {
            curl += ` -H "${key}: ${value}"`;
        }
        if (body) {
            curl += ` -d '${JSON.stringify(body)}'`;
        }

        document.getElementById('curlCommand').textContent = curl;
        this.switchTab('curl');
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
            content.classList.toggle('hidden', content.id !== `${tabName}-tab`);
        });
    }

    saveToCollection() {
        const name = prompt('Nama untuk collection ini:');
        if (!name) return;

        const request = {
            name: name,
            url: document.getElementById('url').value,
            method: document.getElementById('method').value,
            headers: document.getElementById('headers').value,
            body: document.getElementById('body').value,
            savedAt: new Date().toISOString()
        };

        this.collections.push(request);
        this.saveCollections();
        this.renderCollections();
        alert('Disimpan ke collection!');
    }

    renderCollections() {
        const container = document.getElementById('collectionsList');
        if (this.collections.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-center py-8">No saved collections yet. Save requests to reuse them.</p>';
            return;
        }

        container.innerHTML = this.collections.map((item, index) => `
            <div class="bg-gray-700 rounded-lg p-4 mb-3 flex justify-between items-center">
                <div>
                    <h4 class="font-semibold text-white">${this.escapeHtml(item.name)}</h4>
                    <p class="text-sm text-gray-300">${item.method} ${this.escapeHtml(item.url)}</p>
                    <small class="text-gray-400">${new Date(item.savedAt).toLocaleString()}</small>
                </div>
                <div class="flex gap-2">
                    <button class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1" onclick="app.loadCollection(${index})">
                        <i class="fas fa-folder-open"></i> Load
                    </button>
                    <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1" onclick="app.deleteCollection(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadCollection(index) {
        const item = this.collections[index];
        document.getElementById('url').value = item.url;
        document.getElementById('method').value = item.method;
        document.getElementById('headers').value = item.headers;
        document.getElementById('body').value = item.body;
        alert(`Loaded "${item.name}"`);
    }

    deleteCollection(index) {
        if (confirm('Hapus collection ini?')) {
            this.collections.splice(index, 1);
            this.saveCollections();
            this.renderCollections();
        }
    }

    exportCollections() {
        const dataStr = JSON.stringify(this.collections, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `api-collections-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importCollections(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    this.collections.push(...imported);
                    this.saveCollections();
                    this.renderCollections();
                    alert(`Imported ${imported.length} collections!`);
                } else {
                    alert('File tidak valid!');
                }
            } catch (err) {
                alert('Error parsing file: ' + err.message);
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    }

    saveToHistory(request) {
        let history = JSON.parse(localStorage.getItem('request_history') || '[]');
        history.unshift(request);
        if (history.length > 50) history.pop();
        localStorage.setItem('request_history', JSON.stringify(history));
    }

    loadLastRequest() {
        const history = JSON.parse(localStorage.getItem('request_history') || '[]');
        if (history.length > 0) {
            const last = history[0];
            document.getElementById('url').value = last.url || '';
            document.getElementById('method').value = last.method || 'GET';
        }
    }

    clearRequest() {
        document.getElementById('url').value = '';
        document.getElementById('headers').value = '';
        document.getElementById('body').value = '';
        document.getElementById('statusCode').textContent = '-';
        document.getElementById('responseTime').textContent = '-';
        document.getElementById('responseSize').textContent = '-';
        document.getElementById('responseBody').textContent = 'No response yet. Send a request to see results.';
        document.getElementById('responseHeaders').textContent = 'No headers yet.';
        document.getElementById('curlCommand').textContent = 'Press "Generate cURL" to see command.';
    }

    copyToClipboard(elementId) {
        const text = document.getElementById(elementId).textContent;
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('Copy failed');
        });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Persistence
    saveCollections() {
        localStorage.setItem('api_collections', JSON.stringify(this.collections));
    }

    loadCollections() {
        const saved = localStorage.getItem('api_collections');
        return saved ? JSON.parse(saved) : [];
    }
}

// Initialize app
const app = new APIPlayground();