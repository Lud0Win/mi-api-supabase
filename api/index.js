// api/index.js (CORREGIDO)

import express from 'express';
import cors from 'cors';
import { supabase } from '../config/supabase.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- DEFINICIÓN DE RUTAS CORREGIDAS ---

// La ruta raíz de la API ahora es '/' (accesible a través de /api)
app.get('/', (req, res) => {
  res.status(200).json({ message: '¡Bienvenido a la API de Productos!' });
});

// La ruta de productos ahora es '/products' (accesible a través de /api/products)
app.get('/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('Error al obtener productos:', error);
      return res.status(500).json({ error: 'Error en la base de datos', details: error.message });
    }

    res.status(200).json(data);

  } catch (err) {
    console.error('Error inesperado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Exportamos la app para que Vercel pueda utilizarla
export default app;
