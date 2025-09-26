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

// --- ENDPOINTS DE PRODUCTOS ---

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

// NUEVO: Endpoint para obtener UN producto por su ID
app.get('/products/:id', async (req, res) => {
  try {
    // Obtenemos el ID de los parámetros de la URL
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id) // Filtramos por el campo 'id'
      .single();   // .single() asegura que obtenemos un solo objeto y no un array

    // Si Supabase devuelve un error (ej. el producto no existe), lo lanzamos
    if (error) throw error;

    // Si el producto se encuentra, lo devolvemos
    res.status(200).json(data);
  } catch (error) {
    // Este error se activa si .single() no encuentra el registro
    console.error('Error al obtener el producto por ID:', error);
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

// --- ENDPOINTS DE CATEGORÍAS ---

// NUEVO: Endpoint para obtener TODAS las categorías
app.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories') // Consultamos la nueva tabla 'categories'
      .select('*');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});


// Exportamos la app para que Vercel la pueda usar como una función serverless.
export default app;

