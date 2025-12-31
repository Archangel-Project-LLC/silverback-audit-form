let currentStep = 1;
const totalSteps = 10;
const DEV_MODE = true;

document.addEventListener('DOMContentLoaded', function() {
    showStep(currentStep);
    
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
        if (newStep === 6 && biologicalSex === 'Male') {
            newStep = 7;
        }
        
        if (currentStep === totalSteps) {
            submitForm();
            return;
        }
    } else {
        if (newStep === 6 && biologicalSex === 'Male') {
            newStep = 5;
        }
    }
    
    if (newStep >= 1 && newStep <= totalSteps) {
        currentStep = newStep;
        showStep(currentStep);
    }
}

function validateCurrentStep() {
    return true;
}

function submitForm() {
    const submitBtn = document.getElementById('nextBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    const form = document.getElementById('auditForm');
    const data = {};
    
    // Get ALL inputs from the form
    const allInputs = form.querySelectorAll('input, select, textarea');
    
    allInputs.forEach(input => {
        const name = input.name;
        if (!name) return;
        
        if (input.type === 'radio') {
            if (input.checked) {
                data[name] = input.value;
            }
        } else if (input.type === 'checkbox') {
            if (input.checked) {
                if (data[name]) {
                    data[name] += ', ' + input.value;
                } else {
                    data[name] = input.value;
                }
            }
        } else if (input.type === 'file') {
            // Skip files
        } else if (input.value && input.value.trim() !== '') {
            data[name] = input.value;
        }
    });
    
    console.log('=== FORM DATA ===');
    console.log('Total fields:', Object.keys(data).length);
    console.log('All data:', data);
    
    // Create hidden iframe for form submission
    let iframe = document.getElementById('hidden-iframe');
    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'hidden-iframe';
        iframe.name = 'hidden-iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    
    // Create a hidden form
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
    
    document.body.appendChild(hiddenForm);
    hiddenForm.submit();
    
    // Clean up and show success
    setTimeout(() => {
        document.body.removeChild(hiddenForm);
        alert('Form submitted successfully!');
        form.reset();
        currentStep = 1;
        showStep(1);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 1000);
}
