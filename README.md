# Blockchain

## Integrantes
* Gabriel Gonzalez
* Lukas Montero
* Rodrigo Órdenes
* Benjamín Tello

## Tecnologías del proyecto
* NodeJS
* Typescript

## Montaje del ambiente

Se debe descargar el proyecto e ingresar a la carpeta app de este.

```bash
git clone https://github.com/kukazmontero/blockchain.git
cd blockchain/app/
```

Descargar las dependencias necesarias, ocupadas en Node.

```bash
npm install
```

Compilar los archivos con extensión **.ts** para obtenerlos en su extensión de javascript.

```bash
tsc **/*.ts
tsc index.ts
```

## Uso del proyecto
Para utilizar el sistema se desarrolló un *main* que tiene 18 transacciones por defecto y las organiza bajo la condición de tener hasta 5 transacciones por bloques.

Para esto simplemente ejecutar el siguiente comando, que creará la db con los bloques generados:

```bash
node index.js
```
## Estructura del sistema
### Clases
- Account
  - Clase compuesta por atributos como: Mnemonica, address, privateKey y una publicKey. Utilizamos la libreria _ethers_ la cual nos permite interactuar con el ecosistema del blockchain ethereum, esto para poder generar una billetera o _wallet_ y así poder obtener todos los atributos mencionados anteriormente.
- Transaction
  - Clase compuesta por atributos como: sender, recipient, amount, signature, valido y nonce, la cual permitirá registrar transacciones entre dos entidades de la clase Account o cuentas. Esta debe ser firmada con la clave privada de la cuenta que realiza la transacción, dicha firma además puede ser verificada con la clave publica de la misma cuenta.
- Block
  - Clase compuesta por atributos como: index, timestamp, transactions, previousHash y hash, la cual almacenará un total de 5 transacciones por bloque.
### Main
El programa Main del proyecto consta de la creación de un total de 5 entidades account o cuentas para poder simular transacciones. Se crea un bloque inicial el cual tendrá solo una transacción Alice 🡆 Bob. Pasamos a generar un arreglo de distintas combinaciones de transacciones para posteriormente ir registrandolas en los bloques hasta alcanzar un maximo de 5 transacciones por bloque.
