import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Order } from './domain/Order.js';

test('une commande neuve est EN_ATTENTE et calcule son total', () => {
  const order = new Order({
    id: 'CMD-0001',
    customerId: 'C-42',
    lines: [
      { sku: 'CLAVIER', qty: 2, unitPrice: 49 },
      { sku: 'SOURIS', qty: 1, unitPrice: 19 }
    ],
    createdAt: '2026-10-21T16:00:00Z'
  });

  assert.equal(order.statut, 'EN_ATTENTE');
  assert.equal(order.total, 117);
});

test('refuse une commande vide, sans client ou avec une quantité invalide', () => {
  assert.throws(() => new Order({ id: '1', customerId: '', lines: [{ sku: 'A', qty: 1, unitPrice: 10 }], createdAt: '' }), /client/);
  assert.throws(() => new Order({ id: '1', customerId: 'C1', lines: [], createdAt: '' }), /au moins une ligne/);
  assert.throws(() => new Order({ id: '1', customerId: 'C1', lines: [{ sku: 'A', qty: 0, unitPrice: 10 }], createdAt: '' }), /entier positif/);
  assert.throws(() => new Order({ id: '1', customerId: 'C1', lines: [{ sku: 'A', qty: 1.5, unitPrice: 10 }], createdAt: '' }), /entier positif/);
});

test('une commande ne change de statut qu\'une fois', () => {
  const order = new Order({
    id: 'CMD-0001',
    customerId: 'C-42',
    lines: [{ sku: 'CLAVIER', qty: 1, unitPrice: 49 }],
    createdAt: '2026-10-21T16:00:00Z'
  });

  order.marquerPayee();
  assert.equal(order.statut, 'PAYEE');
  assert.throws(() => order.marquerRefusee('Paiement refusé'), /déjà traitée/);
});