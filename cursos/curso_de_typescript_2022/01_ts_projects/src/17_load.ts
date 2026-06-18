// var _ = requiere("lodash");
import _ from "lodash";

const data = [
    {
        username: "Rafa",
        role: "admin"
    },
    {
        username: "Jenni",
        role: "seller"
    },
    {
        username: "zulema",
        role: "seller"
    },
    {
        username: "santiago",
        role: "customer"
    }
]

const rta = _.groupBy(data, (item) => item.role );
console.log(rta);
