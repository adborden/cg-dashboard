
function apiProxyHandler(client) {
  return function(req, res) {
    const {
      body,
      method,
      params,
      path,
      user
    } = req;

    client.request({
      body,
      method,
      params,
      path,
      headers: {
        'Authorization': `Bearer ${user.accesToken}`
      }
    });
  }
}

export default apiProxyHandler;
