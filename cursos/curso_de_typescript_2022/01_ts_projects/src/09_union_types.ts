(() => {

    let myDynamicVar: string | number;
    myDynamicVar = 1234;
    myDynamicVar = "Hola";


    function greeting(myText: string | number) {
    
        if (typeof myText === "string") {

            console.log(`string ${myText.toLocaleUpperCase()}`);
        } else {

            console.log(`number ${myText.toFixed(1)}`);

        }
    }

    greeting("Rafael");
    greeting(1.12314123);
})();