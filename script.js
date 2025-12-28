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
    
    // Collect all form data
    const formData = new FormData(document.getElementById('auditForm'));
    
    // Here you'll add Zapier webhook integration
    console.log('Form submitted!');
    console.log('Form data:', Object.fromEntries(formData));
    
    alert('Form submitted successfully! (Zapier integration coming next)');
}
