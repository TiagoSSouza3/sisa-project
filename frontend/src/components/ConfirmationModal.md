# Sistema de Confirmação de Exclusão e Edição

Este sistema fornece um modal de confirmação reutilizável para ações de exclusão e edição em todo o site.

## Componentes

### ConfirmationModal
Modal responsivo e acessível para confirmações.

### useConfirmation Hook
Hook personalizado para gerenciar o estado do modal de confirmação.

## Como Usar

### 1. Importar os componentes necessários

```javascript
import ConfirmationModal from '../../components/ConfirmationModal';
import useConfirmation from '../../hooks/useConfirmation';
```

### 2. Usar o hook no componente

```javascript
const { confirmationState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmation();
```

### 3. Configurar a confirmação para exclusão

```javascript
const handleDelete = async (id) => {
  const item = items.find(item => item.id === id);
  
  showConfirmation({
    type: 'delete',
    title: language === "english" ? "Delete Item" : "Excluir Item",
    message: language === "english" 
      ? `Are you sure you want to delete "${item?.name}"? This action cannot be undone.`
      : `Tem certeza que deseja excluir "${item?.name}"? Esta ação não pode ser desfeita.`,
    onConfirm: async () => {
      await API.delete(`/items/${id}`);
      // Atualizar estado local
    }
  });
};
```

### 4. Configurar a confirmação para edição

```javascript
const handleEdit = (id) => {
  const item = items.find(item => item.id === id);
  
  showConfirmation({
    type: 'edit',
    title: language === "english" ? "Edit Item" : "Editar Item",
    message: language === "english" 
      ? `Do you want to edit "${item?.name}"?`
      : `Deseja editar "${item?.name}"?`,
    confirmText: language === "english" ? "Edit" : "Editar",
    onConfirm: () => navigate(`/edit/${id}`)
  });
};
```

### 5. Adicionar o modal ao JSX

```javascript
return (
  <div>
    {/* Seu conteúdo */}
    
    <ConfirmationModal
      isOpen={confirmationState.isOpen}
      onClose={hideConfirmation}
      onConfirm={handleConfirm}
      title={confirmationState.title}
      message={confirmationState.message}
      confirmText={confirmationState.confirmText}
      cancelText={confirmationState.cancelText}
      type={confirmationState.type}
      isLoading={confirmationState.isLoading}
    />
  </div>
);
```

## Propriedades do ConfirmationModal

- `isOpen`: Boolean - Controla se o modal está visível
- `onClose`: Function - Função chamada ao fechar o modal
- `onConfirm`: Function - Função chamada ao confirmar a ação
- `title`: String - Título do modal (opcional, usa padrão baseado no tipo)
- `message`: String - Mensagem do modal (opcional, usa padrão baseado no tipo)
- `confirmText`: String - Texto do botão de confirmação (opcional)
- `cancelText`: String - Texto do botão de cancelar (opcional)
- `type`: String - Tipo do modal ('delete' ou 'edit')
- `isLoading`: Boolean - Mostra loading no botão de confirmação

## Características

- ✅ Responsivo (mobile-first)
- ✅ Acessível (suporte a teclado e screen readers)
- ✅ Suporte a múltiplos idiomas
- ✅ Animações suaves
- ✅ Dark mode support
- ✅ Loading states
- ✅ Portal rendering (evita problemas de z-index)

## Páginas Atualizadas

- Storage (exclusão de itens e navegação para log)
- Users (exclusão e edição de usuários)
- AllDocuments (exclusão de documentos)
- LayoutsList (exclusão de layouts)
- Students (edição de alunos)
- Subjects (edição de disciplinas)
