// ==================== APP.JS v3.0 — Shared Functions ====================

// ── Toast ──────────────────────────────────────────────
function showToast(message, type = 'success') {
  let container = document.querySelector('.jsa-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'jsa-toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
  const icons = { success:'bi-check-circle-fill', danger:'bi-x-circle-fill', warning:'bi-exclamation-triangle-fill', info:'bi-info-circle-fill' };
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
  toast.style.minWidth = '250px';
  toast.innerHTML = `<div class="d-flex">
    <div class="toast-body d-flex align-items-center gap-2">
      <i class="bi ${icons[type]||icons.info}"></i><span>${message}</span>
    </div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.closest('.toast').remove()"></button>
  </div>`;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentElement) toast.remove(); }, 3500);
}

// ── Sidebar Toggle ──────────────────────────────────────
function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('sidebarOverlay');
  if (s) s.classList.toggle('open');
  if (o) o.classList.toggle('show');
}
function closeSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('sidebarOverlay');
  if (s) s.classList.remove('open');
  if (o) o.classList.remove('show');
}

// ── Company Logo ───────────────────────────────────────
function getCompanyLogo() {
  const company = getCompany();
  return company && company.logo ? company.logo : null;
}

function updateAllCompanyLogos() {
  const logo = getCompanyLogo();
  
  // Update mobile header logo
  const mobileLogo = document.querySelector('.mobile-header-logo');
  if (mobileLogo) {
    if (logo) {
      mobileLogo.innerHTML = `<img src="${logo}" alt="Logo" style="width:100%;height:100%;object-fit:contain;border-radius:9px;">`;
      mobileLogo.style.background = 'transparent';
      mobileLogo.style.boxShadow = 'none';
    } else {
      mobileLogo.innerHTML = '<i class="bi bi-shield-check"></i>';
      mobileLogo.style.background = '';
      mobileLogo.style.boxShadow = '';
    }
  }
  
  // Update sidebar brand logo
  const sidebarLogo = document.querySelector('.sidebar-brand-logo');
  if (sidebarLogo) {
    if (logo) {
      sidebarLogo.innerHTML = `<img src="${logo}" alt="Logo" style="width:100%;height:100%;object-fit:contain;border-radius:10px;">`;
      sidebarLogo.style.background = 'transparent';
      sidebarLogo.style.boxShadow = 'none';
    } else {
      sidebarLogo.innerHTML = '<i class="bi bi-shield-check"></i>';
      sidebarLogo.style.background = '';
      sidebarLogo.style.boxShadow = '';
    }
  }
}

// ── Date Utils ─────────────────────────────────────────
function formatDate(d) {
  if (!d) return '-';
  try { return new Date(d).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' }); } catch(e) { return d; }
}
function formatDateTime(d) {
  if (!d) return '-';
  try { return new Date(d).toLocaleString('id-ID', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); } catch(e) { return d; }
}
function timeAgo(d) {
  if (!d) return '-';
  try {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), days = Math.floor(diff/86400000);
    if (m < 1)   return 'baru saja';
    if (m < 60)  return `${m}m lalu`;
    if (h < 24)  return `${h}j lalu`;
    if (days < 7) return `${days}h lalu`;
    return formatDate(d);
  } catch(e) { return '-'; }
}

// ── Status Badge ────────────────────────────────────────
function getStatusBadge(status) {
  const m = { draft:['secondary','Draft'], review:['warning','Review'], approved:['success','✓ Disetujui'], rejected:['danger','Ditolak'], aktif:['success','Aktif'], selesai:['secondary','Selesai'], tertunda:['warning','Tertunda'] };
  const [cls, lbl] = m[status] || ['secondary', status];
  return `<span class="badge bg-${cls}">${lbl}</span>`;
}

// ── PPE Labels (Legacy + Work Type Based) ──────────────
function getPPEList(ppe) {
  if (!ppe) return [];
  
  // New format (work type based)
  if (ppe.selected_work_types && ppe.items) {
    const list = [];
    
    // Get labels from work type items
    (ppe.items || []).forEach(item => {
      if (item.label) list.push(item.label);
    });
    
    // Add custom items
    if (ppe.custom_items && Array.isArray(ppe.custom_items)) {
      ppe.custom_items.forEach(ci => {
        if (ci && !list.includes(ci)) list.push(ci);
      });
    }
    
    return list;
  }
  
  // Legacy format (backward compatibility)
  const LEGACY_PPE_LABELS = {
    helm:'Helm Safety', face_shield:'Face Shield', welding_helmet:'Welding Helmet', hair_cap:'Tudung Kepala',
    safety_glasses:'Safety Glasses', goggles:'Goggles', uv_glasses:'UV Glasses',
    mask_n95:'Masker N95', mask_biasa:'Masker Biasa', respirator:'Respirator', scba:'SCBA',
    cotton_gloves:'Sarung Tangan Katun', rubber_gloves:'Sarung Tangan Karet',
    welding_gloves:'Sarung Tangan Las', electrical_gloves:'Sarung Tangan Elektrik',
    safety_shoes:'Sepatu Safety', rubber_boots:'Boot Karet', safety_boots:'Safety Boots',
    safety_vest:'Rompi Safety', apron:'Apron', coverall:'Coverall', chemical_suit:'Chemical Suit',
    safety_belt:'Sabuk Pengaman', lanyard:'Lanyard', shock_absorber:'Shock Absorber', lifeline:'Lifeline'
  };
  const list = [];
  ['kepala','mata','pernapasan','tangan','kaki','tubuh','perangkat_jatuh'].forEach(cat => {
    if (ppe[cat]) Object.entries(ppe[cat]).forEach(([k,v]) => { if (v && LEGACY_PPE_LABELS[k]) list.push(LEGACY_PPE_LABELS[k]); });
  });
  if (ppe.lainnya) list.push(ppe.lainnya);
  return list;
}

// ── Permit Labels ───────────────────────────────────────
const PERMIT_LABELS = {
  hot_work:'🔥 Hot Work', confined_space:'🚧 Confined Space',
  working_height:'📐 Bekerja di Ketinggian', electrical:'⚡ Isolasi Listrik',
  lifting:'🏗️ Lifting & Rigging', excavation:'⛏️ Excavation',
  pressure_test:'🔧 Pressure Test', radiation:'☢️ Radiasi'
};

// ── Initialize logos on page load ───────────────────────
document.addEventListener('DOMContentLoaded', function() {
  updateAllCompanyLogos();
});