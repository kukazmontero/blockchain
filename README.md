# Blockchain

## Integrantes
* Gabriel Gonzalez
* Lukas Montero
* Rodrigo Órdenes
* Benjamín Tello

## Tecnologías del proyecto
* NodeJS

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