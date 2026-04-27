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

// ── Access Code Modal ──────────────────────────────────
function checkAccess() {
  // Cek apakah sudah pernah login sebelumnya di session ini
  if (sessionStorage.getItem('jsa_access_granted') === 'true') {
    return true;
  }
  
  // Tampilkan modal
  showAccessModal();
  return false;
}

function showAccessModal() {
  // Hapus modal lama jika ada
  const oldModal = document.getElementById('accessModal');
  if (oldModal) oldModal.remove();
  const oldOverlay = document.getElementById('accessOverlay');
  if (oldOverlay) oldOverlay.remove();

  // Buat overlay
  const overlay = document.createElement('div');
  overlay.id = 'accessOverlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 10000;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    animation: fadeIn 0.3s ease;
  `;

  // Buat modal card
  const modal = document.createElement('div');
  modal.id = 'accessModal';
  modal.style.cssText = `
    background: #ffffff;
    border-radius: 16px;
    padding: 32px 28px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 25px 50px rgba(0,0,0,0.25);
    animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    text-align: center;
  `;

  modal.innerHTML = `
    <div style="width: 60px; height: 60px; margin: 0 auto 16px;
      background: linear-gradient(135deg, #f59e0b, #fbbf24);
      border-radius: 16px; display: flex; align-items: center; justify-content: center;
      font-size: 1.6rem; color: #1e293b; box-shadow: 0 8px 24px rgba(245,158,11,0.4);">
      <i class="bi bi-shield-lock"></i>
    </div>
    <h3 style="font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:1.2rem; color:#1e293b; margin-bottom:6px;">
      Akses Terbatas
    </h3>
    <p style="font-size:0.82rem; color:#64748b; margin-bottom: 20px;">
      Masukkan kode akses untuk membuka aplikasi JSA Digital
    </p>
    <div style="position:relative; margin-bottom: 16px;">
      <input type="password" id="accessCodeInput" 
        placeholder="Kode Akses"
        style="width:100%; padding:12px 16px; font-size:0.95rem;
          border:2px solid #e2e8f0; border-radius:12px;
          text-align:center; font-family:'Plus Jakarta Sans',sans-serif;
          letter-spacing:4px; font-weight:700;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;"
        onfocus="this.style.borderColor='#f59e0b';this.style.boxShadow='0 0 0 3px rgba(245,158,11,0.1)'"
        onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow='none'"
        onkeydown="if(event.key==='Enter')verifyAccess()">
      <button onclick="document.getElementById('accessCodeInput').type = document.getElementById('accessCodeInput').type === 'password' ? 'text' : 'password'"
        style="position:absolute; right:12px; top:50%; transform:translateY(-50%);
          background:none; border:none; color:#94a3b8; cursor:pointer; padding:4px;">
        <i class="bi bi-eye"></i>
      </button>
    </div>
    <button onclick="verifyAccess()"
      style="width:100%; padding:12px; 
        background: linear-gradient(135deg, #f59e0b, #fbbf24);
        border: none; border-radius: 12px; 
        font-size: 0.9rem; font-weight: 700; color: #1e293b;
        cursor: pointer; font-family:'Plus Jakarta Sans',sans-serif;
        box-shadow: 0 4px 14px rgba(245,158,11,0.35);
        transition: all 0.2s ease;"
      onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 6px 20px rgba(245,158,11,0.45)'"
      onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 14px rgba(245,158,11,0.35)'">
      <i class="bi bi-unlock"></i> Buka Aplikasi
    </button>
    <p style="font-size:0.68rem; color:#94a3b8; margin-top: 14px;">
      Hubungi admin jika lupa kode akses
    </p>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Fokus ke input setelah modal tampil
  setTimeout(() => {
    const input = document.getElementById('accessCodeInput');
    if (input) input.focus();
  }, 400);
}

function verifyAccess() {
  const input = document.getElementById('accessCodeInput');
  const code = input ? input.value.trim() : '';
  
  if (code === 'demo') {
    // Login berhasil
    sessionStorage.setItem('jsa_access_granted', 'true');
    
    // Animasi sukses lalu tutup modal
    const overlay = document.getElementById('accessOverlay');
    const modal = document.getElementById('accessModal');
    
    if (modal) {
      modal.querySelector('input').style.borderColor = '#10b981';
      modal.querySelector('input').style.boxShadow = '0 0 0 3px rgba(16,185,129,0.15)';
      modal.querySelector('input').style.background = '#f0fdf4';
    }
    
    setTimeout(() => {
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => overlay.remove(), 300);
      }
      showToast('Akses diterima! Selamat datang.', 'success');
    }, 500);
    
  } else {
    // Login gagal
    if (input) {
      input.style.borderColor = '#ef4444';
      input.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.15)';
      input.style.background = '#fef2f2';
      input.value = '';
      input.placeholder = 'Kode salah. Coba lagi...';
      
      setTimeout(() => {
        input.style.borderColor = '#e2e8f0';
        input.style.boxShadow = 'none';
        input.style.background = '#ffffff';
        input.placeholder = 'Kode Akses';
      }, 800);
    }
    
    // Goyang modal
    const modal = document.getElementById('accessModal');
    if (modal) {
      modal.style.animation = 'none';
      modal.offsetHeight;
      modal.style.animation = 'shake 0.5s ease';
    }
  }
}

// Tambahkan keyframe shake jika belum ada di style.css
function addShakeKeyframe() {
  if (!document.getElementById('shake-keyframe')) {
    const style = document.createElement('style');
    style.id = 'shake-keyframe';
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
        20%, 40%, 60%, 80% { transform: translateX(6px); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
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

// ── Initialize logos & access check on page load ────────
document.addEventListener('DOMContentLoaded', function() {
  addShakeKeyframe();
  updateAllCompanyLogos();
  checkAccess();
});
