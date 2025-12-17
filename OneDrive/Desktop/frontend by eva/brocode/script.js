function generatePassword(length,includeLowercase,includeUppercase,includeNumbers,includeSymbols){
    const lowercaseChars='abscdefghijklmnopqrstuvwxyz';
    const UppercaseChars='ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    const numberChars='0123456789'
    const SymbolChars='!@#$%^&*()_+-=';
    let allowChars='';
    let password='';
    allowChars+=includeLowercase?lowercaseChars:"";
    allowChars+=includeUppercase?UppercaseChars:"";
    allowChars+=includeNumbers?numberChars:"";
    allowChars+=includeSymbols?SymbolChars:"";
    if (length<=0){
        return `(password lengthmust altleast 1)`;

    }
    if(allowChars.length===0){
        return '(At least 1 set of character must be selected)';

    }
    for (let i=0;i<length;i++){
        const randomIndex=Math.floor(Math.random()*allowChars.length);
        password+=allowChars[randomIndex]
    }
    //console.log( allowChars);

    return password;

}
const passwordLength=10;
const includeLowercase=true;
const includeUppercase=true;
const includeNumbers=true;
const includeSymbols=true;
const password=generatePassword(passwordLength,includeLowercase,includeUppercase,includeSymbols,includeNumbers);
console.log(`Generate password:${password}`);

