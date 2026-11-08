// CONFIGURATION: Replace this URL with your actual Gumroad or Stripe payment link
const CHECKOUT_URL = "https://gumroad.com"; 

let leadsData = [];

// DOM Elements
const tableBody = document.getElementById('leads-table-body');
const searchInput = document.getElementById('search-input');
const industryFilter = document.getElementById('industry-filter');
const leadCount = document.getElementById('lead-count');
const checkoutModal = document.getElementById('checkout-modal');
const gumroadBuyBtn = document.getElementById('gumroad-buy-btn');

// Initialize checkout button
if (gumroadBuyBtn) {
  gumroadBuyBtn.href = CHECKOUT_URL;
}

// Fetch and load database
async function loadLeads() {
  try {
    const response = await fetch('./database.json');
    leadsData = await response.json();
    renderLeads(leadsData);
  } catch (error) {
    console.error('Failed to load leads database:', error);
  }
}

// Render leads into table
function renderLeads(leads) {
  if (!tableBody) return;
  tableBody.innerHTML = '';
  leadCount.textContent = leads.length;

  if (leads.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-slate-500 text-xs">
          No matching companies found. Try a different search term or category.
        </td>
      </tr>
    `;
    return;
  }

  leads.forEach(lead => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-800/40 transition group';

    tr.innerHTML = `
      <td class="py-4 px-4 font-semibold text-white">
        <div class="flex items-center gap-2">
          <span>${escapeHTML(lead.company)}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">${escapeHTML(lead.stage)}</span>
        </div>
        <div class="text-[11px] text-slate-400 font-normal mt-0.5">${escapeHTML(lead.location)}</div>
      </td>
      <td class="py-4 px-4">
        <span class="inline-block px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[11px] font-medium">
          ${escapeHTML(lead.industry)}
        </span>
      </td>
      <td class="py-4 px-4 text-slate-300">
        <div class="font-medium text-white">${escapeHTML(lead.decisionMaker)}</div>
        <div class="text-[11px] text-slate-400">${escapeHTML(lead.title)}</div>
      </td>
      <td class="py-4 px-4">
        <div class="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 w-fit">
          <i data-lucide="mail" class="w-3.5 h-3.5 text-emerald-400"></i>
          <span>${escapeHTML(lead.verifiedEmail)}</span>
        </div>
      </td>
      <td class="py-4 px-4 text-slate-300 max-w-xs">
        <p class="text-xs text-slate-200">${escapeHTML(lead.budgetIntent)}</p>
        <span class="text-[10px] text-slate-500 font-mono mt-0.5 block">Tech: ${escapeHTML(lead.techStack)}</span>
      </td>
      <td class="py-4 px-4 text-right">
        <button onclick="openCheckoutModal()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1 ml-auto">
          <i data-lucide="unlock" class="w-3 h-3"></i>
          <span>Unlock</span>
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  // Re-run Lucide icons on newly inserted elements
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Filter logic
function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();
  const selectedIndustry = industryFilter.value;

  const filtered = leadsData.filter(lead => {
    const matchesSearch = 
      lead.company.toLowerCase().includes(query) ||
      lead.techStack.toLowerCase().includes(query) ||
      lead.decisionMaker.toLowerCase().includes(query) ||
      lead.budgetIntent.toLowerCase().includes(query);

    const matchesIndustry = selectedIndustry === 'ALL' || lead.industry === selectedIndustry;

    return matchesSearch && matchesIndustry;
  });

  renderLeads(filtered);
}

// Event Listeners
if (searchInput) {
  searchInput.addEventListener('input', applyFilters);
}

if (industryFilter) {
  industryFilter.addEventListener('change', applyFilters);
}

// Modal open/close
function openCheckoutModal() {
  if (checkoutModal) {
    checkoutModal.classList.remove('hidden');
  }
}

function closeCheckoutModal() {
  if (checkoutModal) {
    checkoutModal.classList.add('hidden');
  }
}

// Close on outside click
if (checkoutModal) {
  checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
      closeCheckoutModal();
    }
  });
}

// Helper to prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Load on start
loadLeads();
