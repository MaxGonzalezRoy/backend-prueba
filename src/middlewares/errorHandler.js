function errorHandler(err, req, res, next) {
    console.error('[ERROR]', err.stack);
    
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Algo salió mal' 
        : err.message;

    res.status(status).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

module.exports = errorHandler;