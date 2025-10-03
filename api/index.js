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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    // Unificamos la consulta de datos y conteo en una sola
    let query = supabase.from('products').select('*', { count: 'exact' });

    // --- LÓGICA DE BÚSQUEDA MEJORADA ---
    if (searchTerm) {
      // 1. Llamamos a nuestra función 'search_products' en la base de datos
      const { data: searchData, error: searchError } = await supabase.rpc('search_products', {
        search_term: searchTerm
      });

      if (searchError) {
        console.error('Error en la función RPC de búsqueda:', searchError);
        return res.status(500).json({ error: 'Error al ejecutar la búsqueda', details: searchError.message });
      }

      // 2. Manejamos el caso de que la búsqueda no devuelva resultados (incluso nulos)
      // Si searchData es null o un array vacío, no hay coincidencias.
      if (!searchData || searchData.length === 0) {
        return res.status(200).json({
          totalCount: 0,
          page,
          limit,
          data: []
        });
      }

      // Mapeamos los IDs de forma segura
      const matchingIds = searchData.map(item => item.id);

      // 3. Filtramos la consulta principal para que solo incluya los IDs encontrados
      query = query.in('id', matchingIds);
    }

    // --- Ejecutamos la consulta única a Supabase ---
    const { data, count, error } = await query
      .range(startIndex, endIndex)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error detallado al obtener productos:', error);
      return res.status(500).json({ error: 'Error en la base de datos', details: error.message });
    }

    // Devolvemos la respuesta con los datos y el conteo total
    res.status(200).json({
      totalCount: count,
      page,
      limit,
      data
    });

  } catch (err) {
    console.error('Error inesperado en el endpoint /products:', err);
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
      .single();

    if (error) {
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
    const { data, error } = await supabase.from('categories').select('*');
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

