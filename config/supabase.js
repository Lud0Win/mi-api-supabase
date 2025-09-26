// Importamos las librerías necesarias
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargamos las variables de entorno desde el archivo .env
dotenv.config();

// Obtenemos la URL y la clave de Supabase desde las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Creamos y exportamos el cliente de Supabase para usarlo en otros archivos
export const supabase = createClient(supabaseUrl, supabaseKey);
