# 🌱 Sistema de Inventário Rural - Visão Executiva

## 📌 O QUE É

Sistema web para **produtores rurais** criarem **inventários** de suas propriedades através de:
1. Questionário simples (7+ perguntas)
2. Verificação por satélite
3. Relatório consolidado

---

## 🎯 PARA QUEM

**Produtor Rural** que possui **CAR** (Cadastro Ambiental Rural).

**Apenas isso!** Sem cooperativas, sem auditores, sem marketplace.

---

## 🔄 COMO FUNCIONA

```
┌──────────────┐
│ 1. CADASTRO  │  Produtor cria conta (nome, email, CAR)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 2. RESPONDE  │  7+ perguntas sobre a propriedade
│ QUESTIONÁRIO │  (área, produção, práticas, etc.)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 3. SISTEMA   │  Busca propriedade via CAR
│ BUSCA NO CAR │  Obtém coordenadas
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 4. GERA      │  Imagem de satélite
│ IMAGEM       │  Polígono sobre a propriedade
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 5. RELATÓRIO │  Consolidação dos dados
│ FINAL        │  Visualização e exportação
└──────────────┘
```

---

## ✅ O QUE FAZ

- ✅ Cadastro de produtor
- ✅ Questionário objetivo
- ✅ Verificação por satélite
- ✅ Identificação visual da propriedade
- ✅ Geração de relatório

---

## ❌ O QUE NÃO FAZ

- ❌ Auditoria
- ❌ Cooperativas
- ❌ Marketplace
- ❌ Créditos de carbono
- ❌ Certificação oficial
- ❌ Blockchain

---

## 📝 AS 7+ PERGUNTAS

1. **Área Total** (hectares)
2. **Tipo de Produção** (grãos, pecuária, etc.)
3. **Práticas Sustentáveis** (plantio direto, rotação, etc.)
4. **APP** - Área de Preservação Permanente
5. **Reserva Legal**
6. **Uso de Agroquímicos**
7. **Gestão de Resíduos**

---

## 🛰️ SATÉLITE

- Integração com **Sentinel Hub**
- Imagens reais da propriedade
- Polígono desenhado sobre a área
- Identificação visual clara

---

## 🔮 FUTURO

**Fase 4: Cálculo**
- Analisar dados coletados
- Calcular compensação vs produção
- Indicar: "Devendo" ou "Compensando"
- Sugerir melhorias

---

## 🚀 TECNOLOGIAS

- **Backend:** Node.js + TypeScript + Express
- **Banco:** Firebase/Firestore
- **Satélite:** Sentinel Hub API
- **Imagens:** Sharp (processamento)
- **API CAR:** Integração oficial

---

## 📊 ESTRUTURA

```
Usuário (Produtor)
    ↓
Propriedade
    ↓ possui
Questionário (7+ respostas)
    ↓ possui
Verificação Satélite (imagem + polígono)
    ↓ gera
Relatório/Inventário
```

---

## 🎯 FOCO

**Simplicidade · Objetividade · Clareza**

> "Cadastro → Questionário → Satélite → Relatório"

**NUNCA ultrapasse este escopo!**

---

## 📖 DOCUMENTAÇÃO

- **[README.md](./README.md)** - Guia completo
- **[ESCOPO_DO_SISTEMA.md](./ESCOPO_DO_SISTEMA.md)** - Escopo detalhado ⚠️ IMPORTANTE
- **[CHANGELOG_SCOPE_REFACTOR.md](./CHANGELOG_SCOPE_REFACTOR.md)** - Mudanças recentes
- **[POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)** - Como testar
- **[SATELLITE_GUIDE.md](./SATELLITE_GUIDE.md)** - Satélite

---

## ⚠️ REGRA DE OURO

**Antes de implementar QUALQUER funcionalidade:**

1. ✅ Está no escopo?
2. ✅ É necessário para o questionário/relatório?
3. ✅ Mantém a simplicidade?

**Se alguma resposta for NÃO, não implemente!**

---

## 🤝 CONTRIBUINDO

1. Leia `ESCOPO_DO_SISTEMA.md`
2. Mantenha o foco no core
3. Não adicione complexidade
4. Priorize a experiência do produtor

---

**Desenvolvido com foco absoluto no essencial** 🌱
