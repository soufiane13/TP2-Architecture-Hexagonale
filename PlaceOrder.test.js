import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PlaceOrder } from './application/PlaceOrder.js';
import { InMemoryOrderRepository } from './adapters/secondary/InMemoryOrderRepository.js';
import { StaticCatalog } from './adapters/secondary/StaticCatalog.js';
import { FakePayment } from './adapters/secondary/FakePayment.js';

test('commande de 117 € : payée, enregistrée, notifiée', async () => {
  const envoyes = [];
  const orderRepo = new InMemoryOrderRepository();
  const placeOrder = new PlaceOrder({
    orderRepository: orderRepo,
    catalog: new StaticCatalog(),
    payment: new FakePayment(),
    notifier: { orderPlaced: async o => envoyes.push(o.id) },
    clock: { now: () => '2026-10-21T16:00:00Z' },
    ids: { next: () => 'CMD-0001' }
  });

  const order = await placeOrder.handle({
    customerId: 'C-42',
    items: [
      { sku: 'CLAVIER', qty: 2 },
      { sku: 'SOURIS', qty: 1 }
    ]
  });

  assert.equal(order.statut, 'PAYEE');
  assert.equal(order.total, 117);
  assert.equal(envoyes.length, 1);
  assert.equal(envoyes[0], 'CMD-0001');

  const saved = await orderRepo.findById('CMD-0001');
  assert.equal(saved.statut, 'PAYEE');
});

test('commande de 598 € : refusée, enregistrée, pas de notification', async () => {
  const envoyes = [];
  const orderRepo = new InMemoryOrderRepository();
  const placeOrder = new PlaceOrder({
    orderRepository: orderRepo,
    catalog: new StaticCatalog(),
    payment: new FakePayment(),
    notifier: { orderPlaced: async o => envoyes.push(o.id) },
    clock: { now: () => '2026-10-21T16:00:00Z' },
    ids: { next: () => 'CMD-0002' }
  });

  const order = await placeOrder.handle({
    customerId: 'C-42',
    items: [{ sku: 'ECRAN', qty: 2 }]
  });

  assert.equal(order.statut, 'REFUSEE');
  assert.equal(order.total, 598);
  assert.match(order.toJSON().motif, /500/);
  assert.equal(envoyes.length, 0);

  const saved = await orderRepo.findById('CMD-0002');
  assert.equal(saved.statut, 'REFUSEE');
});

test('produit inconnu : erreur, rien n\'est enregistré', async () => {
  const orderRepo = new InMemoryOrderRepository();
  const placeOrder = new PlaceOrder({
    orderRepository: orderRepo,
    catalog: new StaticCatalog(),
    payment: new FakePayment(),
    notifier: { orderPlaced: async () => {} },
    clock: { now: () => '2026-10-21T16:00:00Z' },
    ids: { next: () => 'CMD-0003' }
  });

  await assert.rejects(
    async () => {
      await placeOrder.handle({
        customerId: 'C-42',
        items: [{ sku: 'INCONNU', qty: 1 }]
      });
    },
    /Produit inconnu/
  );

  const saved = await orderRepo.findById('CMD-0003');
  assert.equal(saved, null);
});