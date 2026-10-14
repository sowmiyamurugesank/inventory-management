
export function errorHandler(error, req, res, next) {
    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    return res.status(500).json({
        success: false,
        error: "Internal server error",
    });
}
