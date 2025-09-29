import express from 'express';
import cors from 'cors';
import { supabase } from '../config/supabase.js';

// Inicialización de la app Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- ENDPOINTS DE LA API ---

// 1. OBTENER TODOS LOS PRODUCTOS (CON PAGINACIÓN)
app.get('/products', async (req, res) => {
  try {
    // --- Lógica de Paginación ---
    // Leer 'page' y 'limit' de los query params.
    // Usamos valores por defecto si no se proporcionan.
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Calcular el rango de datos a solicitar
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    // --- Consultas a Supabase ---
    // Primera consulta: Obtenemos solo el conteo total de forma eficiente
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error al obtener el conteo:', countError);
      return res.status(500).json({ error: 'Error en la base de datos', details: countError.message });
    }

    // Segunda consulta: Obtenemos los datos para la página actual
    const { data, error: dataError } = await supabase
      .from('products')
      .select('*')
      .range(startIndex, endIndex) // Aquí aplicamos el rango
      .order('id', { ascending: true }); // Opcional: ordenar para consistencia

    if (dataError) {
      console.error('Error al obtener productos:', dataError);
      return res.status(500).json({ error: 'Error en la base de datos', details: dataError.message });
    }

    // Enviamos una respuesta estructurada con los datos y la información de paginación
    res.status(200).json({
      totalCount: count,
      page: page,
      limit: limit,
      data: data
    });

  } catch (err) {
    console.error('Error inesperado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. OBTENER UN PRODUCTO POR SU ID
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single(); // .single() es ideal para obtener un único registro

    if (error) {
      // Si el error es 'PGRST116', significa que no se encontró el registro
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      console.error('Error al obtener el producto por ID:', error);
      return res.status(500).json({ error: 'Error en la base de datos', details: error.message });
    }

    res.status(200).json(data);

  } catch (err) {
    console.error('Error inesperado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 3. OBTENER TODAS LAS CATEGORÍAS
app.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) {
      console.error('Error al obtener categorías:', error);
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

