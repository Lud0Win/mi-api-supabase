// Importamos las librerías necesarias
import express from 'express';
import cors from 'cors';
// Importamos el cliente de Supabase que configuramos previamente
import { supabase } from '../config/supabase.js';

// Inicializamos la aplicación de Express
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Habilita CORS para permitir peticiones desde el frontend
app.use(express.json()); // Permite al servidor entender JSON en las peticiones

// --- DEFINICIÓN DE RUTAS ---

// Ruta de bienvenida para probar que la API funciona
app.get('/api', (req, res) => {
  res.status(200).json({ message: '¡Bienvenido a la API de Productos!' });
});

// Ruta para obtener todos los productos de la tabla 'products'
app.get('/api/products', async (req, res) => {
  try {
    // Usamos el cliente de Supabase para hacer la consulta
    const { data, error } = await supabase
      .from('products') // El nombre de tu tabla
      .select('*');     // Selecciona todos los campos

    // Si hay un error en la consulta, lo enviamos como respuesta
    if (error) {
      console.error('Error al obtener productos:', error);
      return res.status(500).json({ error: 'Error en la base de datos', details: error.message });
    }

    // Si todo va bien, enviamos los productos como respuesta
    res.status(200).json(data);

  } catch (err) {
    // Capturamos cualquier otro error inesperado
    console.error('Error inesperado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Exportamos la app para que Vercel pueda utilizarla
export default app;
