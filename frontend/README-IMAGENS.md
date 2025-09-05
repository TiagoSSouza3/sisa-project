# 🖼️ Sistema de Rotação de Imagens - Login

Este sistema permite que você tenha uma animação de rotação de imagens na tela de login, alternando automaticamente entre múltiplas imagens.

## ✨ Funcionalidades

- **Rotação Automática**: As imagens alternam automaticamente a cada 3 segundos
- **Navegação Manual**: Clique nos indicadores para navegar manualmente
- **Transição Suave**: Animação de transição de 0.5 segundos entre as imagens
- **Indicadores Visuais**: Pontos na parte inferior mostram qual imagem está ativa

## 📁 Estrutura de Arquivos

```
frontend/src/
├── assets/
│   └── login-images/          # Pasta com as imagens
│       ├── image1.jpg
│       ├── image2.jpg
│       └── ...
├── config/
│   └── imageConfig.js         # Configuração das imagens
└── pages/
    └── Login.js               # Componente principal
```

## 🚀 Como Adicionar Novas Imagens

### Método 1: Manual (Recomendado para poucas imagens)

1. **Coloque a imagem** na pasta `frontend/src/assets/login-images/`
2. **Abra** `frontend/src/config/imageConfig.js`
3. **Adicione o import**:
   ```javascript
   import minhaImagem from '../assets/login-images/minha-imagem.jpg';
   ```
4. **Adicione ao array**:
   ```javascript
   export const loginImages = [
     image1, image2, image3, image4, image5, minhaImagem
   ];
   ```

### Método 2: Script Automático (Para muitas imagens)

1. **Coloque a imagem** na pasta `frontend/src/assets/login-images/`
2. **Execute o script**:
   ```bash
   cd frontend
   node scripts/add-image.js minha-imagem.jpg
   ```

## ⚙️ Configurações

Você pode ajustar as configurações no arquivo `frontend/src/config/imageConfig.js`:

```javascript
export const animationConfig = {
  interval: 3000,        // Tempo entre trocas (3 segundos)
  transitionDuration: 500 // Duração da transição (0.5 segundos)
};
```

## 🎨 Personalização

### Mudar o Intervalo de Troca
```javascript
// Em imageConfig.js
export const animationConfig = {
  interval: 5000, // 5 segundos
  transitionDuration: 500
};
```

### Mudar a Duração da Transição
```javascript
// Em imageConfig.js
export const animationConfig = {
  interval: 3000,
  transitionDuration: 1000 // 1 segundo
};
```

### Estilizar os Indicadores
Edite os estilos em `frontend/src/styles/login.css`:
```css
.indicator {
  width: 15px;           /* Tamanho dos pontos */
  height: 15px;
  background: #ffffff;   /* Cor dos pontos */
}
```

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

## 🔧 Solução de Problemas

### Imagem não aparece
1. Verifique se o arquivo está na pasta correta
2. Confirme se o import está correto
3. Reinicie o servidor de desenvolvimento

### Erro de import
- Certifique-se de que a imagem está dentro da pasta `src/`
- Use apenas imagens suportadas (jpg, png, gif, webp)

### Performance
- Use imagens otimizadas (recomendado: max 1MB por imagem)
- Formato recomendado: WebP ou JPEG otimizado

## 📝 Exemplo Completo

Para adicionar 20 imagens:

1. **Coloque as 20 imagens** em `frontend/src/assets/login-images/`
2. **Execute o script para cada uma**:
   ```bash
   node scripts/add-image.js imagem1.jpg
   node scripts/add-image.js imagem2.jpg
   # ... repita para todas as 20 imagens
   ```

Ou edite manualmente o `imageConfig.js` com todos os imports e adicione ao array.

## 🎯 Dicas

- **Nomes de arquivo**: Use nomes descritivos (ex: `campus-universitario.jpg`)
- **Tamanho**: Mantenha as imagens com proporções similares
- **Qualidade**: Use imagens de alta qualidade para melhor aparência
- **Quantidade**: Recomendado máximo de 10-15 imagens para boa performance
