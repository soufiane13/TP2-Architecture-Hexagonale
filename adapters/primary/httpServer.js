import http from 'node:http';

export function createHttpServer({ placeOrder, orderRepository }) {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // POST /orders
    if (req.method === 'POST' && url.pathname === '/orders') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { customerId, items } = JSON.parse(body);
          const order = await placeOrder.handle({ customerId, items });

          if (order.statut === 'PAYEE') {
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(order.toJSON()));
          } else if (order.statut === 'REFUSEE') {
            res.writeHead(402, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(order.toJSON()));
          }
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // GET /orders/:id
    if (req.method === 'GET' && url.pathname.startsWith('/orders/')) {
      const id = url.pathname.split('/')[2];
      const order = await orderRepository.findById(id);

      if (!order) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Commande non trouvée' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(order.toJSON()));
      return;
    }

    // Route inconnue
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route non trouvée' }));
  });
}