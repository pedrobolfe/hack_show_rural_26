export const successResponse = (data: any, message = 'Sucesso') => {
  return {
    success: true,
    message,
    data
  };
};

export const errorResponse = (error: string | Error, message = 'Erro') => {
  return {
    success: false,
    message,
    error: typeof error === 'string' ? error : error.message
  };
};

export const isValidId = (id: string): boolean => {
  return !isNaN(parseInt(id)) && parseInt(id) > 0;
};
