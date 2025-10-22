// Simple client-side PIN lock (first-run setup, then unlock per session)
(function(){
  async function sha256(msg){
    const enc = new TextEncoder();
    const data = enc.encode(msg);
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('SubtleCryptoUnavailable');
    }
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  // Fallback non-crypto hash (djb2) for non-secure contexts
  function djb2(str){
    let h = 5381;
    for (let i=0; i<str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
    return (h >>> 0).toString(16);
  }

  async function hashPin(msg){
    try { return await sha256(msg); }
    catch(e){ return djb2(msg); }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('lockOverlay');
    const setFields = document.getElementById('setPinFields');
    const enterFields = document.getElementById('enterPinFields');
    const pinForm = document.getElementById('pinForm');
    const newPin = document.getElementById('newPin');
    const confirmPin = document.getElementById('confirmPin');
    const enterPin = document.getElementById('enterPin');
    const pinMsg = document.getElementById('pinMsg');

    if (!overlay) return; // if overlay removed, skip

    const storedHash = localStorage.getItem('appPinHash');
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');

    if (!storedHash){
      // First-time setup
      setFields.style.display = 'flex';
      enterFields.style.display = 'none';
      // Ensure only setup fields participate in validation
      newPin.disabled = false; newPin.required = true;
      confirmPin.disabled = false; confirmPin.required = true;
      enterPin.disabled = true; enterPin.required = false;
      pinMsg.textContent = '';
      pinForm.onsubmit = async (e)=>{
        e.preventDefault();
        if (!newPin.value || newPin.value.length < 4){ pinMsg.textContent = 'PIN must be at least 4 digits.'; return; }
        if (newPin.value !== confirmPin.value){ pinMsg.textContent = 'PINs do not match.'; return; }
        const hash = await hashPin(newPin.value);
        localStorage.setItem('appPinHash', hash);
        overlay.style.display = 'none';
        overlay.setAttribute('aria-hidden', 'true');
      };
    } else {
      // Unlock flow
      setFields.style.display = 'none';
      enterFields.style.display = 'flex';
      // Ensure only enter field participates in validation
      newPin.disabled = true; newPin.required = false;
      confirmPin.disabled = true; confirmPin.required = false;
      enterPin.disabled = false; enterPin.required = true;
      pinMsg.textContent = '';
      pinForm.onsubmit = async (e)=>{
        e.preventDefault();
        const hash = await hashPin(enterPin.value);
        if (hash === localStorage.getItem('appPinHash')){
          overlay.style.display = 'none';
          overlay.setAttribute('aria-hidden', 'true');
        } else {
          pinMsg.textContent = 'Incorrect PIN. Try again.';
        }
      };
    }
  });
})();

// Global variables for net worth calculation
let expenses = [];
let incomeEntries = [];

document.addEventListener('DOMContentLoaded', () => {
  // ============================
  // One Page Plan Goals
  // ============================
  // One Page Plan fields
  const planForm = document.getElementById('planForm');
  const longTermGoal = document.getElementById('longTermGoal');
  const longTermDate = document.getElementById('longTermDate');
  const longTermPurpose = document.getElementById('longTermPurpose');
  const midTermGoal = document.getElementById('midTermGoal');
  const midTermDate = document.getElementById('midTermDate');
  const midTermPurpose = document.getElementById('midTermPurpose');
  const shortTermGoal = document.getElementById('shortTermGoal');
  const shortTermDate = document.getElementById('shortTermDate');
  const shortTermPurpose = document.getElementById('shortTermPurpose');
  const planGoals = document.getElementById('planGoals');
  const savePlanBtn = document.getElementById('savePlanBtn');

  let goals = JSON.parse(localStorage.getItem('goals')) || {
    long: { text: '', date: '', purpose: '' },
    mid: { text: '', date: '', purpose: '' },
    short: { text: '', date: '', purpose: '' }
  };

  // Prefill fields from stored goals
  if (goals.long) {
    longTermGoal.value = goals.long.text || '';
    longTermDate.value = goals.long.date || '';
    longTermPurpose.value = goals.long.purpose || '';
  }
  if (goals.mid) {
    midTermGoal.value = goals.mid.text || '';
    midTermDate.value = goals.mid.date || '';
    midTermPurpose.value = goals.mid.purpose || '';
  }
  if (goals.short) {
    shortTermGoal.value = goals.short.text || '';
    shortTermDate.value = goals.short.date || '';
    shortTermPurpose.value = goals.short.purpose || '';
  }

  planForm.addEventListener('submit', function(e) {
    e.preventDefault();
    goals = {
      long: { text: longTermGoal.value.trim(), date: longTermDate.value, purpose: longTermPurpose.value.trim() },
      mid: { text: midTermGoal.value.trim(), date: midTermDate.value, purpose: midTermPurpose.value.trim() },
      short: { text: shortTermGoal.value.trim(), date: shortTermDate.value, purpose: shortTermPurpose.value.trim() }
    };
    localStorage.setItem('goals', JSON.stringify(goals));
    renderGoals();
    updatePlanTimers();
  });

  function renderGoals() {
    planGoals.innerHTML = '';
    ['long', 'mid', 'short'].forEach(type => {
      if (goals[type] && goals[type].text) {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${type === 'long' ? 'Long-term' : type === 'mid' ? 'Mid-term' : 'Short-term'}:</strong> ${goals[type].text} <span style=\"color:#64748b;font-size:13px;\">${goals[type].date ? '(' + goals[type].date + ')' : ''}</span><br><span style=\"color:#10b981;font-size:13px;\"><em>${goals[type].purpose ? 'Purpose: ' + goals[type].purpose : ''}</em></span>`;
        planGoals.appendChild(li);
      }
    });
    updatePlanTimers();
    populateGoalDropdown();
    renderGoalDashboard();
  }

  // Update plan timers display
  function updatePlanTimers() {
    const planTimersDiv = document.getElementById('planTimers');
    if (!planTimersDiv) {
      console.log('planTimers element not found');
      return;
    }
    
    function getPlanCountdown(dateStr) {
      if (!dateStr) return 'No date set';
      const now = new Date();
      const target = new Date(dateStr);
      const diff = target - now;
      if (isNaN(diff)) return 'Invalid date';
      if (diff < 0) return 'Expired';
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      return `${days}d ${hours}h ${mins}m`;
    }

    planTimersDiv.innerHTML = `
      <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h4 style="margin: 0 0 12px 0; font-size: 15px; color: #3b82f6; font-weight: 600;">📅 Plan Deadlines</h4>
        <div style="font-size: 13px; line-height: 1.9; color: #334155;">
          <div style="margin-bottom: 6px;"><strong>Long:</strong> <span style="color: #10b981;">${getPlanCountdown(goals.long.date)}</span> ${goals.long.date ? '<span style="color: #64748b; font-size: 12px;">(' + goals.long.date + ')</span>' : ''}</div>
          <div style="margin-bottom: 6px;"><strong>Mid:</strong> <span style="color: #10b981;">${getPlanCountdown(goals.mid.date)}</span> ${goals.mid.date ? '<span style="color: #64748b; font-size: 12px;">(' + goals.mid.date + ')</span>' : ''}</div>
          <div><strong>Short:</strong> <span style="color: #10b981;">${getPlanCountdown(goals.short.date)}</span> ${goals.short.date ? '<span style="color: #64748b; font-size: 12px;">(' + goals.short.date + ')</span>' : ''}</div>
        </div>
      </div>
    `;
    console.log('Plan timers updated successfully');
  }


  // Expense add (persistent)
  const expenseName = document.getElementById('expenseName');
  const expenseAmount = document.getElementById('expenseAmount');
  const addExpenseBtn = document.getElementById('addExpenseBtn');
  const expenseList = document.getElementById('expenseList');
  const expenseTotal = document.getElementById('expenseTotal');

  // Load expenses from localStorage
  let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

  addExpenseBtn.addEventListener('click', () => {
    const name = expenseName.value.trim();
    const amount = parseFloat(expenseAmount.value);
    if (!name || isNaN(amount)) return;

    const item = { name, amount };
    expenses.push(item);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
    updateNetWorth();
    expenseName.value = '';
    expenseAmount.value = '';
  });

  function renderExpenses() {
    expenseList.innerHTML = '';
    let total = 0;
    expenses.forEach((item, index) => {
      total += item.amount;
      const li = document.createElement('li');
      li.innerHTML = `${item.name} - PKR ${item.amount.toLocaleString()} <button onclick=\"removeExpense(${index})\">X</button>`;
      expenseList.appendChild(li);
    });
    expenseTotal.textContent = `PKR ${total.toLocaleString()}`;
  }

  window.removeExpense = function(index) {
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
    updateNetWorth();
  };

  // Entry add (income, asset, passive, debt)
  const entryName = document.getElementById('entryName');
  const entryAmount = document.getElementById('entryAmount');
  const entryType = document.getElementById('entryType');
  const entryCategory = document.getElementById('entryCategory');
  const addEntryBtn = document.getElementById('addEntryBtn');
  const entryList = document.getElementById('entryList');
  const incomeTotal = document.getElementById('incomeTotal');
  const passiveTotal = document.getElementById('passiveTotal');
  const assetTotal = document.getElementById('assetTotal');
  const debtTotal = document.getElementById('debtTotal');

  let entries = JSON.parse(localStorage.getItem('entries')) || [];

  addEntryBtn.addEventListener('click', () => {
    const name = entryName.value.trim();
    const amount = parseFloat(entryAmount.value);
    const type = entryType.value;
    const category = entryCategory.value;
    if (!name || isNaN(amount) || !type) return;

    const entry = { name, amount, type, category };
    entries.push(entry);
    localStorage.setItem('entries', JSON.stringify(entries));
    renderEntries();
    updateNetWorth();
    entryName.value = '';
    entryAmount.value = '';
    entryType.value = '';
    entryCategory.value = '';
  });

  function renderEntries() {
    entryList.innerHTML = '';
    let totals = { income: 0, passive: 0, asset: 0, debt: 0 };
    entries.forEach((entry, index) => {
      totals[entry.type] += entry.amount;
      const li = document.createElement('li');
      li.innerHTML = `${entry.name} (${entry.type}${entry.category ? ', ' + entry.category : ''}) - PKR ${entry.amount.toLocaleString()} <button onclick="removeEntry(${index})">X</button>`;
      entryList.appendChild(li);
    });
    incomeTotal.textContent = `PKR ${totals.income.toLocaleString()}`;
    passiveTotal.textContent = `PKR ${totals.passive.toLocaleString()}`;
    assetTotal.textContent = `PKR ${totals.asset.toLocaleString()}`;
    debtTotal.textContent = `PKR ${totals.debt.toLocaleString()}`;
  }

  window.removeEntry = function(index) {
    entries.splice(index, 1);
    localStorage.setItem('entries', JSON.stringify(entries));
    renderEntries();
    updateNetWorth();
  };

  // Skills
  const skillName = document.getElementById('skillName');
  const skillCategory = document.getElementById('skillCategory');
  const skillLevel = document.getElementById('skillLevel');
  const addSkillBtn = document.getElementById('addSkillBtn');
  const skillsList = document.getElementById('skillsList');
  let skills = JSON.parse(localStorage.getItem('skills')) || [];
  // Migrate older records to include progress and notes
  skills = skills.map(s => ({
    name: s.name,
    category: s.category || '',
    level: s.level || 'Intermediate',
    progress: typeof s.progress === 'number' ? s.progress : 0,
    notes: Array.isArray(s.notes) ? s.notes : []
  }));
  localStorage.setItem('skills', JSON.stringify(skills));

  function suggestForSkill(s) {
    const p = s.progress || 0;
    const cat = (s.category || '').toLowerCase();
    const base = {
      technical: [
        'Complete a beginner course and build a mini project.',
        'Build 2 projects and read official docs; solve 10 coding challenges.',
        'Contribute to open-source and master advanced patterns.'
      ],
      soft: [
        'Practice a real scenario daily; request feedback.',
        'Join a meetup and role-play; record and review.',
        'Lead a session or mentor someone; refine clarity.'
      ],
      language: [
        'Daily vocab + listening for 15 minutes.',
        '2 conversations per week and daily journaling.',
        'Give a short talk; focus on idioms and precision.'
      ],
      tool: [
        'Learn top shortcuts and workflows.',
        'Automate a task or create a template.',
        'Build a plugin/toolkit and document best practices.'
      ],
      general: [
        'Define a clear outcome and weekly routine.',
        'Create a milestone project and get feedback.',
        'Publish work and perform a retrospective.'
      ]
    };
    const arr = base[cat] || base.general;
    if (p < 34) return arr[0];
    if (p < 67) return arr[1];
    return arr[2];
  }

  function renderSkills() {
    if (!skillsList) return;
    skillsList.innerHTML = '';
    skills.forEach((s, index) => {
      const li = document.createElement('li');
    const suggestion = suggestForSkill(s);
    const notesHtml = (s.notes || []).slice(-3).reverse().map(n => `<li style="font-size:12px;color:#475569;">${n.date}: ${n.text}</li>`).join('');
    li.innerHTML = `
      <div style="flex:1;">
        <div><strong>${s.name}</strong> <span style="color:#64748b;font-size:13px;">(${s.category || 'General'})</span></div>
        <div style="margin-top:8px;">
          <progress value="${s.progress || 0}" max="100" style="width: 100%; height: 10px;"></progress>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
            <div style="color:#0f172a;font-size:13px;">Progress: <strong>${s.progress || 0}%</strong></div>
            <div>
              <button onclick="incrementSkill(${index}, -5)" style="margin-right:6px;">-5%</button>
              <button onclick="incrementSkill(${index}, 5)">+5%</button>
            </div>
          </div>
        </div>
        <div style="margin-top:6px;font-size:13px;color:#334155;">Suggestion: <em>${suggestion}</em></div>
        <div style="margin-top:8px;display:flex;gap:6px;align-items:center;">
          <input type="text" id="skillNote-${index}" placeholder="Add note or next step" style="flex:1;"/>
          <button onclick="addSkillNote(${index})">Add</button>
        </div>
        <ul style="margin-top:6px;list-style:disc;padding-left:18px;">${notesHtml}</ul>
      </div>
      <div>
        <span style="background:#eef2ff;color:#3730a3;padding:2px 8px;border-radius:12px;font-size:12px;">${s.level}</span>
        <button onclick="removeSkill(${index})" style="margin-left:8px;">X</button>
      </div>
    `;
    skillsList.appendChild(li);
    });
  }

  if (addSkillBtn) {
    addSkillBtn.addEventListener('click', () => {
      const name = (skillName?.value || '').trim();
      const category = skillCategory?.value || '';
      const level = skillLevel?.value || 'Intermediate';
      if (!name) return;
    skills.push({ name, category, level, progress: 0, notes: [] });
      localStorage.setItem('skills', JSON.stringify(skills));
      renderSkills();
      if (skillName) skillName.value = '';
      if (skillCategory) skillCategory.value = '';
      if (skillLevel) skillLevel.value = 'Intermediate';
    });
  }

  window.removeSkill = function(index) {
    skills.splice(index, 1);
    localStorage.setItem('skills', JSON.stringify(skills));
    renderSkills();
  };

window.incrementSkill = function(index, delta) {
  const s = skills[index];
  if (!s) return;
  const p = Math.max(0, Math.min(100, (s.progress || 0) + delta));
  s.progress = p;
  localStorage.setItem('skills', JSON.stringify(skills));
  renderSkills();
};

window.addSkillNote = function(index) {
  const input = document.getElementById(`skillNote-${index}`);
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  const s = skills[index];
  if (!s.notes) s.notes = [];
  const date = new Date().toLocaleString();
  s.notes.push({ date, text });
  localStorage.setItem('skills', JSON.stringify(skills));
  input.value = '';
  renderSkills();
};
  renderSkills();

  // Deadline add (placeholder)
 

  // Habit update (placeholder)
  // ============================
// ============================
// Sequential Habit Chain Tracker with Goal Linking
// ============================
const habitNameInput = document.getElementById('habitName');
const habitGoalSelect = document.getElementById('habitGoal');
const addHabitBtn = document.getElementById('addHabitBtn');
const habitTable = document.getElementById('habitTable');

let habits = JSON.parse(localStorage.getItem('habits')) || [];

// Populate goal dropdown from One Page Plan goals
function populateGoalDropdown() {
  habitGoalSelect.innerHTML = '';
  // Add independent option
  const indep = document.createElement('option');
  indep.value = 'independent';
  indep.textContent = 'Independent';
  habitGoalSelect.appendChild(indep);
  // Add goals from plan
  ['long', 'mid', 'short'].forEach(type => {
    if (goals[type] && goals[type].text) {
      const option = document.createElement('option');
      option.value = goals[type].text;
      option.textContent = `${type === 'long' ? 'Long-term' : type === 'mid' ? 'Mid-term' : 'Short-term'}: ${goals[type].text}`;
      habitGoalSelect.appendChild(option);
    }
  });
}
populateGoalDropdown();

addHabitBtn.addEventListener('click', () => {
  const name = habitNameInput.value.trim();
  const goal = habitGoalSelect.value;
  if (!name || !goal) return;

  // Only check for active 21-day if there are already habits
  const hasActive21 = habits.length > 0 && habits.some(h => h.stage === 21 && h.progress < 21);
  if (hasActive21) {
    alert("Finish your current 21-day habit before starting a new one!");
    return;
  }

  habits.push({ name, goal, stage: 21, progress: 0, lastChecked: null });
  saveHabits();
  renderHabits();
  habitNameInput.value = '';
});

function renderHabits() {
  habitTable.innerHTML = '';
  
  // Separate active and completed habits
  const activeHabits = habits.filter(h => h.stage !== 'completed');
  const completedHabits = habits.filter(h => h.stage === 'completed');
  
  // Check if there's an active 21-day habit
  const hasActive21 = activeHabits.some(h => h.stage === 21 && h.progress < 21);
  
  // Render active habits first
  activeHabits.forEach((habit, activeIndex) => {
    const originalIndex = habits.indexOf(habit);
    const isLocked = hasActive21 && !(habit.stage === 21 && habit.progress < 21);
    
    // Check if today's progress is already marked
    const today = new Date().toDateString();
    const checkedToday = habit.lastChecked === today;

    const row = document.createElement('tr');
    row.className = isLocked ? 'habit-locked' : 'habit-unlocked';

    row.innerHTML = `
      <td>${habit.name}</td>
      <td>${habit.goal}</td>
      <td>${habit.stage}-day</td>
      <td>
        <progress value="${habit.progress}" max="${habit.stage}"></progress>
        ${habit.progress}/${habit.stage}
      </td>
      <td>
        ${!isLocked && !checkedToday ? `
          <button onclick="markHabitDone(${originalIndex}, true)" style="background: #10b981; color: white; padding: 6px 12px; margin-right: 5px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;" title="Mark as done">✓</button>
          <button onclick="markHabitDone(${originalIndex}, false)" style="background: #ef4444; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;" title="Mark as not done">✗</button>
        ` : checkedToday ? `<span style="color: #10b981; font-weight: bold;">✓ Checked today</span>` : ''}
        ${isLocked ? '<span style="color: #94a3b8;">Locked</span>' : ''}
      </td>
    `;
    habitTable.appendChild(row);
  });
  
  // Render completed habits at the bottom
  completedHabits.forEach(habit => {
    const originalIndex = habits.indexOf(habit);
    const row = document.createElement('tr');
    row.className = 'habit-completed';
    row.innerHTML = `
      <td>${habit.name}</td>
      <td>${habit.goal}</td>
      <td>✅ Completed</td>
      <td>
        <progress value="365" max="365"></progress>
        365/365
      </td>
      <td>
        <button onclick="removeHabit(${originalIndex})" style="background: #10b981;">Archive</button>
      </td>
    `;
    habitTable.appendChild(row);
  });

  addHabitBtn.disabled = hasActive21;
}

// Mark habit as done or not done for today
window.markHabitDone = function(index, isDone) {
  const today = new Date().toDateString();
  let habit = habits[index];
  
  // Mark as checked today
  habit.lastChecked = today;
  
  if (isDone) {
    // Increment progress by 1 day
    habit.progress += 1;
    
    // Check if habit stage is completed
    if (habit.progress >= habit.stage) {
      if (habit.stage === 21) {
        habit.stage = 90;
      } else if (habit.stage === 90) {
        habit.stage = 365;
      } else if (habit.stage === 365) {
        habit.stage = 'completed';
      }
      habit.progress = 0;
    }
  }
  // If not done (isDone = false), we just mark it as checked without incrementing
  
  saveHabits();
  renderHabits();
};

window.addDays = function(index) {
  const input = document.getElementById(`days-${index}`);
  const days = parseInt(input.value);
  if (isNaN(days) || days <= 0) return;

  let habit = habits[index];
  habit.progress += days;

  if (habit.progress >= habit.stage) {
    if (habit.stage === 21) {
      habit.stage = 90;
      habit.progress = 0;
    } else if (habit.stage === 90) {
      habit.stage = 180;
      habit.progress = 0;
    } else if (habit.stage === 180) {
      habit.stage = 365;
      habit.progress = 0;
    } else if (habit.stage === 365) {
      habit.stage = 'completed';
      habit.progress = 365;
      alert(`${habit.name} completed the full chain! 🎉`);
    }
  }

  saveHabits();
  renderHabits();
};

window.removeHabit = function(index) {
  if (confirm('Archive this completed habit?')) {
    habits.splice(index, 1);
    saveHabits();
    renderHabits();
  }
};

// saveHabits is defined later with dashboard refresh

// ============================
// Goal Dashboard View
// ============================
const goalDashboardContent = document.getElementById('goalDashboardContent');

function renderGoalDashboard() {
  goalDashboardContent.innerHTML = '';

  // Create an array of goal entries from the goals object
  const goalEntries = [];
  ['long', 'mid', 'short'].forEach(type => {
    if (goals[type] && goals[type].text) {
      goalEntries.push({
        type: type,
        text: goals[type].text,
        date: goals[type].date,
        purpose: goals[type].purpose
      });
    }
  });

  // Do not include an "Independent" bucket in the dashboard; independent habits are excluded below

  if (goalEntries.length === 0) {
    goalDashboardContent.innerHTML = '<p>No goals defined yet.</p>';
    return;
  }

  goalEntries.forEach(goal => {
    // Find habits linked to this goal; exclude any habit whose goal is 'Independent'
    const linkedHabits = habits.filter(h => h.goal !== 'Independent' && h.goal === goal.text);

    const goalDiv = document.createElement('div');
    goalDiv.className = 'goal-card';
  const label = goal.type === 'long' ? 'Long-term' : goal.type === 'mid' ? 'Mid-term' : 'Short-term';
    goalDiv.innerHTML = `<h3>${label}: ${goal.text}</h3>`;

    if (linkedHabits.length === 0) {
      goalDiv.innerHTML += `<p style="color: #94a3b8; font-size: 13px;">No habits linked yet.</p>`;
    } else {
      linkedHabits.forEach(habit => {
        goalDiv.innerHTML += `
          <div class="habit-summary" style="margin-bottom: 10px; padding: 10px; background: #f1f5f9; border-radius: 6px;">
            <strong>${habit.name}</strong> — ${habit.stage}-day stage
            <br>
            <progress value="${habit.progress}" max="${habit.stage}" style="width: 100%; height: 8px;"></progress>
            <span style="font-size: 12px; color: #64748b;">${habit.progress}/${habit.stage} days</span>
          </div>
        `;
      });
    }

    goalDashboardContent.appendChild(goalDiv);
  });
}

// Call dashboard render whenever habits or goals update
function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
  renderGoalDashboard();
}

function renderGoals() {
  planGoals.innerHTML = '';
  ['long', 'mid', 'short'].forEach(type => {
    if (goals[type] && goals[type].text) {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${type === 'long' ? 'Long-term' : type === 'mid' ? 'Mid-term' : 'Short-term'}:</strong> ${goals[type].text} <span style="color:#64748b;font-size:13px;">${goals[type].date ? '(' + goals[type].date + ')' : ''}</span><br><span style="color:#10b981;font-size:13px;"><em>${goals[type].purpose ? 'Purpose: ' + goals[type].purpose : ''}</em></span>`;
      planGoals.appendChild(li);
    }
  });
  populateGoalDropdown();
  renderGoalDashboard();
}

// Initial render
renderGoals();
updatePlanTimers();
renderHabits();
renderGoalDashboard();
renderEntries();
renderExpenses();

  // ============================
  // Backup & Restore
  // ============================
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  const backupMsg = document.getElementById('backupMsg');

  function setMsg(msg, ok=true){
    if (!backupMsg) return;
    backupMsg.style.color = ok ? '#0f766e' : '#b91c1c';
    backupMsg.textContent = msg;
    setTimeout(()=>{ backupMsg.textContent = ''; }, 4000);
  }

  function download(filename, text) {
    const el = document.createElement('a');
    el.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
    el.setAttribute('download', filename);
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  }

  exportBtn?.addEventListener('click', () => {
    try {
      const payload = {
        goals,
        expenses,
        entries,
        habits,
        deadlines,
        skills
        // Note: appPinHash is intentionally excluded for safety
      };
      const stamp = new Date().toISOString().slice(0,10);
      download(`life-os-backup-${stamp}.json`, JSON.stringify(payload, null, 2));
      setMsg('Backup exported.');
    } catch (e) {
      setMsg('Export failed.', false);
    }
  });

  importBtn?.addEventListener('click', () => importFile?.click());

  importFile?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        // Basic validation and hydration
        goals = data.goals || goals;
        expenses = Array.isArray(data.expenses) ? data.expenses : expenses;
        entries = Array.isArray(data.entries) ? data.entries : entries;
        habits = Array.isArray(data.habits) ? data.habits : habits;
        deadlines = Array.isArray(data.deadlines) ? data.deadlines : deadlines;
        skills = Array.isArray(data.skills) ? data.skills.map(s => ({
          name: s.name,
          category: s.category || '',
          level: s.level || 'Intermediate',
          progress: typeof s.progress === 'number' ? s.progress : 0,
          notes: Array.isArray(s.notes) ? s.notes : []
        })) : skills;

        // Persist
        localStorage.setItem('goals', JSON.stringify(goals));
        localStorage.setItem('expenses', JSON.stringify(expenses));
        localStorage.setItem('entries', JSON.stringify(entries));
        localStorage.setItem('habits', JSON.stringify(habits));
        localStorage.setItem('deadlines', JSON.stringify(deadlines));
        localStorage.setItem('skills', JSON.stringify(skills));

        // Re-render
        renderGoals();
        renderEntries();
        renderExpenses();
        renderHabits();
        renderDeadlines();
        updatePlanTimers();
        updateLiveTimer();
        setMsg('Backup imported.');
      } catch (err) {
        console.error(err);
        setMsg('Invalid backup file.', false);
      }
    };
    reader.readAsText(file);
    // reset input value to allow re-importing same file later
    e.target.value = '';
  });


  // ============================
  // Net Worth + Wealth Level
  // ============================
  function updateNetWorth() {
    const netWorthValue = document.getElementById('netWorthValue');
    const wealthLevelValue = document.getElementById('wealthLevelValue');
    const wealthLevelLabel = document.getElementById('wealthLevelLabel');
    const wealthLevelDesc = document.getElementById('wealthLevelDesc');
    const wealthLevelGoal = document.getElementById('wealthLevelGoal');

    let income = 0, passive = 0, asset = 0, debt = 0, expense = 0;

    entries.forEach(e => {
      if (e.type === 'income') income += e.amount;
      if (e.type === 'passive') passive += e.amount;
      if (e.type === 'asset') asset += e.amount;
      if (e.type === 'debt') debt += e.amount;
    });

    expenses.forEach(e => expense += e.amount);

    const netWorth = asset - debt;
    netWorthValue.textContent = `PKR ${netWorth.toLocaleString()}`;

    // Wealth level logic
    let level = 0, label = '', desc = '', goal = '';
    if (income < expense || income === 0) {
      level = 0;
      label = 'Financial Struggle';
      desc = 'Your income is less than your monthly expenses, or you have no income at all. You are living in a deficit, dependent on others or debt to survive.';
      goal = 'Move from Level 0 to Level 1 by balancing your income and expenses.';
    } else if (income === expense) {
      level = 1;
      label = 'Financial Stability';
      desc = 'Your income equals your expenses. You’re surviving, but not saving.';
      goal = 'Create a surplus and begin saving to move to Level 2.';
    } else if (income >= 2 * expense) {
      if (passive >= expense && netWorth >= 1000000) {
        level = 3;
        label = 'Financial Freedom';
        desc = 'Passive income covers your lifestyle. Net worth is $1 million or more. You no longer need to work for money.';
        goal = 'Make this your mid-term life target — to achieve financial freedom.';
      } else {
        level = 2;
        label = 'Financial Growth';
        desc = 'Your income is double your expenses. You start saving and investing.';
        goal = 'Use your savings wisely to generate passive income and progress to Level 3.';
      }
    } else if (netWorth >= 50000000) {
      level = 4;
      label = 'Business Tycoon';
      desc = 'Massive wealth and global impact. You create change and influence society.';
      goal = 'Combine wealth with purpose — use your influence to impact society.';
    } else {
      level = 0;
      label = 'Financial Struggle';
      desc = 'Your income is less than your monthly expenses, or you have no income at all.';
      goal = 'Move from Level 0 to Level 1 by balancing your income and expenses.';
    }

    wealthLevelValue.textContent = `Level ${level}`;
    wealthLevelLabel.textContent = label;
    wealthLevelDesc.textContent = desc;
    wealthLevelGoal.textContent = goal;
  }

  // Make updateNetWorth available globally
  window.updateNetWorth = updateNetWorth;
});


// ============================
// Deadlines Table + Live Timer
// ============================
const deadlineName = document.getElementById('deadlineName');
const deadlineDate = document.getElementById('deadlineDate');
const addDeadlineBtn = document.getElementById('addDeadlineBtn');
const deadlineRows = document.getElementById('deadlineRows');
const nextDeadline = document.getElementById('nextDeadline');

let deadlines = JSON.parse(localStorage.getItem('deadlines')) || [];

addDeadlineBtn.addEventListener('click', () => {
  const name = deadlineName.value.trim();
  const date = deadlineDate.value;
  if (!name || !date) return;

  const deadline = { name, date };
  deadlines.push(deadline);
  localStorage.setItem('deadlines', JSON.stringify(deadlines));
  renderDeadlines();
  updateLiveTimer();
  deadlineName.value = '';
  deadlineDate.value = '';
});

function renderDeadlines() {
  deadlineRows.innerHTML = '';
  deadlines.forEach((d, index) => {
    const row = document.createElement('tr');
    const timer = getCountdown(d.date);
    row.innerHTML = `
      <td>${d.name}</td>
      <td>${d.date}</td>
      <td>${timer}</td>
      <td><button onclick="removeDeadline(${index})">X</button></td>
    `;
    deadlineRows.appendChild(row);
  });
}

window.removeDeadline = function(index) {
  deadlines.splice(index, 1);
  localStorage.setItem('deadlines', JSON.stringify(deadlines));
  renderDeadlines();
  updateLiveTimer();
};

function getCountdown(dateStr) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target - now;

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function updateLiveTimer() {
  if (deadlines.length === 0) {
    nextDeadline.textContent = '—';
    return;
  }

  // Find the nearest future deadline
  const now = new Date();
  const upcoming = deadlines
    .filter(d => new Date(d.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  if (!upcoming) {
    nextDeadline.textContent = '—';
    return;
  }

  nextDeadline.textContent = getCountdown(upcoming.date);
}

// Update live timer every second
setInterval(updateLiveTimer, 1000);

// Update plan timers every minute (they don't need second precision)
setInterval(() => {
  if (typeof updatePlanTimers === 'function') {
    updatePlanTimers();
  }
}, 60000);

// Initial calls
updateLiveTimer();
renderDeadlines();
