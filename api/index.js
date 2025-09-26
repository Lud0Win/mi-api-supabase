// Usamos la sintaxis de ES Modules (import)
import express from 'express';
import cors from 'cors';
// Importamos nuestro cliente de supabase configurado
import { supabase } from '../config/supabase.js';

const app = express();

// Middlewares: Habilitan CORS y permiten que el servidor entienda JSON
app.use(cors());
app.use(express.json());

// --- DEFINICIÓN DE RUTAS ---

// Ruta raíz de bienvenida
app.get('/', (req, res) => {
  res.status(200).json({ message: '¡Bienvenido a la API de Productos con Supabase!' });
});

// --- ENDPOINTS DE PRODUCTOS Y CATEGORÍAS ---

// Endpoint para obtener TODOS los productos
app.get('/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

// CORRECCIÓN: Endpoint para obtener TODAS las categorías.
// Se define ANTES que '/products/:id' para que Express no confunda "categories" con un ID de producto.
app.get('/products/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error)
  {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

// Endpoint para obtener UN producto por su ID.
// Esta es una ruta dinámica (atrapa cualquier valor), por eso va después de las rutas más específicas.
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error al obtener el producto por ID:', error);
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

// La ruta original '/categories' se ha movido a '/products/categories' para una estructura más coherente.

// Exportamos la app para que Vercel la pueda usar como una función serverless.
export default app;

