import express from 'express';
import cors from 'cors';
import { supabase } from '../config/supabase.js';

// Inicialización de la app Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- ENDPOINTS DE LA API ---

// 1. OBTENER TODOS LOS PRODUCTOS (CON PAGINACIÓN Y BÚSQUEDA)
app.get('/products', async (req, res) => {
  try {
    // Leer 'page', 'limit' y 'search' de los query params.
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search;

    // Calcular el rango para la paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    // Construimos la consulta base
    let query = supabase.from('products');

    // Si hay un término de búsqueda, aplicamos el filtro de Full-Text Search
    if (searchTerm) {
      // Usamos .textSearch() que está optimizado para usar el índice que creamos.
      // 'fts' es el nombre de nuestra columna tsvector.
      // websearch_to_tsquery es una función flexible para procesar la entrada del usuario.
      query = query.textSearch('fts', `'${searchTerm}'`);
    }

    // --- Consultas a Supabase ---
    // Clonamos la consulta para no repetir código.
    const countQuery = query;
    const dataQuery = query;
    
    // Primera consulta: Obtenemos el conteo total de los resultados (filtrados si hay búsqueda)
    const { count, error: countError } = await countQuery
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error al obtener el conteo:', countError);
      return res.status(500).json({ error: 'Error en la base de datos', details: countError.message });
    }

    // Segunda consulta: Obtenemos los datos para la página actual
    const { data, error: dataError } = await dataQuery
      .select('*')
      .range(startIndex, endIndex)
      .order('id', { ascending: true });

    if (dataError) {
      console.error('Error al obtener productos:', dataError);
      return res.status(500).json({ error: 'Error en la base de datos', details: dataError.message });
    }

    // Enviamos la respuesta estructurada
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
// ... (código sin cambios) ...
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
// ... (código sin cambios) ...
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

