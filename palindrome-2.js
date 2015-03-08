console.log(isPalindrome('Казак'));
console.log(isPalindrome('А роза упала на лапу Азора'));
console.log(isPalindrome('Do geese see God?'));
console.log(isPalindrome('Бряк'));

function isPalindrome(s) {
    var reg = /[a-zа-яё+]/g;
    var strArr = s.toLowerCase().match(reg),
        arrLen = strArr.length,
        comparisonSize = Math.floor(arrLen/2);

    for (var i = 0; i < comparisonSize; i++){
        if (strArr[i] !== strArr[arrLen - 1 - i]){
            return false;
        }
    }

    return true;
}
