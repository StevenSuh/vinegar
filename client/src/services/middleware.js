// NOTE: this is not a global middleware.
//  therefore, this requires the `connect` function on whatever relevant component
const errorMiddleware = [];

export const connectErrorMiddlewareWithCallback = (component, callback) => {
  if (!component || !component.$on || !callback) {
    throw new Error('connectErrorMiddlewareWithCallback requires proper parameters');
  }
  component.$on('onError', callback);
  errorMiddleware.push(component);
};

export const disconnectErrorMiddleware = (component, callback) => {
  if (!component || !component.$on || !callback) {
    throw new Error('disconnectErrorMiddlewareWithCallback requires proper parameters');
  }
  const index = errorMiddleware.indexOf(component);

  if (index > -1) {
    errorMiddleware.splice(index, 1);
    component.$off('onError', callback);
  }
};

export const handleErrorMiddleware = (err) => {
  errorMiddleware.forEach((component) => {
    component.$emit('onError', err);
  });
};
