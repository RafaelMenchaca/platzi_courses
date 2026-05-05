(()=> {

    let prices = [1, 2, 2, 2, 1, 1, 212, "hola", true];
    console.log(prices)
    prices.push(19)
    console.log(prices)
    prices.push("123")
    console.log(prices)
    

    let products = ["hola", true]
    products.push(false)

    let mixed: (number | string | boolean | Object)[] = ["hola", true];
    mixed.push(12);
    mixed.push("123");
    mixed.push({});
    mixed.push([]);

    let numbers = [1, 2, 2, 2, 1, 1, 212];
    numbers.map(item => item * 2);
    console.log("numbers", numbers.map(item => item * 2))

})();