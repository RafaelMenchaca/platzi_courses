(()=> {

    // let myNumber: number = undefined;
    // let myString: string = null;

    let myNull: null = null;
    let myUndefined: undefined = undefined;

    // myNull = 12;

    let myNumber: number | null = null; //
    myNumber = 12;
    
    let myString: string | undefined = undefined;
    myString = "Rafael";
    myString = undefined;

    function hi(name: string | null){
        let hello: string = "Hola ";

        if (name) {
            hello += name;

        } else {
            hello += "nobody";
        }
        console.log(hello)
    }

    function hiV2(name: string | null){
        let hello: string = "Hola ";

        hello += name?.toLocaleLowerCase() || "nobody";
        console.log(hello)
    }

    hi("Rafael");
    hi(null);
    hiV2(null)
    hiV2("Rafa")
    

})();