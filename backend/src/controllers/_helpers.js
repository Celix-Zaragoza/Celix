export const notImplemented = (res, feature, expectedBody = null) => {
  return res.status(501).json({
    ok: false,
    message: `${feature} not implemented yet`,
    expectedBody,
  });
};