function notFound(request, _response, next) {
  next({ status: 404, message: `Path not found: ${request.originalUrl}` });
}

module.exports = notFound;
