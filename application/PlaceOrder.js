import { Order } from '../domain/Order.js';

export class PlaceOrder {
  #orderRepository;
  #catalog;
  #payment;
  #notifier;
  #clock;
  #ids;

  constructor({ orderRepository, catalog, payment, notifier, clock, ids }) {
    this.#orderRepository = orderRepository;
    this.#catalog = catalog;
    this.#payment = payment;
    this.#notifier = notifier;
    this.#clock = clock;
    this.#ids = ids;
  }

  async handle({ customerId, items }) {
    // 1. Chercher le prix de chaque produit
    const lines = [];
    for (const item of items) {
      const unitPrice = await this.#catalog.priceof(item.sku);
      if (unitPrice === undefined) {
        throw new Error(`Produit inconnu : ${item.sku}`);
      }
      lines.push({ sku: item.sku, qty: item.qty, unitPrice });
    }

    // 2. Générer l'ID et la date
    const id = this.#ids.next();
    const createdAt = this.#clock.now();

    // 3. Créer la commande (Domaine)
    const order = new Order({ id, customerId, lines, createdAt });

    // 4. Effectuer le paiement
    const paymentResult = await this.#payment.charge({ orderId: order.id, amount: order.total });

    // 5. Marquer la commande payée ou refusée
    if (paymentResult.ok) {
      order.marquerPayee();
    } else {
      order.marquerRefusee(paymentResult.reason);
    }

    // 6. Enregistrer la commande dans tous les cas
    await this.#orderRepository.save(order);

    // 7. Notifier uniquement si elle est payée
    if (order.statut === 'PAYEE' && this.#notifier) {
      await this.#notifier.orderPlaced(order);
    }

    return order;
  }
}