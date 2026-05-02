"use strict";
// //@ts-check
// (async ()=> {
//   const myCart = [];
//   const products = [];
//   const limit = 2;
//   async function getProducts() {
//     const rta = await fetch('http://api.escuelajs.co/api/v1/products', {
//       method: 'GET'
//     });
//     const data = await rta.json();
//     products.push(...data);
//   }
//   function getTotal() {
//     let total = 0;
//     for (let i = 0; i < myCart.length; i++) {
//       total += myCart[i].price;
//     }
//     return total;
//   }
//   function addProduct(index) {
//     if (index < 0 || index >= products.length) {
//         console.log("producto no encontrado");
//         return;
//     }
//     if (myCart.length < limit) {
//         myCart.push(products[index]);
//         } else {
//             console.log("no puedes agregar mas productos")
//         }
//     }
//   await getProducts();
//   addProduct(1);
//   addProduct(2);
//   const total = getTotal();
//   console.log(total);
//   const person = {
//     name: 'Nicolas',
//     lastName: 'Molina'
//   }
//   const rta = `${person.name} ${person.lastName} ${limit}`;
//   console.log(rta);
// })();
//@ts-check
(async () => {
    /**
     * @typedef {Object} Product
     * @property {number} id
     * @property {string} title
     * @property {number} price
     */
    /** @type {Product[]} */
    const myCart = [];
    /** @type {Product[]} */
    const products = [];
    const limit = 2;
    async function getProducts() {
        const rta = await fetch('https://api.escuelajs.co/api/v1/products', {
            method: 'GET'
        });
        /** @type {Product[]} */
        const data = await rta.json();
        products.push(...data);
    }
    function getTotal() {
        let total = 0;
        for (let i = 0; i < myCart.length; i++) {
            total += myCart[i].price;
        }
        return total;
    }
    /**
     * @param {number} index
     */
    function addProduct(index) {
        if (index < 0 || index >= products.length) {
            console.log("producto no encontrado");
            return;
        }
        if (myCart.length < limit) {
            myCart.push(products[index]);
        }
        else {
            console.log("no puedes agregar más productos");
        }
    }
    await getProducts();
    addProduct(1);
    addProduct(2);
    const total = getTotal();
    console.log(total);
    const person = {
        name: 'Nicolas',
        lastName: 'Molina'
    };
    const rta = `${person.name} ${person.lastName} ${limit}`;
    console.log(rta);
})();
