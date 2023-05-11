const s0 = "[237, 71, 59]";
const regex = /\d+/g;  // regular expression to match one or more digits
const matches = s0.match(regex);  // get all matches of the regular expression in the string

// convert matches to numbers and create an array
const numbers = matches.map(match => Number(match));
console.log(numbers);
console.log(typeof(numbers));
console.log(numbers[0]);


var myString = "number"; 
eval(myString +" = 9"); 
console.log(number);

const arr = [
    { storeId: 71, name: '삼촌식당' },
    { storeId: 59, name: '군자네' },
    { storeId: 237, name: '진로집' }
  ];
  console.log(typeof(arr));
  console.log(arr.length);