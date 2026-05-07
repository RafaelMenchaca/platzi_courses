(()=>{

    // alias type
    type UserID = string | number;
    // let userId: string | number | boolean;
    let userId: UserID;


    // literal types
    type Sizes = "S" | "M" | "L" | "XL";
    let shirtSize: Sizes;
    shirtSize = "S";
    shirtSize = "M";
    shirtSize = "L";
    shirtSize = "XL";
    // esto da error
    // shirtSize = "sadasfdsfsa";

    function greeting(userId: UserID, size: Sizes) {
    
        if (typeof userId === "string") {

            console.log(`string ${userId.toLocaleUpperCase()}`);
        }
    }

    greeting(1111, "L");
    greeting("Rafae123", "M");

})();