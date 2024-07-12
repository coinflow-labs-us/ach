interface ErrorObj {
  name: string;
  message: string;
}

class nACHError extends Error {
  constructor(errorObj: ErrorObj) {
    super(errorObj.message || 'Uncaught nACHError');
    this.name = `nACHError[${errorObj.name}]` || 'nACHError';
  }
}

export default nACHError;
