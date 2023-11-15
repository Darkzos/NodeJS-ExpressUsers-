const express = require('express');
const axios = require('axios');


const app = express();
const port = 4000;

// Middleware para procesar datos JSON en las solicitudes
app.use(express.json());

// URL del conjunto de datos de usuarios de JSONPlaceholder
const jsonPlaceholderURL = 'https://jsonplaceholder.typicode.com/users';

// Variable para almacenar los contactos
let contacts = [];
let idCounter = 1;

// Inicializar los contactos al iniciar la aplicación
axios.get(jsonPlaceholderURL)
    .then(response => {
        contacts = response.data;
        console.log('Contacts loaded from JSONPlaceholder');
    })
    .catch(error => {
        console.error('Error loading contacts from JSONPlaceholder:', error.message);
    });

// Función de ayuda para ordenar contactos por nombre
const sortContactsByName = (contact) => {
    return contact.name.toLowerCase();
};

// Función de ayuda para encontrar un contacto por ID
const findContactById = (contactId) => {
    return contacts.find(contact => contact.id.toString() === contactId);
};

// Ruta para obtener todos los contactos
app.get('/contacts', (req, res) => {
    const phrase = req.query.phrase ? req.query.phrase.toLowerCase() : '';

    if (phrase === '') {
        res.json(contacts);
    } else {
        const filteredContacts = contacts.filter(contact => contact.name.toLowerCase().includes(phrase));
        res.json(filteredContacts.sort((a, b) => sortContactsByName(a) - sortContactsByName(b)));
    }
});

// Ruta para obtener un contacto por ID
app.get('/contacts/:contactId', (req, res) => {
    const contactId = req.params.contactId;
    const contact = findContactById(contactId);

    if (contact) {
        res.json(contact);
    } else {
        res.status(404).json({ error: 'Not Found', message: 'Contact not found' });
    }
});

// Ruta para agregar un nuevo contacto
app.post('/contacts', (req, res) => {
    const newContact = req.body;
    // Se asegura que la nueva ID generada no se repita con las existentes
    while (contacts.some(contact => contact.id === idCounter)) {
        idCounter++;
    }
    // Se asigna una nueva ID numérica única
    newContact.id = idCounter++
    // Simplemente agregamos el nuevo contacto a la lista (en una aplicación real, podría interactuar con la base de datos)
    contacts.push(newContact);

    // Devolvemos el nuevo contacto en la respuesta
    res.status(201).json(newContact);
});

// Ruta para eliminar un contacto por ID
app.delete('/contacts/:contactId', (req, res) => {
    const contactId = req.params.contactId;
    const index = contacts.findIndex(contact => contact.id.toString() === contactId);

    if (index !== -1) {
        contacts.splice(index, 1);
        res.status(204).end();
    } else {
        res.status(404).json({ error: 'Not Found', message: 'Contact not found' });
    }
});

// Manejo de errores para rutas no encontradas
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found', message: 'Endpoint not found' });
});

// Manejo de errores para métodos no permitidos
app.use((err, req, res, next) => {
    res.status(405).json({ error: 'Method Not Allowed', message: 'Method not allowed for this endpoint' });
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
