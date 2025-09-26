// Importamos las librerías necesarias
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargamos las variables de entorno (importante para Vercel)
dotenv.config();

// Obtenemos la URL y la clave de Supabase desde las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Creamos y exportamos el cliente de Supabase para usarlo en otros archivos
// Si las claves no están definidas, esto fallará, ¡asegúrate de ponerlas en Vercel!
export const supabase = createClient(supabaseUrl, supabaseKey);

