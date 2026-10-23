let currentStep = 1;
const totalSteps = 10;
const DEV_MODE = false;

// --- Save-as-you-go -------------------------------------------------------
// Every answer and the current step are written to this browser's localStorage
// on each change, restored when the page is reopened, and cleared on submit.
const DRAFT_KEY = 'spc-audit-draft-v1';

function allFields() {
    return document.querySelectorAll(
        '#auditForm input, #auditForm select, #auditForm textarea, ' +
        '#femaleSection input, #femaleSection select, #femaleSection textarea'
    );
}

function saveDraft() {
    try {
        const data = {};
        allFields().forEach(input => {
            if (!input.name || input.type === 'file') return;
            if (input.type === 'radio') {
                if (input.checked) data[input.name] = input.value;
            } else if (input.type === 'checkbox') {
                if (!Array.isArray(data[input.name])) data[input.name] = [];
                if (input.checked) data[input.name].push(input.value);
            } else {
                data[input.name] = input.value;
            }
        });
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ step: currentStep, data: data, savedAt: Date.now() }));
    } catch (e) {
        // Private browsing or storage blocked: the form still works, it just won't resume.
    }
}

function restoreDraft() {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return false;
        const draft = JSON.parse(raw);
        const data = draft.data || {};
        let restored = 0;
        allFields().forEach(input => {
            if (!input.name || input.type === 'file' || !(input.name in data)) return;
            const value = data[input.name];
            if (input.type === 'radio') {
                input.checked = (input.value === value);
            } else if (input.type === 'checkbox') {
                input.checked = Array.isArray(value) && value.indexOf(input.value) !== -1;
            } else {
                input.value = value;
            }
            restored++;
        });
        // Re-apply the conditional sections to the restored answers
        const sexSelect = document.getElementById('biologicalSex');
        if (sexSelect) sexSelect.dispatchEvent(new Event('change'));
        document.querySelectorAll('input[name="usePedometer"]:checked')
            .forEach(radio => radio.dispatchEvent(new Event('change')));
        if (draft.step >= 1 && draft.step <= totalSteps) currentStep = draft.step;
        return restored > 0;
    } catch (e) {
        return false;
    }
}

function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
}

function showResumeNotice() {
    const form = document.getElementById('auditForm');
    if (!form || document.getElementById('resumeNotice')) return;
    const notice = document.createElement('div');
    notice.id = 'resumeNotice';
    notice.setAttribute('role', 'status');
    notice.style.cssText = 'margin:0 0 16px;padding:10px 14px;border-radius:6px;background:rgba(0,0,0,0.06);font-size:14px;line-height:1.4;';
    notice.textContent = 'Welcome back. Your previous answers have been restored and you can carry on from where you left off.';
    form.insertAdjacentElement('afterbegin', notice);
}
// -------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    // Female section toggle
    const biologicalSexSelect = document.getElementById('biologicalSex');
    const femaleSection = document.getElementById('femaleSection');
    
    if (biologicalSexSelect && femaleSection) {
        biologicalSexSelect.addEventListener('change', function() {
            if (this.value === 'Female') {
                femaleSection.style.display = 'block';
            } else {
                femaleSection.style.display = 'none';
            }
        });
    }
    
    // Pedometer conditional field
    const pedometerRadios = document.querySelectorAll('input[name="usePedometer"]');
    const averageStepsField = document.getElementById('averageSteps');
    
    if (pedometerRadios.length > 0 && averageStepsField) {
        pedometerRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'Yes') {
                    averageStepsField.required = true;
                } else {
                    averageStepsField.required = false;
                    averageStepsField.value = '';
                }
            });
        });
    }

    // Restore runs after the conditional handlers above are attached,
    // so a restored "Female" or "Yes" re-opens its section.
    const hadDraft = restoreDraft();
    showStep(currentStep);
    if (hadDraft) showResumeNotice();

    // Save on every answer, not just on Next
    document.addEventListener('input', saveDraft);
    document.addEventListener('change', saveDraft);
});

function showStep(step) {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(s => s.classList.remove('active'));
    
    const currentStepElement = document.querySelector(`[data-step="${step}"].form-step`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateProgressBar(step);
    updateButtons(step);
}

function updateProgressBar(step) {
    const progressSteps = document.querySelectorAll('.progress-step');
    
    progressSteps.forEach((progressStep, index) => {
        const stepNumber = index + 1;
        
        if (stepNumber < step) {
            progressStep.classList.add('completed');
            progressStep.classList.remove('active');
        } else if (stepNumber === step) {
            progressStep.classList.add('active');
            progressStep.classList.remove('completed');
        } else {
            progressStep.classList.remove('active', 'completed');
        }
    });
}

function updateButtons(step) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (step === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }
    
    if (step === totalSteps) {
        nextBtn.textContent = 'Submit';
    } else {
        nextBtn.textContent = 'Next';
    }
}

function changeStep(direction) {
    if (direction === 1 && !DEV_MODE && !validateCurrentStep()) {
        return;
    }
    
    let newStep = currentStep + direction;
    const biologicalSex = document.getElementById('biologicalSex')?.value;
    
    if (direction === 1) {
        if (currentStep === totalSteps) {
            if (!DEV_MODE) {
                const gap = firstInvalidStep();
                if (gap && gap !== currentStep) {
                    currentStep = gap;
                    showStep(currentStep);
                    validateStep(currentStep); // re-run on the visible step so the message shows
                    return;
                }
            }
            submitForm();
            return;
        }
    }
    
    if (newStep >= 1 && newStep <= totalSteps) {
        currentStep = newStep;
        showStep(currentStep);
        saveDraft();
    }
}

function validateStep(step) {
    const stepEl = document.querySelector(`[data-step="${step}"].form-step`);
    if (!stepEl) return true;
    const femaleSection = document.getElementById('femaleSection');
    const fields = stepEl.querySelectorAll('input, select, textarea');
    for (const field of fields) {
        if (field.disabled || field.type === 'hidden') continue;
        // Skip the Ladies section while it is hidden
        if (femaleSection && femaleSection.contains(field) && femaleSection.style.display === 'none') continue;
        if (!field.checkValidity()) {
            if (typeof field.reportValidity === 'function') field.reportValidity();
            if (typeof field.scrollIntoView === 'function') field.scrollIntoView({ block: 'center', behavior: 'smooth' });
            return false;
        }
    }
    return true;
}

function validateCurrentStep() {
    return validateStep(currentStep);
}

// On submit, re-check every step so a restored draft can't skip a gap
function firstInvalidStep() {
    for (let step = 1; step <= totalSteps; step++) {
        if (!validateStep(step)) return step;
    }
    return 0;
}

function submitForm() {
    const submitBtn = document.getElementById('nextBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    const form = document.getElementById('auditForm');
    const data = {};
    
    // Get ALL inputs from the ENTIRE document (not just form)
    // This ensures we catch the female section which may be outside form-steps
    const allInputs = document.querySelectorAll('#auditForm input, #auditForm select, #auditForm textarea, #femaleSection input, #femaleSection select, #femaleSection textarea');
    
    console.log('=== COLLECTING FORM DATA ===');
    console.log('Total inputs found:', allInputs.length);
    
    allInputs.forEach(input => {
        const name = input.name;
        if (!name) return;
        
        if (input.type === 'radio') {
            if (input.checked) {
                data[name] = input.value;
                console.log('Radio:', name, '=', input.value);
            }
        } else if (input.type === 'checkbox') {
            if (input.checked) {
                if (data[name]) {
                    data[name] += ', ' + input.value;
                } else {
                    data[name] = input.value;
                }
                console.log('Checkbox:', name, '=', data[name]);
            }
        } else if (input.type === 'file') {
            // Skip file inputs
            console.log('Skipping file:', name);
        } else if (input.value && input.value.trim() !== '') {
            data[name] = input.value;
            console.log('Field:', name, '=', input.value.substring(0, 50));
        }
    });
    
    console.log('=== TOTAL FIELDS COLLECTED ===');
    console.log('Count:', Object.keys(data).length);
    console.log('Data:', data);
    
    // Create hidden iframe for form submission
    let iframe = document.getElementById('hidden-iframe');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'hidden-iframe';
        iframe.name = 'hidden-iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    
    // Create a hidden form with ALL collected data
    const hiddenForm = document.createElement('form');
    hiddenForm.method = 'POST';
    hiddenForm.action = 'https://hooks.zapier.com/hooks/catch/11053045/uwyqlbd/';
    hiddenForm.target = 'hidden-iframe';
    hiddenForm.style.display = 'none';
    
    // Add all data as hidden inputs
    for (let key in data) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = data[key];
        hiddenForm.appendChild(input);
    }
    
    console.log('=== SUBMITTING TO ZAPIER ===');
    console.log('Fields being sent:', Object.keys(data).length);
    
    document.body.appendChild(hiddenForm);
    hiddenForm.submit();
    
    // Clean up and show success
    setTimeout(() => {
        document.body.removeChild(hiddenForm);
        alert('Form submitted successfully!');
        clearDraft();
        const notice = document.getElementById('resumeNotice');
        if (notice) notice.remove();
        form.reset();
        currentStep = 1;
        showStep(1);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1500);
}
