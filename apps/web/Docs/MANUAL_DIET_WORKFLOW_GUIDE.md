# Manual Diet Workflow System - User Guide

## Sistema Completo de Gestão de Dietas Personalizadas

Este sistema permite que a Dra. Jackie gerencie todo o processo de criação e entrega de dietas personalizadas, desde o recebimento de formulários até a entrega final para o cliente.

## 🔄 Fluxo Completo de Trabalho

### 1. **Recebimento de Formulários**
- Clientes preenchem formulários de avaliação nutricional
- Dados são automaticamente salvos no banco de dados Supabase
- Dra. Jackie recebe notificação por email sobre nova submissão
- Status inicial: "pending"

### 2. **Painel Administrativo** (`/admin`)
- Dashboard com estatísticas de formulários (pendentes, em análise, concluídos)
- Lista de todos os formulários recebidos
- Filtros por status e busca por nome/email
- Acesso direto para revisar cada formulário

### 3. **Revisão de Formulários** (`/admin/form-review/[id]`)
- Visualização completa das respostas do cliente
- Cálculo automático de necessidades nutricionais (TMB, calorias, macronutrientes)
- Recomendações de templates baseadas no perfil do cliente
- Seleção de template base para o plano alimentar
- Adição de notas personalizadas

### 4. **Customização da Dieta** (`/admin/diet-customize/[id]`)
- Interface para personalizar o plano alimentar
- Biblioteca de alimentos organizados por categoria
- Ajuste de porções e quantidades para cada refeição
- Cálculo automático de valores nutricionais
- Comparação com metas nutricionais do cliente
- Adição de observações e instruções especiais

### 5. **Publicação e Entrega**
- Aprovação final e publicação da dieta
- Geração de link seguro com token de acesso
- Envio automático de email para o cliente
- Link válido por 90 dias

### 6. **Visualização pelo Cliente** (`/diet-view?token=...`)
- Interface limpa e profissional para o cliente
- Plano alimentar completo com horários das refeições
- Informações nutricionais detalhadas
- Instruções de preparo e observações da Dra. Jackie
- Acesso seguro por token único

## 📊 Base de Dados

### Templates de Dieta Pré-configurados
O sistema inclui templates organizados por:
- **Objetivos**: Emagrecimento, Ganho Muscular, Manutenção
- **Nível de Atividade**: Sedentário, Leve, Moderado, Ativo, Muito Ativo
- **Faixas Calóricas**: Adequadas para diferentes perfis

### Biblioteca de Alimentos
Mais de 50 alimentos organizados por categorias:
- Café da manhã
- Proteínas
- Carboidratos
- Vegetais
- Gorduras saudáveis
- Lanches

## 🔧 Funcionalidades Técnicas

### Segurança
- Acesso por tokens únicos e temporários
- Políticas de segurança (RLS) no banco de dados
- Links com data de expiração

### Notificações
- Emails automáticos para a Dra. Jackie (novos formulários)
- Emails automáticos para clientes (dieta pronta)
- Fallback para EmailJS caso o banco não esteja disponível

### Cálculos Automáticos
- Taxa Metabólica Basal (TMB) usando fórmula de Harris-Benedict
- Gasto energético total baseado no nível de atividade
- Distribuição de macronutrientes
- Soma automática de valores nutricionais por refeição

## 🚀 Como Usar o Sistema

### Para a Dra. Jackie:

1. **Acesse o painel**: Vá para `/admin`
2. **Revise formulários**: Clique em "Revisar" nos formulários pendentes
3. **Selecione template**: Escolha o template mais adequado ao perfil
4. **Customize a dieta**: Ajuste alimentos, porções e adicione orientações
5. **Publique**: Finalize e envie automaticamente para o cliente

### Para os Clientes:

1. **Preencham o formulário**: Formulários de avaliação nutricional
2. **Aguardem o email**: Notificação quando a dieta estiver pronta
3. **Acessem o plano**: Link seguro enviado por email
4. **Sigam as orientações**: Plano detalhado com todas as instruções

## 📱 Responsividade

Todo o sistema é totalmente responsivo e funciona perfeitamente em:
- Desktop
- Tablets
- Smartphones

## 🎨 Design

- Interface limpa e profissional
- Cores da marca (tons de verde/esmeralda)
- Fácil navegação e uso intuitivo
- Elementos visuais para melhor experiência

## 📈 Benefícios do Sistema

1. **Eficiência**: Automatiza grande parte do processo manual
2. **Profissionalismo**: Interface elegante para clientes
3. **Organização**: Todos os dados centralizados e organizados
4. **Acessibilidade**: Clientes acessam dietas de qualquer lugar
5. **Controle**: Dra. Jackie mantém controle total sobre cada dieta
6. **Escalabilidade**: Sistema preparado para crescimento

---

## 🔍 Status de Implementação

✅ **Concluído:**
- Database schema completo
- Serviço de submissão de formulários
- Painel administrativo
- Interface de revisão de formulários
- Página de customização de dietas
- Visualizador para clientes
- Sistema de notificações por email

🎯 **Pronto para Uso!**

O sistema está completamente funcional e pronto para ser utilizado. Todos os componentes foram testados e integrados.

---

*Sistema desenvolvido para otimizar o atendimento nutricional da Dra. Jackie, mantendo a qualidade e personalização que seus pacientes merecem.*
