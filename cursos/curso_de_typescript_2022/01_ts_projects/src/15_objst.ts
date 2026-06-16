(()=> {
    
    type Sizes = "S" | "M" | "L" | "XL";

    type Product = {
        title: string,
        createdAt: Date,
        stock: number,
        size?: Sizes
    };

    const products: Product[] = [];

    const addProduct = (data: Product ) => {
        products.push(data)
    }

    addProduct({
        title: "pro0",
        createdAt: new Date(1997, 1, 1),
        stock: 12,
        size: "M"
    })

    addProduct({
        title: "pro1",
        createdAt: new Date(1993, 1, 1),
        stock: 12,
        size: "L"
    })

    console.log(products);
    // products.push(123);
    // products.push("asdf");
    products.push({
        title: "pro2",
        createdAt: new Date(1994, 1, 1),
        stock: 20,
        size: "XL"
    });

    console.log(products);

})();