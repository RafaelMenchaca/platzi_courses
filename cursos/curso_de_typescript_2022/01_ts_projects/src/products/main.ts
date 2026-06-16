import { addProduct, calcStock, products} from "./product.service";

addProduct({
    name: "pro1",
    createdAt: new Date(1997, 1, 1),
    stock: 5,
    size: "M"
})

addProduct({
    name: "pro2",
    createdAt: new Date(1993, 1, 1),
    stock: 6,
    size: "L"
})

console.log(products);
const total = calcStock();
console.log(total);