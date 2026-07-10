// SIM — Security Incident Mapping (Dispatch, single-page variant)
// Client-side only demo: reports are held in memory and reset on page reload.

(function () {
  "use strict";

  const reports = [];

  const form = document.getElementById("reportForm");
  const anonymousBox = document.getElementById("anonymous");
  const reporterIdBlock = document.getElementById("reporterIdBlock");
  const reporterIdInput = document.getElementById("reporterId");

  const cardGrid = document.getElementById("cardGrid");
  const emptyState = document.getElementById("emptyState");
  const filterType = document.getElementById("filterType");

  const statTotal = document.getElementById("statTotal");
  const statCritical = document.getElementById("statCritical");
  const statPending = document.getElementById("statPending");
  const statAnon = document.getElementById("statAnon");

  const toast = document.getElementById("toast");

  anonymousBox.addEventListener("change", () => {
    reporterIdBlock.style.display = anonymousBox.checked ? "none" : "block";
    if (anonymousBox.checked) reporterIdInput.value = "";
  });

  function severityOf(selectEl) {
    const opt = selectEl.options[selectEl.selectedIndex];
    return (opt && opt.dataset.severity) || "low";
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function render() {
    const activeFilter = filterType.value;
    const visible = reports.filter(
      (r) => activeFilter === "all" || r.type === activeFilter
    );

    cardGrid.innerHTML = "";
    emptyState.style.display = visible.length ? "none" : "block";

    visible
      .slice()
      .reverse()
      .forEach((r) => {
        const card = document.createElement("div");
        card.className = `report-card sev-${r.severity}`;
        card.innerHTML = `
          <div class="card-top">
            <span class="card-type">${escapeHtml(r.type)}</span>
            <span class="card-time">${r.timeLabel} · ${r.status}</span>
          </div>
          <div class="card-meta">📍 ${escapeHtml(r.location)} · ${escapeHtml(r.reporterType)}</div>
          <div class="card-desc">${escapeHtml(r.description)}</div>
          <div>
            <span class="badge sev-${r.severity}">${r.severity}</span>
            ${r.anonymous ? '<span class="badge anon">anonymous</span>' : ""}
          </div>
        `;
        cardGrid.appendChild(card);
      });

    statTotal.textContent = String(reports.length);
    statCritical.textContent = String(reports.filter((r) => r.severity === "critical").length);
    statPending.textContent = String(reports.filter((r) => r.status === "Pending review").length);
    statAnon.textContent = String(reports.filter((r) => r.anonymous).length);
  }

  filterType.addEventListener("change", render);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const reporterType = document.getElementById("reporterType").value;
    const incidentTypeEl = document.getElementById("incidentType");
    const incidentType = incidentTypeEl.value;
    const location = document.getElementById("location").value.trim();
    const description = document.getElementById("description").value.trim();
    const anonymous = anonymousBox.checked;

    if (!reporterType || !incidentType || !location || !description) {
      showToast("Please fill in all required fields.");
      return;
    }

    reports.push({
      id: Date.now(),
      reporterType,
      type: incidentType,
      severity: severityOf(incidentTypeEl),
      location,
      description,
      anonymous,
      status: "Pending review",
      timeLabel: "Just now",
    });

    render();
    showToast(
      anonymous
        ? "Report submitted anonymously — security notified."
        : "Report submitted successfully."
    );

    form.reset();
    reporterIdBlock.style.display = "block";
  });

  render();
})();
