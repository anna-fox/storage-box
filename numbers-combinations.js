var getFilteredValues = function(arr, topLimit) {
    return arr.filter(function(i) {
        return i <= topLimit;
    });
};

var getSortedArray = function(arr){
   return arr.sort(function(a, b){
       return a - b;
   });
};

var getCombinations = function(arr, sumValue) {
    if (arr.length === 0 ){
        return [];
    }

    arr = getSortedArray(arr);
    if (arr[0]>=0){
        arr = getFilteredValues(arr, sumValue);
    }

    var getCombinationsInner = function(arr, sumValue, i) {
        var combinations = [],
            temp = [],
            current,
            prevValue = null,
            i = i || 0;


        for ( ; i < arr.length; i++){
            current = arr[i];

            if (prevValue === current){
                continue;
            }

            if (current === sumValue){
                combinations.push([current]);
            } else {
                temp = getCombinationsInner(arr, sumValue - current, i + 1);
                if (temp.length > 0){
                    for (var j = 0; j < temp.length; j++){
                        combinations.push([].concat(current, temp[j]));
                    }
                }
            }
            prevValue = current;
        }

        return combinations;
    };

    return getCombinationsInner(arr, sumValue)
};
