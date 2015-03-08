isPalindrome('Казак'); // true
isPalindrome('А роза упала на лапу Азора'); // true
isPalindrome('Do geese see God?'); // true
isPalindrome('Бряк'); // false

function isPalindrome(s) {
    var reg = /[^a-zа-яё+]/g;
    var str = s.toLowerCase().replace(reg, ''),
        revertedStr = str.split('').reverse().join('');
    console.log(str === revertedStr);
    return str === revertedStr;
}
