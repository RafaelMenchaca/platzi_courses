(()=> {
    // const login = (email: string, password: string) => {
    //     console.log(email, password);

    // }

    // login("rafael@mail.com", "12313123")

    const login = (data: {email: string, password: number}) => {
        console.log(data.email, data.password);
    }
    login({
        email: "rafael@mail.com",
        password: 123123
    })

    type Sizes = "S" | "M" | "L" | "XL";

    const products: any[] = [];

    const addProduct = (data: {
        title: string,
        createdAt: Date,
        stock: number,
        size?: Sizes
    }) => {
        products.push(data)
    }

    addProduct({
        title: "pro1",
        createdAt: new Date(1993, 1, 1),
        stock: 12,
        size: "L"
    })

    console.log(products);
})();