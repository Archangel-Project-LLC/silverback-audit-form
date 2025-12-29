let currentStep = 1;
const totalSteps = 10;
const DEV_MODE = true; // Set to false for production

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
    
    // Conditional field logic - Average steps
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
                    averageStepsField.style.borderColor = '#d1d5db';
                    averageStepsField.style.boxShadow = 'none';
                }
            });
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
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
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
    
    // Calculate new step
    let newStep = currentStep + direction;
    const biologicalSex = document.getElementById('biologicalSex')?.value;
    
    // Handle step transitions
    if (direction === 1) {
        // Moving forward
        if (newStep === 6 && biologicalSex === 'Male') {
            newStep = 7; // Skip female section
        }
        
        // If we're on last step and clicking next, submit
        if (currentStep === totalSteps) {
            submitForm();
            return;
        }
    } else {
        // Moving backward
        if (newStep === 6 && biologicalSex === 'Male') {
            newStep = 5; // Skip female section going back
        }
    }
    
    // Ensure step is in valid range
    if (newStep >= 1 && newStep <= totalSteps) {
        currentStep = newStep;
        showStep(currentStep);
    }
}

function validateCurrentStep() {
    // Skip validation in dev mode
    if (DEV_MODE) {
        return true;
    }
    
    const currentStepElement = document.querySelector(`[data-step="${currentStep}"].form-step`);
    if (!currentStepElement) {
        console.error('Current step element not found');
        return false;
    }
    
    const inputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
    
    let isValid = true;
    let firstInvalidField = null;
    
    inputs.forEach(input => {
        // Skip validation for conditional fields
        const fieldId = input.id;
        
        // Skip average steps if pedometer is No
        if (fieldId === 'averageSteps') {
            const pedometer = document.querySelector('input[name="usePedometer"]:checked');
            if (pedometer && pedometer.value === 'No') {
                input.style.borderColor = '#d1d5db';
                input.style.boxShadow = 'none';
                return;
            }
        }
        
        // Check if field is actually visible
        if (input.offsetParent === null) {
            // Field is hidden, skip validation
            return;
        }
        
        // Validate based on input type
        let fieldIsValid = false;
        
        if (input.type === 'radio') {
            const name = input.name;
            const checked = currentStepElement.querySelector(`input[name="${name}"]:checked`);
            fieldIsValid = checked !== null;
            
            // Highlight radio group label if invalid
            if (!fieldIsValid) {
                const radioGroup = input.closest('.form-group');
                if (radioGroup) {
                    radioGroup.style.backgroundColor = '#fef2f2';
                    radioGroup.style.padding = '12px';
                    radioGroup.style.borderRadius = '6px';
                }
            } else {
                const radioGroup = input.closest('.form-group');
                if (radioGroup) {
                    radioGroup.style.backgroundColor = '';
                    radioGroup.style.padding = '';
                }
            }
        } else if (input.type === 'checkbox') {
            // For checkbox groups, at least one should be checked
            const name = input.name;
            const checked = currentStepElement.querySelector(`input[name="${name}"]:checked`);
            fieldIsValid = checked !== null;
        } else {
            fieldIsValid = input.value.trim() !== '';
        }
        
        if (!fieldIsValid) {
            if (input.type !== 'radio' && input.type !== 'checkbox') {
                input.style.borderColor = '#ef4444';
                input.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            }
            isValid = false;
            if (!firstInvalidField) {
                firstInvalidField = input;
            }
        } else {
            if (input.type !== 'radio' && input.type !== 'checkbox') {
                input.style.borderColor = '#d1d5db';
                input.style.boxShadow = 'none';
            }
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields before continuing.');
        if (firstInvalidField) {
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                if (firstInvalidField.focus) {
                    firstInvalidField.focus();
                }
            }, 300);
        }
    }
    
    return isValid;
}

function submitForm() {
    if (!validateCurrentStep()) {
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('nextBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    // Collect all form data
    const form = document.getElementById('auditForm');
    const formData = new FormData(form);
    const data = {};
    
    // Get all form data first
    for (let [key, value] of formData.entries()) {
        // Skip empty values
        if (value && value.toString().trim() !== '') {
            data[key] = value;
        }
    }
    
    // Then manually add radio buttons (FormData sometimes misses them)
    const radioButtons = form.querySelectorAll('input[type="radio"]:checked');
    radioButtons.forEach(radio => {
        data[radio.name] = radio.value;
    });
    
    // And checkboxes
    const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        if (data[checkbox.name]) {
            data[checkbox.name] += ', ' + checkbox.value;
        } else {
            data[checkbox.name] = checkbox.value;
        }
    });
    
    // Convert data object to URL-encoded string
    const params = new URLSearchParams();
    for (let key in data) {
        params.append(key, data[key]);
    }
    
    // Send to Zapier using XMLHttpRequest with form encoding
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://hooks.zapier.com/hooks/catch/11053045/uwyqlbd/');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            alert('Form submitted successfully! We will be in touch soon.');
            form.reset();
            currentStep = 1;
            showStep(1);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        } else {
            alert('There was an error. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    };
    
    xhr.onerror = function() {
        alert('There was an error. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    };
    
    xhr.send(params.toString());
}
