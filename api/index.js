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

    // --- Construcción de Consultas ---
    
    // Función para construir la consulta base y aplicar el filtro de búsqueda si existe
    const buildQuery = () => {
      let query = supabase.from('products');
      if (searchTerm) {
        query = query.textSearch('fts', searchTerm, {
          type: 'websearch',
          config: 'spanish'
        });
      }
      return query;
    };

    // --- Consultas a Supabase ---
    
    // Primera consulta: Obtenemos el conteo total.
    // Construimos la consulta y le aplicamos el select para contar.
    const { count, error: countError } = await buildQuery()
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      // Logueamos el error completo para tener más detalles en Vercel
      console.error('Error detallado al obtener el conteo:', countError);
      return res.status(500).json({ error: 'Error en la base de datos al contar', details: countError.message });
    }

    // Segunda consulta: Obtenemos los datos para la página actual.
    // Construimos la misma consulta base y le aplicamos el rango y orden.
    const { data, error: dataError } = await buildQuery()
      .select('*')
      .range(startIndex, endIndex)
      .order('id', { ascending: true });

    if (dataError) {
      // Logueamos el error completo
      console.error('Error detallado al obtener productos:', dataError);
      return res.status(500).json({ error: 'Error en la base de datos al obtener datos', details: dataError.message });
    }

    // Enviamos la respuesta estructurada
    res.status(200).json({
      totalCount: count,
      page: page,
      limit: limit,
      data: data
    });

  } catch (err) {
    // Error general que no fue capturado por las consultas
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

