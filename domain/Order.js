// domain/Order.js: DOMAINE, aucun import
export class Order {
    #id;
    #customerId;
    #lines;
    #createdAt;
    #statut = 'EN_ATTENTE';
    #motif = null;
  
    constructor({ id, customerId, lines, createdAt }) {
      if (!customerId || typeof customerId !== 'string' || !customerId.trim()) {
        throw new Error('Le client est obligatoire');
      }
      if (!Array.isArray(lines) || lines.length === 0) {
        throw new Error('Une commande doit contenir au moins une ligne');
      }
      for (const line of lines) {
        if (!line.sku) throw new Error('Chaque ligne doit avoir un SKU');
        if (!Number.isInteger(line.qty) || line.qty <= 0) throw new Error('La quantité doit être un entier positif');
        if (typeof line.unitPrice !== 'number' || line.unitPrice < 0) throw new Error('Le prix unitaire est invalide');
      }
  
      this.#id = id;
      this.#customerId = customerId;
      this.#lines = lines.map(line => ({ ...line })); // Copie défensive
      this.#createdAt = createdAt;
    }
  
    get id() { return this.#id; }
    get customerId() { return this.#customerId; }
    get statut() { return this.#statut; }
    get createdAt() { return this.#createdAt; }
    
    get lines() { return this.#lines.map(line => ({ ...line })); } // Copie défensive
  
    get total() {
      return this.#lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
    }
  
    marquerPayee() {
      if (this.#statut !== 'EN_ATTENTE') throw new Error('Commande déjà traitée');
      this.#statut = 'PAYEE';
    }
  
    marquerRefusee(motif) {
      if (this.#statut !== 'EN_ATTENTE') throw new Error('Commande déjà traitée');
      this.#statut = 'REFUSEE';
      this.#motif = motif;
    }
  
    toJSON() {
      return {
        id: this.#id,
        customerId: this.#customerId,
        lines: this.lines,
        total: this.total,
        statut: this.#statut,
        motif: this.#motif,
        createdAt: this.#createdAt
      };
    }
  }