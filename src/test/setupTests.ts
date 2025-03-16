if (process.env.NODE_ENV !== 'test') {
  throw new Error('This operation is allowed only in test environment.');
}
