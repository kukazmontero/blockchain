# Blockchain

## Integrantes
* Gabriel Gonzalez
* Lukas Montero
* Rodrigo Órdenes
* Benjamín Tello

## Tecnologías del proyecto
* NodeJS
* Typescript
* LevelDB
* Libp2p

## Montaje del ambiente

Se debe descargar el proyecto.

```bash
git clone https://github.com/kukazmontero/blockchain.git
```

Descargar las dependencias necesarias, ocupadas en "classes".

```bash
cd blockchain/app/classes
npm install
```

Compilar los archivos con extensión **.ts** para obtenerlos en su extensión de javascript.

```bash
tsc *.ts
```

Descargar las dependencias necesarias, ocupadas en "app".

```bash
cd ..
npm install
```

## Uso del proyecto
### Levantar Nodos
Para utilizar el sistema se desarrolló un *API REST* en el script *Node.js*, que permite administrar el sistema. Por alcance de tiempo y complejidad, se debe instanciar obligatoriamente un nodo en el puerto 9000.

```bash
node Node.js [PORT]
```

### Solicitudes de la API

* Ver Menú: Devuelve un listado con las funcionalidades disponibles para realizar en un nodo.

```bash
GET /menu
```

* Registrar Cuenta: Registra una cuenta dentro de la red de Blockchain.

*Query Struct*
```bash
POST /account
JSON-Body: name
```

*Curl Command*
```bash
$ curl -X POST http://localhost:[PORT]/account \
  -H "Content-Type: application/json" \
  -d '{"name": "account_name"}'
```

* Generar Transacción: Genera una transacción monetaria en el sistema.

*Query Struct*
```bash
POST /transaction
JSON-Body: senderAddress, recipientAddress y amount
```

*Curl Command*
```bash
$ curl -X POST http://localhost:[PORT]/transaction \
	-H "Content-Type: application/json" \
	-d '{"senderAddress": [senderAddress], "recipientAddress": [recipientAddress], "amount": [AMOUNT]}'
```

* Obtener Cuenta por Dirección: Funcionalidad para extraer la información de una cuenta en base a su dirección.

*Query Struct*
```bash
GET /account/:address
```

* Mostrar todos los Bloques: Funcionalidad para simplemente ver una vista detallada de cada bloque.

*Query Struct*
```bash
GET /blocks
```

* Bajar Nodo: Funcionalidad para parar la instancia de un nodo.

*Query Struct*
```bash
GET /exit
```


## Estructura del sistema
### Clases
- Account
  - Clase compuesta por atributos como: Mnemonica, address, privateKey y una publicKey. Utilizamos la libreria _ethers_ la cual nos permite interactuar con el ecosistema del blockchain ethereum, esto para poder generar una billetera o _wallet_ y así poder obtener todos los atributos mencionados anteriormente.
- Transaction
  - Clase compuesta por atributos como: sender, recipient, amount, signature, valido y nonce, la cual permitirá registrar transacciones entre dos entidades de la clase Account o cuentas. Esta debe ser firmada con la clave privada de la cuenta que realiza la transacción, dicha firma además puede ser verificada con la clave publica de la misma cuenta.
- Block
  - Clase compuesta por atributos como: index, timestamp, transactions, previousHash y hash, la cual almacenará un total de 5 transacciones por bloque.
- DBManager
  - Compuesta por dos clases encargadas de facilitar el manejo y gestión de los bloques y cuentas almacenados en la base de datos de Libp2p.
### Nodo.js
- Script de NodeJS que instacia un nodo para la red de Blockchain, que brinda reciliencia, seguridad, descentralización y soluciona el problema del doble gasto.
- Por cada nodo creado se expone una API que permite realizar acciones en la red a través del nodo respectivo.
