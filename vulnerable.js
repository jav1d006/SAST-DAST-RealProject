// vulnerable.js
// Snyk Code üçün zəiflik nümunəsi

function insecureEval(userInput) {
    // XƏBƏRDARLIQ: eval təhlükəli → SAST tapacaq
    return eval(userInput);
}

// Nümunə istifadə
let userData = "2 + 2";
console.log(insecureEval(userData));
