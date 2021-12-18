import valid from "card-validator";

export function validateInputs(name: string, number: string, date: string, cvv: string) {
  const numberValidation = valid.number(parseInt(number.replace(/ /g,''))).isValid;
  const nameValidation = typeof name === "string" ? true : false;
  const expValidation = valid.expirationDate(date).isValid;
  const cvvValidation = valid.cvv(cvv).isValid;
    console.log(valid.number(parseInt(number.replace(/ /g,''))));
    
  if (numberValidation && nameValidation && expValidation && cvvValidation) {
    return true;
  } else {
    return false;
  }
}


// sanitizes card input
function cleanInput(value: string) {
  return value.replace(/\D+/g, "");
}

export function formatCreditCard(value: string) {
  const cleanValue = cleanInput(value);
  const firstNumber = cleanValue.charAt(0);
  let currentValue;

  switch (firstNumber) {
    case "3":
      currentValue = `${cleanValue.slice(0, 4)} ${cleanValue.slice(
        4,
        10
      )} ${cleanValue.slice(10, 15)}`;
      break;
    default:
      currentValue = `${cleanValue.slice(0, 4)} ${cleanValue.slice(
        4,
        8
      )} ${cleanValue.slice(8, 12)} ${cleanValue.slice(12, 16)}`;
      break;
  }
  return currentValue.trim();
}

// formats mm/yy date
export function dateCheck(text: string) {
  let cleanText = text.replace(/\D/g, "").replace(/\W/gi, "");
  let all = cleanText.split("");
  if (all.length <= 2) {
    let joined = all.join("");
    return joined;
  } else {
    all.splice(2, 0, "/");
    let sliced = all.length > 5 ? all.slice(0, 5) : all;
    let formatted = sliced.join("");
    return formatted;
  }
}

// formats CVV
export function cvvCheck(text: string) {
  let cleanText = text.replace(/\D/g, "").replace(/\W/gi, "");
  let all = cleanText.split("");
  let sliced = all.length > 4 ? all.slice(0, 4) : all;
  let formatted = sliced.join("");

  return formatted;
}
