# Template de Módulo TypeScript

## Model
```typescript
export interface IItem {
  id?: string;
  campo: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ItemModel implements IItem {
  constructor(data: Partial<IItem>) {
    // Inicializar campos
  }

  validate(): { isValid: boolean; errors: string[] } {
    // Validações
  }

  toFirestore(): Omit<IItem, 'id'> {
    // Retornar objeto para Firestore
  }
}
```

## Service
```typescript
import { db } from '../../config/firebase.config';

class ItemService {
  private collectionRef = db.collection('items');

  async create(data: Partial<IItem>): Promise<ItemModel> {}
  async findAll(): Promise<ItemModel[]> {}
  async findById(id: string): Promise<ItemModel> {}
  async update(id: string, data: Partial<IItem>): Promise<ItemModel> {}
  async delete(id: string): Promise<ItemModel> {}
}

export default new ItemService();
```

## Controller
```typescript
import { Request, Response } from 'express';

class ItemController {
  async create(req: Request, res: Response) {
    try {
      const item = await itemService.create(req.body);
      return res.status(201).json({ success: true, data: item });
    } catch (error) {
      return res.status(400).json({ success: false, error: (error as Error).message });
    }
  }
}

export default new ItemController();
```

## Routes
```typescript
import { Router } from 'express';

const router = Router();
router.post('/', (req, res) => itemController.create(req, res));
router.get('/', (req, res) => itemController.getAll(req, res));

export default router;
```

## Registrar em server.ts
```typescript
import itemRoutes from './modules/item/item.routes';
app.use('/api/items', itemRoutes);
```
