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

// Ruta para obtener todos los productos de la tabla 'products'
app.get('/products', async (req, res) => {
  try {
    // Usamos el cliente de Supabase para hacer la consulta a la tabla 'products'
    const { data, error } = await supabase
      .from('products') // El nombre exacto de tu tabla
      .select('*');     // Selecciona todos los campos

    // Si Supabase devuelve un error, lo notificamos
    if (error) {
      console.error('Error de Supabase:', error);
      // Es importante no exponer detalles del error al cliente en producción
      return res.status(500).json({ error: 'Error al consultar la base de datos' });
    }

    // Si la consulta es exitosa, enviamos los datos
    res.status(200).json(data);

  } catch (err) {
    // Capturamos cualquier otro error inesperado en el servidor
    console.error('Error inesperado en el servidor:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Exportamos la app para que Vercel la pueda usar como una función serverless.
// NO se usa app.listen() en Vercel.
export default app;
