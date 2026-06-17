// INTERACTIVE LOGIC: DIGITAL SCRAPBOOK / ARTISANAL COLLAGE

// Default milestones data structure
const DEFAULT_MILESTONES = [
    // Family & Journey
    { id: 'fam-1', text: 'Transition family from Vietnam in 2016', category: 'family', checked: true },
    { id: 'fam-2', text: 'Adapt to US culture & English language', category: 'family', checked: true },
    { id: 'fam-3', text: 'Gather friends for a family hotpot dinner', category: 'family', checked: true },
    { id: 'fam-4', text: 'Create a digital family photo archive', category: 'family', checked: false },
    // CS Studies & AI
    { id: 'study-1', text: 'Learn HTML/CSS/Javascript basics', category: 'studies', checked: true },
    { id: 'study-2', text: 'Build interactive digital scrapbook', category: 'studies', checked: true },
    { id: 'study-3', text: 'Master core CS data structures & algorithms', category: 'studies', checked: false },
    { id: 'study-4', text: 'Build experimental AI explore project', category: 'studies', checked: false },
    // Life & Adventures
    { id: 'adv-1', text: 'Visit coastal beach and take photos', category: 'adventures', checked: true },
    { id: 'adv-2', text: 'Set up cozy desktop learning environment', category: 'adventures', checked: true },
    { id: 'adv-3', text: 'Road trip with college friends', category: 'adventures', checked: false },
    { id: 'adv-4', text: 'Read 12 computer science & design books', category: 'adventures', checked: false }
];

// Default habits data structure
const DEFAULT_HABITS = [
    { id: 'habit-1', text: 'Code & review CS projects', category: 'CODE', checked: false },
    { id: 'habit-2', text: 'Call family or help around the house', category: 'FAMILY', checked: false },
    { id: 'habit-3', text: 'Drink 8 glasses of water', category: 'HEALTH', checked: false },
    { id: 'habit-4', text: 'Read 1 research paper or book chapter', category: 'READ', checked: false },
    { id: 'habit-5', text: 'Exercise or walk 10,000 steps', category: 'HEALTH', checked: false }
];

let milestones = [];
let habits = [];
let streak = 0;
let streakClaimedDate = '';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadState();
    renderChecklists();
    renderHabits();
    initMilestoneForm();
    initHabitsReset();
    initStickerWiggles();
    initContactForm();
    initPlaylist();
});

/* ==========================================================================
   1. SECTION SWITCHING (TABS)
   ========================================================================== */
function initNavigation() {
    const navTags = document.querySelectorAll('.nav-tag');
    const sections = document.querySelectorAll('.scrapbook-section');

    navTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = tag.getAttribute('data-target');

            // Toggle active classes on nav button tags
            navTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');

            // Switch section displays
            sections.forEach(section => {
                if (section.id === targetId) {
                    section.classList.add('active');
                    // Smooth scroll to top of section on switch
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });

    // Handle hash urls on load
    const hash = window.location.hash;
    if (hash) {
        const idWithoutHash = hash.substring(1);
        const matchTag = document.querySelector(`[data-target="${idWithoutHash}"]`);
        if (matchTag) {
            matchTag.click();
        }
    }
}

/* ==========================================================================
   2. STATE CONTROLLER (LOCALSTORAGE)
   ========================================================================== */
function loadState() {
    // Milestones state
    const savedMilestones = localStorage.getItem('henry_milestones');
    if (savedMilestones) {
        milestones = JSON.parse(savedMilestones);
    } else {
        milestones = JSON.parse(JSON.stringify(DEFAULT_MILESTONES));
        saveMilestones();
    }

    // Habits state
    const savedHabits = localStorage.getItem('henry_habits');
    if (savedHabits) {
        habits = JSON.parse(savedHabits);
    } else {
        habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
        saveHabits();
    }

    // Streak state
    const savedStreak = localStorage.getItem('henry_habit_streak');
    streak = savedStreak ? parseInt(savedStreak, 10) : 0;
    
    const savedStreakDate = localStorage.getItem('henry_streak_date');
    streakClaimedDate = savedStreakDate || '';

    updateStreakDisplay();
}

function saveMilestones() {
    localStorage.setItem('henry_milestones', JSON.stringify(milestones));
}

function saveHabits() {
    localStorage.setItem('henry_habits', JSON.stringify(habits));
}

/* ==========================================================================
   3. CHECKLIST RENDERING & DYNAMIC BINDINGS
   ========================================================================== */
function renderChecklists() {
    // Categories on main dashboard
    const categories = ['family', 'studies', 'adventures'];
    
    categories.forEach(cat => {
        const wrapper = document.querySelector(`.checklist-items-wrapper[data-category="${cat}"]`);
        if (!wrapper) return;
        
        wrapper.innerHTML = '';
        const items = milestones.filter(m => m.category === cat);
        
        items.forEach(item => {
            wrapper.appendChild(createCheckItemNode(item));
        });
    });

    // Render family list inside screen 2 journey page
    const journeyContainer = document.getElementById('journey-checklist-container');
    if (journeyContainer) {
        journeyContainer.innerHTML = '';
        const familyItems = milestones.filter(m => m.category === 'family');
        familyItems.forEach(item => {
            journeyContainer.appendChild(createCheckItemNode(item));
        });
    }

    updateGlobalProgress();
}

function createCheckItemNode(item) {
    const label = document.createElement('label');
    label.className = 'checklist-item';
    label.setAttribute('data-id', item.id);

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = item.checked;
    
    input.addEventListener('change', (e) => {
        handleMilestoneToggle(item.id, e.target.checked);
    });

    const checkIndicator = document.createElement('span');
    checkIndicator.className = 'check-indicator';

    const textSpan = document.createElement('span');
    textSpan.className = 'checklist-text';
    textSpan.textContent = item.text;

    label.appendChild(input);
    label.appendChild(checkIndicator);
    label.appendChild(textSpan);

    return label;
}

function handleMilestoneToggle(id, isChecked) {
    // Update data state
    milestones = milestones.map(m => {
        if (m.id === id) {
            return { ...m, checked: isChecked };
        }
        return m;
    });
    
    saveMilestones();

    // Sync all corresponding DOM inputs (handles duplicates across screens)
    const inputs = document.querySelectorAll(`.checklist-item[data-id="${id}"] input`);
    inputs.forEach(input => {
        input.checked = isChecked;
    });

    updateGlobalProgress();
    
    // Slight wiggle haptic animation on toggle
    const itemNode = document.querySelector(`.checklist-item[data-id="${id}"]`);
    if (itemNode) {
        itemNode.style.transform = 'scale(1.08) rotate(2deg)';
        setTimeout(() => {
            itemNode.style.transform = '';
        }, 200);
    }
}

function updateGlobalProgress() {
    const total = milestones.length;
    const completed = milestones.filter(m => m.checked).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    const percentText = document.getElementById('global-percent');
    const completedText = document.getElementById('global-completed-count');
    const totalText = document.getElementById('global-total-count');
    const progressBar = document.getElementById('global-progress-bar');

    if (percentText) percentText.textContent = `${percent}%`;
    if (completedText) completedText.textContent = completed;
    if (totalText) totalText.textContent = total;
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
    }
}

/* ==========================================================================
   4. PIN A MILESTONE FORM CONTROLLER
   ========================================================================== */
function initMilestoneForm() {
    const form = document.getElementById('add-milestone-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const textInput = document.getElementById('milestone-text');
        const catSelect = document.getElementById('milestone-category');
        
        if (!textInput || !catSelect) return;

        const text = textInput.value.trim();
        const category = catSelect.value;

        if (text === '') return;

        const newMilestone = {
            id: 'custom-' + Date.now(),
            text: text,
            category: category,
            checked: false
        };

        // Add to milestones
        milestones.push(newMilestone);
        saveMilestones();
        
        // Re-render
        renderChecklists();
        
        // Reset form
        textInput.value = '';
        
        // Re-init hover wiggles for new items
        initStickerWiggles();

        // Flash message animation on success
        const submitBtn = form.querySelector('.sticky-submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'PINNED! 📌';
        submitBtn.style.backgroundColor = '#2f80ed';
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.style.backgroundColor = '';
        }, 1200);
    });
}

/* ==========================================================================
   5. DAILY HABITS LOGIC & STREAK MANAGEMENT
   ========================================================================== */
function renderHabits() {
    const container = document.getElementById('habit-checklist-container');
    if (!container) return;

    container.innerHTML = '';
    habits.forEach(habit => {
        container.appendChild(createHabitNode(habit));
    });
}

function createHabitNode(habit) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'habit-item';
    itemDiv.setAttribute('data-id', habit.id);

    const leftBox = document.createElement('div');
    leftBox.className = 'habit-left';

    const label = document.createElement('label');
    label.className = 'checklist-item';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = habit.checked;
    
    input.addEventListener('change', (e) => {
        handleHabitToggle(habit.id, e.target.checked);
    });

    const checkIndicator = document.createElement('span');
    checkIndicator.className = 'check-indicator';

    const textSpan = document.createElement('span');
    textSpan.className = 'checklist-text habit-desc';
    textSpan.textContent = habit.text;

    label.appendChild(input);
    label.appendChild(checkIndicator);
    label.appendChild(textSpan);
    leftBox.appendChild(label);

    const tagSpan = document.createElement('span');
    tagSpan.className = 'habit-tag';
    tagSpan.textContent = habit.category;

    itemDiv.appendChild(leftBox);
    itemDiv.appendChild(tagSpan);

    return itemDiv;
}

function handleHabitToggle(id, isChecked) {
    habits = habits.map(h => {
        if (h.id === id) {
            return { ...h, checked: isChecked };
        }
        return h;
    });

    saveHabits();
    checkStreakMilestone();
}

function checkStreakMilestone() {
    const allCompleted = habits.every(h => h.checked);
    
    if (allCompleted) {
        // Check if streak was already claimed today
        const todayStr = new Date().toDateString();
        if (streakClaimedDate !== todayStr) {
            streak++;
            streakClaimedDate = todayStr;
            
            localStorage.setItem('henry_habit_streak', streak.toString());
            localStorage.setItem('henry_streak_date', streakClaimedDate);
            
            updateStreakDisplay();
            
            // Wiggle streak box
            const polaroid = document.querySelector('.streak-polaroid');
            if (polaroid) {
                polaroid.style.transform = 'scale(1.1) rotate(5deg)';
                setTimeout(() => {
                    polaroid.style.transform = '';
                }, 400);
            }
            
            alert('🔥 BOOM! Daily Habits Complete! Streak increased to ' + streak + ' days!');
        }
    }
}

function updateStreakDisplay() {
    const countDisplay = document.getElementById('habit-streak-count');
    if (countDisplay) {
        countDisplay.textContent = streak;
    }
}

function initHabitsReset() {
    const btn = document.getElementById('reset-habits-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all daily habits for today?')) {
            habits = habits.map(h => ({ ...h, checked: false }));
            saveHabits();
            renderHabits();
            
            // Animate reset button
            btn.textContent = 'LOG RESET!';
            setTimeout(() => {
                btn.textContent = "RESET TODAY'S LOG ↺";
            }, 1500);
        }
    });
}

/* ==========================================================================
   6. STICKER HOVER WIGGLE EFFECTS
   ========================================================================== */
function initStickerWiggles() {
    // Collect all elements styled as stickers, polaroids, checklist items, and stamps
    const wiggleElements = document.querySelectorAll(
        '.polaroid-frame, .grid-card, .taped-label-red, .taped-label-teal, .nav-tag, .hire-tag, .want-some-sticker, .stamp-link-item, .checklist-item'
    );

    wiggleElements.forEach(el => {
        // Remove duplicate event listeners by cloning or checking status
        if (el.getAttribute('data-wiggle-bound')) return;
        el.setAttribute('data-wiggle-bound', 'true');

        el.addEventListener('mouseenter', () => {
            // Random tiny rotation degree between -4 and +4
            const randomRotation = (Math.random() * 8 - 4).toFixed(1);
            // Random tiny scale between 1.02 and 1.05
            const randomScale = (Math.random() * 0.03 + 1.02).toFixed(2);
            
            el.style.transform = `scale(${randomScale}) rotate(${randomRotation}deg)`;
            el.style.boxShadow = '8px 8px 0px #0a0a0a';
            el.style.zIndex = '50';
        });

        el.addEventListener('mouseleave', () => {
            // Restore original styles
            el.style.transform = '';
            el.style.boxShadow = '';
            el.style.zIndex = '';
        });
    });
}

/* ==========================================================================
   7. COMMISSION FORM SUBMISSION
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('scraps-contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('client-name').value;
        const email = document.getElementById('client-email').value;
        const brief = document.getElementById('client-brief').value;

        // Perform mock scrapbook handshake log
        const alertMsg = `
📦 MANIFEST RECEIVED // COLLAB_HANDSHAKE
-------------------------------------------
Client: ${name.toUpperCase()}
Email: ${email.toUpperCase()}
Brief: "${brief.substring(0, 50)}..."

Status: [SAVING_TO_SCRAPBOOK...]
Action: Handshake verified. Sending data...
        `;

        alert(alertMsg);

        // Submit to FormSubmit AJAX endpoint
        fetch("https://formsubmit.co/ajax/henryle185@gmail.com", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: brief,
                _subject: "New Commission Request from " + name
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            alert("✓ Collab request successfully sent to Henry's inbox!");
            form.reset();
        })
        .catch(error => {
            console.error(error);
            alert("❌ There was an error submitting the form. Please check your internet connection.");
        });
    });
}

/* ==========================================================================
   8. MIXTAPE PLAYLIST CONTROLLER
   ========================================================================== */
function initPlaylist() {
    const trackItems = document.querySelectorAll('.track-item');
    const stickerTitle = document.querySelector('.tape-sticker-title');
    const stickerArtist = document.querySelector('.tape-sticker-artist');
    const spindles = document.querySelectorAll('.tape-spindle');
    const indicator = document.querySelector('.tape-playing-indicator');
    
    trackItems.forEach(item => {
        item.addEventListener('click', () => {
            const isAlreadyActive = item.classList.contains('active-track');
            
            // Reset active track class on all items
            trackItems.forEach(t => {
                t.classList.remove('active-track');
                const playIcon = t.querySelector('.track-play-icon');
                if (playIcon) playIcon.textContent = '▶';
            });
            
            if (isAlreadyActive) {
                // Pause tape spindles
                spindles.forEach(s => s.classList.remove('spinning'));
                if (indicator) indicator.classList.remove('blinking');
                if (stickerTitle) stickerTitle.textContent = "HENRY'S MIXTAPE // VOL. 1";
                if (stickerArtist) stickerArtist.textContent = "SELECT A TRACK TO PLAY";
            } else {
                item.classList.add('active-track');
                const playIcon = item.querySelector('.track-play-icon');
                if (playIcon) playIcon.textContent = '⏸';
                
                const songName = item.getAttribute('data-song');
                const artistName = item.getAttribute('data-artist');
                const spotifyUrl = item.getAttribute('data-spotify');
                
                // Update tape text
                if (stickerTitle) stickerTitle.textContent = songName;
                if (stickerArtist) stickerArtist.textContent = artistName + " // SPOTIFY ↗";
                
                // Spin tape spindles & start playing blinker
                spindles.forEach(s => s.classList.add('spinning'));
                if (indicator) indicator.classList.add('blinking');
                
                // Open Spotify link in a new tab
                if (spotifyUrl) {
                    window.open(spotifyUrl, '_blank');
                }
            }
        });
    });
}

