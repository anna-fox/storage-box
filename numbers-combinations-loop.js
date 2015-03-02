var getArraySum  = function(indexArr, valuesArr) {
    var sum = 0;
    for(var i = 0; i < indexArr.length; i++){
        sum += valuesArr[indexArr[i]];
    }
    return sum;
};

var addToCombinations = function(indexArr, valuesArr, combinations) {
    var subArr = indexArr.map(function(i){
        return valuesArr[i];
    });
    combinations.push(subArr);
    return combinations;
};

var getSortedArray = function(arr){
    return arr.sort(function(a, b){
        return a - b;
    });
};

var increaseLastIndex = function (indexArr, valuesLen){
    indexArr[indexArr.length - 1]++;

    if (indexArr[indexArr.length - 1] >= valuesLen){
        indexArr.pop();
        indexArr[indexArr.length - 1]++;
    }

    return indexArr;
};

function getCombinations(valuesArr, sumValue) {
    valuesArr = getSortedArray(valuesArr);
    var valuesLen = valuesArr.length,
        indexArr = [0],
        combinations = [],
        arrSum = getArraySum(indexArr, valuesArr),
        currentValueIndex,
        currentValue,
        prevValue = null;

    do {
        currentValueIndex = indexArr[indexArr.length - 1];
        currentValue = valuesArr[currentValueIndex];

        if (arrSum === sumValue) {
            combinations = addToCombinations(indexArr, valuesArr, combinations);
        }
        if ((currentValueIndex + 1 < valuesLen) && (arrSum <= sumValue)) {
            indexArr.push(currentValueIndex + 1);
            arrSum += valuesArr[currentValueIndex + 1];
        } else {
            arrSum -= valuesArr[currentValueIndex];
            indexArr.pop();
            if (indexArr.length) {
                indexArr[indexArr.length - 1]++;
                currentValueIndex = indexArr[indexArr.length - 1];
                arrSum += valuesArr[currentValueIndex];
                arrSum -= valuesArr[currentValueIndex - 1];

                if (valuesArr[currentValueIndex] === valuesArr[currentValueIndex - 1]){
                    prevValue = currentValue = valuesArr[currentValueIndex - 1];
                    do {
                        indexArr = increaseLastIndex(indexArr, valuesLen);
                        currentValueIndex = indexArr[indexArr.length - 1];
                        currentValue = valuesArr[currentValueIndex]

                    } while(prevValue === currentValue);
                    arrSum = getArraySum(indexArr, valuesArr);
                }
            }
        }
    } while (indexArr.length);

    return combinations;
};
