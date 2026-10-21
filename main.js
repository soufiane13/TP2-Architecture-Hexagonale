import { createHttpServer } from './adapters/primary/httpServer.js';
import { PlaceOrder } from './application/PlaceOrder.js';
import { InMemoryOrderRepository } from './adapters/secondary/InMemoryOrderRepository.js';
import { StaticCatalog } from './adapters/secondary/StaticCatalog.js';
import { FakePayment } from './adapters/secondary/FakePayment.js';
import { ConsoleNotifier } from './adapters/secondary/ConsoleNotifier.js';

const orderRepository = new InMemoryOrderRepository();
const catalog = new StaticCatalog();
const payment = new FakePayment();
const notifier = new ConsoleNotifier();

let counter = 1;
const ids = {
  next: () => `CMD-${String(counter++).padStart(4, '0')}`
};

const clock = {
  now: () => new Date().toISOString()
};

const placeOrder = new PlaceOrder({
  orderRepository,
  catalog,
  payment,
  notifier,
  clock,
  ids
});

const PORT = process.env.PORT || 3001;
const server = createHttpServer({ placeOrder, orderRepository });

server.listen(PORT, () => {
  console.log(`API ShopLite (TP2) démarrée sur http://localhost:${PORT}`);
});