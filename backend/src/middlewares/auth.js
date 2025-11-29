import { supabaseAdmin } from '../config/supabase.js';

/**
 * Middleware para verificar autenticación con Supabase
 */
export const authenticateUser = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación no proporcionado'
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token con Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token inválido o expirado'
      });
    }

    // Agregar usuario al request para usarlo en los controladores
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al verificar autenticación'
    });
  }
};

