let currentStep = 1;
const totalSteps = 10;

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    showStep(currentStep);
    
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
});

function showStep(step) {
    // Hide all steps
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(s => s.classList.remove('active'));
    
    // Show current step
    const currentStepElement = document.querySelector(`[data-step="${step}"].form-step`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    // Update progress bar
    updateProgressBar(step);
    
    // Update navigation buttons
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
    
    // Show/hide previous button
    if (step === 1) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }
    
    // Change next button text on last step
    if (step === totalSteps) {
        nextBtn.textContent = 'Submit';
    } else {
        nextBtn.textContent = 'Next';
    }
}

function changeStep(direction) {
    // Validate current step before moving forward
    if (direction === 1 && !validateCurrentStep()) {
        return;
    }
    
    const newStep = currentStep + direction;
    const biologicalSex = document.getElementById('biologicalSex')?.value;
    
    // Skip female section (Step 6) if Male selected
    if (newStep === 6 && biologicalSex === 'Male' && direction === 1) {
        // Skip to step 7
        currentStep = 7;
    } else if (currentStep === 7 && biologicalSex === 'Male' && direction === -1) {
        // Coming back from step 7, go to step 5
        currentStep = 5;
    } else if (newStep >= 1 && newStep <= totalSteps) {
        currentStep = newStep;
    }
    
    // If on last step and clicking next, submit form
    if (currentStep === totalSteps && direction === 1) {
        submitForm();
        return;
    }
    
    showStep(currentStep);
}

function validateCurrentStep() {
    const currentStepElement = document.querySelector(`[data-step="${currentStep}"].form-step`);
    const inputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
    
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            input.style.borderColor = '#d1d5db';
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields before continuing.');
    }
    
    return isValid;
}

function submitForm() {
    if (!validateCurrentStep()) {
        return;
    }
    
    // Collect all form data
    const formData = new FormData(document.getElementById('auditForm'));
    
    // Here you'll add Google Sheets integration
    console.log('Form submitted!');
    console.log('Form data:', Object.fromEntries(formData));
    
    alert('Form submitted successfully! (Google Sheets integration coming next)');
}
