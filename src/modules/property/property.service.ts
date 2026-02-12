import { db } from '../../config/firebase.config';
import { PropertyModel, IProperty } from './property.model';
import carApiService from '../../services/car-api.service';
import auditService from '../audit/audit.service';

class PropertyService {
  private collectionRef = db.collection('properties');

  async create(data: Partial<IProperty>): Promise<PropertyModel> {
    const property = new PropertyModel(data);

    const validation = property.validate();
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const existingProperty = await this.findByCarNumber(property.carData.number);
    if (existingProperty) {
      throw new Error('Propriedade com este CAR já cadastrada');
    }

    const docRef = await this.collectionRef.add(property.toFirestore());
    const doc = await docRef.get();
    
    await auditService.log({
      action: 'Property_Created',
      propertyId: doc.id,
      newValue: property.toFirestore(),
      triggeredBy: property.ownerId
    });

    return new PropertyModel({ id: doc.id, ...doc.data() });
  }

  async syncCarData(propertyId: string, carNumber: string): Promise<PropertyModel> {
    const isValid = await carApiService.validateCarNumber(carNumber);
    if (!isValid) {
      throw new Error('Número do CAR inválido');
    }

    const carData = await carApiService.fetchCarData(carNumber);
    if (!carData) {
      throw new Error('Não foi possível obter dados do CAR');
    }

    const docRef = this.collectionRef.doc(propertyId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Propriedade não encontrada');
    }

    const updatedData: Partial<IProperty> = {
      carData: {
        number: carNumber,
        legalReserve: carData.area_reserva_legal,
        app: carData.area_app,
        validated: true,
        validatedAt: new Date()
      },
      location: {
        city: carData.municipio,
        state: carData.uf,
        center: {
          lat: carData.latitude,
          lng: carData.longitude
        }
      },
      areaDetails: {
        total: carData.area_total,
        forest: carData.area_reserva_legal + carData.area_app,
        app: carData.area_app,
        productive: carData.area_produtiva,
        legalReserve: carData.area_reserva_legal
      },
      geoJson: carData.geometria,
      status: 'Active',
      updatedAt: new Date()
    };

    await docRef.update(updatedData);

    await auditService.log({
      action: 'Property_Validated',
      propertyId: propertyId,
      previousValue: doc.data(),
      newValue: updatedData,
      triggeredBy: 'system'
    });

    const updated = await docRef.get();
    return new PropertyModel({ id: updated.id, ...updated.data() });
  }

  async findAll(limit = 50): Promise<PropertyModel[]> {
    const snapshot = await this.collectionRef.limit(limit).get();
    
    if (snapshot.empty) {
      return [];
    }

    const properties: PropertyModel[] = [];
    snapshot.forEach(doc => {
      properties.push(new PropertyModel({ id: doc.id, ...doc.data() }));
    });

    return properties;
  }

  async findById(id: string): Promise<PropertyModel> {
    const doc = await this.collectionRef.doc(id).get();

    if (!doc.exists) {
      throw new Error('Propriedade não encontrada');
    }

    return new PropertyModel({ id: doc.id, ...doc.data() });
  }

  async findByOwnerId(ownerId: string): Promise<PropertyModel[]> {
    const snapshot = await this.collectionRef
      .where('ownerId', '==', ownerId)
      .get();

    if (snapshot.empty) {
      return [];
    }

    const properties: PropertyModel[] = [];
    snapshot.forEach(doc => {
      properties.push(new PropertyModel({ id: doc.id, ...doc.data() }));
    });

    return properties;
  }

  async findByCarNumber(carNumber: string): Promise<PropertyModel | null> {
    const snapshot = await this.collectionRef
      .where('carData.number', '==', carNumber)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return new PropertyModel({ id: doc.id, ...doc.data() });
  }

  async findWithoutCluster(): Promise<PropertyModel[]> {
    const snapshot = await this.collectionRef
      .where('pooling.isInCluster', '==', false)
      .where('status', '==', 'Active')
      .get();

    if (snapshot.empty) {
      return [];
    }

    const properties: PropertyModel[] = [];
    snapshot.forEach(doc => {
      properties.push(new PropertyModel({ id: doc.id, ...doc.data() }));
    });

    return properties;
  }

  async updateStatus(id: string, status: 'Active' | 'Pending' | 'Alert'): Promise<PropertyModel> {
    const docRef = this.collectionRef.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Propriedade não encontrada');
    }

    const previousStatus = doc.data()?.status;

    await docRef.update({
      status: status,
      updatedAt: new Date()
    });

    await auditService.log({
      action: 'Status_Changed',
      propertyId: id,
      previousValue: previousStatus,
      newValue: status,
      triggeredBy: 'system'
    });

    const updated = await docRef.get();
    return new PropertyModel({ id: updated.id, ...updated.data() });
  }

  async delete(id: string): Promise<PropertyModel> {
    const docRef = this.collectionRef.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Propriedade não encontrada');
    }

    await docRef.delete();
    return new PropertyModel({ id: doc.id, ...doc.data() });
  }
}

export default new PropertyService();
