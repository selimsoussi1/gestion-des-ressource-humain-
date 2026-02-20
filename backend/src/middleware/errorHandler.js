const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Erreur de validation', details: err.details });
  }

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Cette entrée existe déjà.' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: 'Référence invalide. L\'enregistrement lié n\'existe pas.' });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Erreur interne du serveur' : err.message,
  });
};

module.exports = errorHandler;
