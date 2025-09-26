// api/index.js (CÓDIGO DE PRUEBA MÍNIMO)

import express from 'express';

const app = express();
const port = 3000;

// Ruta de prueba
app.get('/', (req, res) => {
  res.status(200).json({ message: '¡El servidor de prueba funciona!' });
});

// Ruta de prueba para productos
app.get('/products', (req, res) => {
  res.status(200).json([
    { id: 1, name: 'Producto de prueba' }
  ]);
});


app.listen(port,() => {
  console.log("Aplicacion iniciada");
} );
export default app;
