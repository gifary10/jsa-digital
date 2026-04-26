// ==================== STORAGE LAYER v2.0 ====================
const STORAGE_KEYS = {
  COMPANY:      'jsa_company',
  PROJECTS:     'jsa_projects',
  JSA:          'jsa_entries',
  AUDIT:        'jsa_audit_log',
  CURRENT_USER: 'jsa_current_user'
};

// ── Core CRUD ─────────────────────────────────────────────
function getData(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('[Storage] Read error:', key, e);
    return [];
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('[Storage] Write error:', key, e);
    if (typeof showToast === 'function') showToast('Penyimpanan penuh! Harap hapus data lama.', 'danger');
    return false;
  }
}

// ── Audit Log ─────────────────────────────────────────────
function addAudit(action, details) {
  const logs = getData(STORAGE_KEYS.AUDIT);
  const entry = {
    id:        'log_' + Date.now(),
    timestamp: new Date().toISOString(),
    action,
    details,
    user:      getCurrentUser()
  };
  logs.push(entry);
  // Keep last 500 entries
  if (logs.length > 500) logs.splice(0, logs.length - 500);
  saveData(STORAGE_KEYS.AUDIT, logs);
  return entry;
}

// ── User Session ──────────────────────────────────────────
function setCurrentUser(username) { saveData(STORAGE_KEYS.CURRENT_USER, [{ name: username }]); }
function getCurrentUser() {
  const d = getData(STORAGE_KEYS.CURRENT_USER);
  return (d[0] && d[0].name) ? d[0].name : 'HSE Officer';
}

// ── Company ───────────────────────────────────────────────
function getCompany() {
  const list = getData(STORAGE_KEYS.COMPANY);
  return list.length > 0 ? list[0] : null;
}

// ── Projects ──────────────────────────────────────────────
function getProjectById(id) {
  if (!id) return null;
  return getData(STORAGE_KEYS.PROJECTS).find(p => p.id === id) || null;
}
function getAllProjects() { return getData(STORAGE_KEYS.PROJECTS); }

// ── JSA ───────────────────────────────────────────────────
function getJSAById(id) {
  if (!id) return null;
  return getData(STORAGE_KEYS.JSA).find(j => j.id === id) || null;
}
function getJSAByProject(projectId) {
  if (!projectId) return [];
  return getData(STORAGE_KEYS.JSA).filter(j => j.project_id === projectId);
}
function getAllJSA() { return getData(STORAGE_KEYS.JSA); }

function saveJSA(jsa) {
  if (!jsa || !jsa.id) return null;
  const jsas = getData(STORAGE_KEYS.JSA);
  const idx = jsas.findIndex(j => j.id === jsa.id);
  jsa.updated_at = new Date().toISOString();
  if (idx >= 0) {
    jsas[idx] = { ...jsas[idx], ...jsa };
  } else {
    jsa.created_at = jsa.created_at || new Date().toISOString();
    jsas.push(jsa);
  }
  saveData(STORAGE_KEYS.JSA, jsas);
  addAudit('SAVE_JSA', `JSA ${jsa.document_number || jsa.id} disimpan`);
  return jsa;
}

function deleteJSAById(id) {
  if (!id) return false;
  const jsas = getData(STORAGE_KEYS.JSA);
  const filtered = jsas.filter(j => j.id !== id);
  if (filtered.length < jsas.length) {
    saveData(STORAGE_KEYS.JSA, filtered);
    addAudit('DELETE_JSA', `JSA ${id} dihapus`);
    return true;
  }
  return false;
}

// ── Risk Calculation ──────────────────────────────────────
function calculateRisk(severity, likelihood) {
  const s = parseInt(severity) || 0;
  const l = parseInt(likelihood) || 0;
  const level = s * l;
  let category = '-', color = '#6c757d', badgeClass = '';
  if (level >= 1  && level <= 4)  { category = 'Rendah';  color = '#28a745'; badgeClass = 'risk-low'; }
  else if (level >= 5  && level <= 9)  { category = 'Sedang';  color = '#ffc107'; badgeClass = 'risk-medium'; }
  else if (level >= 10 && level <= 15) { category = 'Tinggi';  color = '#fd7e14'; badgeClass = 'risk-high'; }
  else if (level >= 16 && level <= 25) { category = 'Ekstrim'; color = '#dc3545'; badgeClass = 'risk-extreme'; }
  return { level, category, color, badgeClass };
}

function getRiskBadgeClass(category) {
  const map = { Rendah: 'risk-low', Sedang: 'risk-medium', Tinggi: 'risk-high', Ekstrim: 'risk-extreme' };
  return map[category] || '';
}

// ── Document Number ───────────────────────────────────────
function generateDocNumber() {
  const year = new Date().getFullYear();
  const jsas = getData(STORAGE_KEYS.JSA);
  const prefix = `JSA-${year}-`;
  const count = jsas.filter(j => j.document_number && j.document_number.startsWith(prefix)).length;
  return `${prefix}${String(count + 1).padStart(3, '0')}`;
}

// ── Statistics ────────────────────────────────────────────
function getJSAStats() {
  const jsas = getAllJSA();
  const projects = getAllProjects();
  return {
    totalJSA:       jsas.length,
    totalDraft:     jsas.filter(j => j.status === 'draft').length,
    totalReview:    jsas.filter(j => j.status === 'review').length,
    totalApproved:  jsas.filter(j => j.status === 'approved').length,
    totalRejected:  jsas.filter(j => j.status === 'rejected').length,
    totalProjects:  projects.length,
    activeProjects: projects.filter(p => p.status === 'aktif').length
  };
}

// ── Search ────────────────────────────────────────────────
function searchJSA(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return getAllJSA();
  return getAllJSA().filter(jsa =>
    (jsa.job_name || '').toLowerCase().includes(q) ||
    (jsa.document_number || '').toLowerCase().includes(q)
  );
}

// ── Export / Import ───────────────────────────────────────
function exportJSON() {
  return JSON.stringify({
    version:     '2.0',
    export_date: new Date().toISOString(),
    company:     getCompany(),
    projects:    getAllProjects(),
    jsas:        getAllJSA(),
    audit:       getData(STORAGE_KEYS.AUDIT)
  }, null, 2);
}

function importJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.version) throw new Error('Format tidak valid');
    if (data.company)  saveData(STORAGE_KEYS.COMPANY,  [data.company]);
    if (data.projects) saveData(STORAGE_KEYS.PROJECTS, data.projects);
    if (data.jsas)     saveData(STORAGE_KEYS.JSA,      data.jsas);
    if (data.audit)    saveData(STORAGE_KEYS.AUDIT,    data.audit);
    addAudit('IMPORT_DATA', `Data diimport dari backup ${data.export_date}`);
    initStorage(); // Re-validate storage after import
    return true;
  } catch (e) {
    console.error('[Storage] Import error:', e);
    return false;
  }
}

// ── App Init ──────────────────────────────────────────────
function initStorage() {
  // Ensure arrays exist for all keys (except CURRENT_USER)
  [STORAGE_KEYS.COMPANY, STORAGE_KEYS.PROJECTS, STORAGE_KEYS.JSA, STORAGE_KEYS.AUDIT].forEach(key => {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      localStorage.setItem(key, '[]');
    } else {
      try { JSON.parse(raw); } catch (e) { localStorage.setItem(key, '[]'); }
    }
  });
  if (!getData(STORAGE_KEYS.CURRENT_USER).length) setCurrentUser('HSE Officer');
}

initStorage();