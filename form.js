const form = document.querySelector("#contact-form")
const nameField = document.querySelector("#contact-name")
const emailField = document.querySelector("#contact-email")
const commentsField = document.querySelector("#contact-message")

const validatedFields = [nameField, emailField, commentsField]
const form_errors = [];

const errorArea = document.querySelector("#form-error-area")

const errorItems = new Map([
    [nameField, document.querySelector("#name-error")],
    [emailField, document.querySelector("#email-error")],
    [commentsField, document.querySelector("#message-error")]
]);

const infoArea = document.querySelector("#form-info-area");
const characterCount = document.querySelector("#character-count");
const historyField = document.querySelector("#form-errors");

const fieldNames = new Map([
    [nameField, "Full Name"],
    [emailField, "Email Address"],
    [commentsField, "Comments"]
]);

const visibleErrors = new Set();
const editedFields = new Set();
let isSubmissionAttempt = false;
let recordedThisAttempt = new Set();

form.noValidate = true;
infoArea.hidden = false;
updateCharacterCount();

function updateCharacterCount() {
    const maxLength = Number(commentsField.maxLength);
    const remaining = Math.max(0, maxLength - commentsField.value.length);
    const warningThreshold = 100;

    characterCount.classList.remove("count-warning", "count-limit");

    if (remaining === 0) {
        characterCount.textContent = `Character limit reached (${maxLength} of ${maxLength}).`;
        characterCount.classList.add("count-limit");
    } else if (remaining <= warningThreshold) {
        characterCount.textContent = `${remaining} characters remaining. You are nearing the ${maxLength}-character limit.`;
        characterCount.classList.add("count-warning");
    } else {
        characterCount.textContent = `${remaining} characters remaining (${maxLength}-character limit).`;
    }
}


function getValidationMessage(field) {
    const validity = field.validity;

    if (validity.valueMissing) {
        return `${fieldNames.get(field)} is required`;
    }

    if (validity.typeMismatch && field === emailField) {
        return "Email must be a valid email address, ex: name@example.com";
    }

    if (validity.tooShort) {
        return `${fieldNames.get(field)} must be at least ${field.minLength} characters`;
    }

    if (validity.tooLong) {
        return `${fieldNames.get(field)} must be no longer than ${field.maxLength} characters`;
    }

    return "Invalid value";
}

function refreshValidity(field) {
    field.setCustomValidity("");

    const validity = field.validity;
    if (validity.valueMissing || validity.typeMismatch || validity.tooShort || validity.tooLong) {
        field.setCustomValidity(getValidationMessage(field));
    }

    return field.validity.valid;
}

function showFieldError(field) {
    const errorItem = errorItems.get(field);
    errorItem.textContent = field.validationMessage;
    errorItem.hidden = false;
    errorArea.hidden = false;
    visibleErrors.add(field);
}

function clearFieldError(field) {
    const errorItem = errorItems.get(field);

    errorItem.textContent = "";
    errorItem.hidden = true;
    visibleErrors.delete(field);

    if ([...errorItems.values()].every((item) => item.hidden)) {
        errorArea.hidden = true;
    }
}


for (const field of validatedFields) {
    field.addEventListener("input", () => {
        editedFields.add(field);
        const isValid = refreshValidity(field);

        if (visibleErrors.has(field)) {
            if (isValid) {
                clearFieldError(field);
            } else {
                showFieldError(field);
            }
        }
    });

    field.addEventListener("blur", () => {
        if (!editedFields.has(field) && !visibleErrors.has(field)) return;

        const isValid = refreshValidity(field);
        if (isValid) {
            clearFieldError(field);
        } else {
            showFieldError(field);
        }
    });
}

commentsField.addEventListener("input", updateCharacterCount);

form.addEventListener("invalid", (event) => {
    const field = event.target;
    if (!errorItems.has(field)) return;

    showFieldError(field);

    if (isSubmissionAttempt && !recordedThisAttempt.has(field)) {
        form_errors.push({
            field: fieldNames.get(field),
            error: field.validationMessage
        });
        recordedThisAttempt.add(field);
    }
}, true);

form.addEventListener("submit", (event) => {
    event.preventDefault();

    isSubmissionAttempt = true;
    recordedThisAttempt = new Set();
    for (const field of validatedFields) {
        refreshValidity(field);
    }

    const isValid = form.reportValidity();
    isSubmissionAttempt = false;

    if (!isValid) return;

    historyField.value = JSON.stringify(form_errors);
    form.submit();
});