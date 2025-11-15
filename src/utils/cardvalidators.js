// Card number validation
export function isValidCardNumber(number) {
    const sanitized = number.replace(/\D/g, "");
    let sum = 0;
    let shouldDouble = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
        let digit = parseInt(sanitized.charAt(i));

        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

// Check if card expired
export function isExpired(expDate) {
    // Expect MM/YY format
    if (!/^\d{2}\/\d{2}$/.test(expDate)) return true;
    const [month, year] = expDate.split("/").map(Number);
    const fullYear = 2000 + year; // e.g., "25" -> 2025
    const now = new Date();
    const expiry = new Date(fullYear, month); // first day of next month
    return expiry <= now;
}