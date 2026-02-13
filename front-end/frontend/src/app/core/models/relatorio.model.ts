export interface IRelatorio {
  id?: string;
  userId: string;
  propertyId?: string;
  type: 'inventario' | 'analise';
  title: string;
  content: any;
  response?: string; // Resposta principal (inventário final)
  analise_imagem?: string; // Primeira etapa: análise da imagem de satélite
  comparacao_dados?: string; // Segunda etapa: inventário final com comparação dos dados
  status: 'pendente' | 'processando' | 'concluido' | 'erro';
  createdAt: Date;
  updatedAt: Date;
}
