import { Transaction } from "../classes/Transaction.js";

const registerUser = async (db_accounts, name) => {
    return await db_accounts.registerAccount(name);
};

export const showMenu = (req, res) => {
    const menu = {
        menuItems: [
            'Register account -> POST /account + JSON',
            'Make transaction -> POST /transaction + JSON',
            'Get account of address -> POST /account/#address',
            'View blocks -> GET /blocks',
            'Exit -> GET /exit'
        ]
    };
    res.json(menu);
}

export const registerAccount = async (req, res, db_accounts, accounts, sendFileToAllNodes) => {
    try {
        let name;
        // Verificar si la solicitud proviene de la API o de la consola
        if (req.body) {
        // Si es una solicitud API
        name = req.body.name;
        } else {
        // Si es entrada por consola
        return res.status(400).json({ error: 'Name is required.' });
        }

        const newAccount = await registerUser(db_accounts, name);

        const finalmessage = "1-" + newAccount;
        await sendFileToAllNodes(finalmessage);

        // Convertir la cadena JSON a un objeto JavaScript
        const newAccountObj = JSON.parse(newAccount);
        console.log('New Account:', newAccountObj);
        accounts.push(newAccountObj);

        // Devolver el resultado en formato JSON
        res.status(201).json({
            success: true,
            account: {
                name: newAccountObj.name,
                mnemonic: newAccountObj.mnemonic,
                wallet: {
                _isSigner: true,
                address: newAccountObj.wallet.address,
                provider: null
                },
                address: newAccountObj.address,
                privatekey: newAccountObj.privatekey,
                publickey: newAccountObj.publickey,
                money: newAccountObj.money,
                blocked: newAccountObj.blocked
            }
        });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const generateTransaction = async (req, res, db_accounts, db_blocks, chain, sendFileToAllNodes, generateBlock, N) => {
    try {
        let senderAddress, recipientAddress, amount;
        if (req.body) {
            // Si es una solicitud API
            senderAddress = req.body.senderAddress;
            recipientAddress = req.body.recipientAddress;
            amount = req.body.amount;
        } 
        else {
            return res.status(400).json({ error: 'Invalid sender or recipient address' });
        }
    
        const sender = await db_accounts.getAccountByAddress(senderAddress);
        const recipient = await db_accounts.getAccountByAddress(recipientAddress);
    
        if (sender.blocked) {
            return res.status(400).json({ error: 'Sender account is blocked.' });
        }
    
        // Verificar si el remitente tiene suficiente dinero
        if (sender.money < amount) {
            return res.status(400).json({ error: 'Insufficient funds in the sender account.' });
        }
    
        // Modificar el estado del sender a blocked antes de realizar la transacción
        await db_accounts.modifyState(senderAddress, true);
        await sendFileToAllNodes("bloqued-" + senderAddress);
    
        // Esperar 10 segundos antes de ejecutar el siguiente bloque de código
        setTimeout(async () => {
            // Descontar el monto de la cuenta del remitente
            await db_accounts.modifyMoney(senderAddress, -amount);
            await sendFileToAllNodes("descmoney-" + senderAddress + "-" + amount);
    
            // Aumentar el monto en la cuenta del destinatario
            await db_accounts.modifyMoney(recipientAddress, amount);
            await sendFileToAllNodes("addmoney-" + recipientAddress + "-" + amount);
    
            // Verificar si es necesario crear un nuevo bloque
            const lastBlock = await db_blocks.getLastBlock();
            const transactions = lastBlock ? lastBlock.transactions : [];
    
            const transaction = new Transaction(
                sender.name,
                recipient.name,
                amount,
                Date.now(),
                sender.privatekey,
                sender.publickey
            );
    
            if (lastBlock && lastBlock.transactions.length === N) {
                const newBlock = generateBlock(
                    lastBlock.index + 1,
                    lastBlock.hash,
                    [transaction]
                );
                chain.push(newBlock);
                await sendFileToAllNodes("2-" + JSON.stringify(newBlock));
                await db_blocks.saveBlock(newBlock);
            } else {
                transactions.push(transaction);
                const blockmessage = "2-" + JSON.stringify(lastBlock);
                await sendFileToAllNodes(blockmessage);
                await db_blocks.saveBlock(lastBlock);
            }
    
            // Modificar el estado del sender a unblocked después de realizar la transacción
            await db_accounts.modifyState(senderAddress, false);
            await sendFileToAllNodes("unbloqued-" + senderAddress);
    
            res.status(200).json({ success: true, transaction });
    
        }, 10000);
        } catch (error) {
        console.error('Error processing transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getAccountByAddress = async (req, res, db_accounts) => {
    try {
        const { address } = req.params;
    
        // Validar que se haya proporcionado una dirección
        if (!address) {
            return res.status(400).json({ error: 'Address is required.' });
        }
    
        const account = await db_accounts.getAccountByAddress(address);
    
        // Verificar si la cuenta fue encontrada
        if (account) {
            // Devolver el resultado en formato JSON
            res.status(200).json({
                success: true,
                account: {
                    name: account.name,
                    mnemonic: account.mnemonic,
                    wallet: {
                        _isSigner: true,
                        address: account.wallet.address,
                        provider: null
                    },
                    address: account.address,
                    privatekey: account.privatekey,
                    publickey: account.publickey,
                    money: account.money,
                    blocked: account.blocked
                }
            });
        } else {
            // Si la cuenta no se encuentra, devolver un mensaje de error
            res.status(404).json({ error: 'Account not found.' });
        }
    } catch (error) {
        console.error('Error retrieving account by address:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}