#include "stdlib.h"
#include "stdio.h"
#include "string.h"

struct client {
    char name[50];
    char id[10];
    float credit;
    char address[100];
};

int main(int argc, char const *argv[]){
    (void)argc;
    (void)argv;
    struct client client1 = {0};
    strcpy(client1.name, "Rafael Menchaca");
    strcpy(client1.id, "000000001");
    client1.credit = 1000000;
    strcpy(client1.address, "1 street, New york city, USA");

    printf("Customer name: %s\n", client1.name);
    printf("Customer id: %s\n", client1.id);
    printf("Customer credit: %f\n", client1.credit);
    printf("Customer address: %s\n", client1.address);


    return 0; 
}