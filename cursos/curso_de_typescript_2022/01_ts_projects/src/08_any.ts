(()=>{

    let myDynamicVar: any;
    myDynamicVar = 100;
    myDynamicVar = null;
    myDynamicVar = {};
    myDynamicVar = "";

    // se aconseja que el any no sea utilizado en una etapa madura del proyecto

    myDynamicVar = "Hola";
    const rta = (myDynamicVar as string).toLowerCase();
    console.log(rta);

    myDynamicVar = 1234;
    const rta2 = (<number>myDynamicVar).toFixed();
    console.log(rta2);
    
})();