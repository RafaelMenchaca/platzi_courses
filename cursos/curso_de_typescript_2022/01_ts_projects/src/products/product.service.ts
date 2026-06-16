import { Product } from "./product.moe";


export const products: Product[] = [];

export const addProduct = (data: Product ) => {
    products.push(data)
}


export const calcStock = (): number => {
    let total = 0;
    products.forEach((item)=> {
        total += item.stock;
    });
    return total;
}