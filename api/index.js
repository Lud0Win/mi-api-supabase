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

    // Unificamos la consulta de datos y conteo en una sola
    let query = supabase.from('products').select('*', { count: 'exact' });

    // --- LÓGICA DE BÚSQUEDA MEJORADA (VERSIÓN CORREGIDA) ---
    if (searchTerm) {
      // 1. Llamar a la función 'search_products' en la base de datos
      const { data: searchData, error: searchError } = await supabase.rpc('search_products', {
        search_term: searchTerm
      });

      if (searchError) {
        console.error('Error en la función RPC de búsqueda:', searchError);
        return res.status(500).json({ error: 'Error al ejecutar la búsqueda', details: searchError.message });
      }

      // **PUNTO CLAVE DE LA CORRECCIÓN**
      // Si la búsqueda no devuelve resultados, o la estructura es inesperada,
      // es mejor devolver una respuesta vacía directamente.
      if (!searchData || searchData.length === 0) {
        return res.status(200).json({
          totalCount: 0,
          page,
          limit,
          data: []
        });
      }

      // 2. Extraer los IDs de la respuesta de forma segura.
      // El problema más común es que la función devuelva objetos donde la columna
      // no se llame 'id', o que algunos objetos no la tengan.
      // Este código extrae la propiedad 'id' y filtra cualquier valor inválido.
      const matchingIds = searchData
        .map(item => item.id)
        .filter(id => id !== undefined && id !== null);

      // 3. Si no se encontraron IDs válidos después de procesar la respuesta, no hay resultados.
      if (matchingIds.length === 0) {
        return res.status(200).json({
          totalCount: 0,
          page,
          limit,
          data: []
        });
      }

      // 4. Filtramos la consulta principal para que solo incluya los IDs encontrados.
      query = query.in('id', matchingIds);
    }

    // --- Ejecutamos la consulta única a Supabase ---
    // Nota: El método .range() de Supabase es inclusivo en ambos extremos.
    const endIndex = startIndex + limit - 1;
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
