// Utilitários para permissões granulares por documento

/**
 * Verifica se um usuário tem acesso a um layout específico
 * @param {number} userId - ID do usuário
 * @param {string} userRole - Role do usuário (professor, colaborador, administrador)
 * @param {number} layoutId - ID do layout
 * @returns {boolean} - true se tem acesso, false se restrito
 */
export const canAccessLayout = (userId, userRole, layoutId) => {
  console.log(`🔍 === VERIFICANDO ACESSO AO LAYOUT ===`);
  console.log(`User ID: ${userId}, Role: ${userRole}, Layout ID: ${layoutId}`);
  
  // Admin sempre tem acesso
  if (userRole === 'administrador') {
    console.log(`✅ ADMIN - ACESSO TOTAL AO LAYOUT ${layoutId}`);
    return true;
  }

  // Carregar restrições do localStorage
  const storageKey = `restrictions_${userId}_${userRole}`;
  const savedRestrictions = localStorage.getItem(storageKey);
  
  console.log(`🔑 Storage Key: ${storageKey}`);
  console.log(`📦 Dados salvos: ${savedRestrictions}`);
  
  if (!savedRestrictions) {
    // Se não há configuração salva, por padrão permite acesso
    console.log(`✅ SEM RESTRIÇÕES - PERMITINDO ACESSO AO LAYOUT ${layoutId}`);
    return true;
  }

  try {
    const restrictions = JSON.parse(savedRestrictions);
    const restrictedLayouts = restrictions.layouts || [];
    
    console.log(`📋 Layouts restritos (raw): [${restrictedLayouts.join(', ')}]`);
    
    // Comparar por string para suportar IDs não numéricos (ex: template_1)
    const layoutIdStr = String(layoutId);
    const isRestricted = new Set(restrictedLayouts.map(id => String(id))).has(layoutIdStr);
    
    console.log(`🔠 Comparando por string: '${layoutIdStr}' ∈ [${restrictedLayouts.map(id => String(id)).join(', ')}] => ${isRestricted}`);
    console.log(`🚫 Layout ${layoutId} está restrito? ${isRestricted}`);
    console.log(`✅ Resultado final: ${!isRestricted ? 'PERMITIDO' : 'NEGADO'}`);
    console.log(`🔍 === FIM VERIFICAÇÃO LAYOUT ${layoutId} ===`);
    
    // Se está na lista de restritos, não tem acesso
    return !isRestricted;
  } catch (error) {
    console.error('❌ Erro ao processar restrições de layout:', error);
    // Em caso de erro, permite acesso por segurança
    console.log(`✅ ERRO - PERMITINDO ACESSO POR SEGURANÇA AO LAYOUT ${layoutId}`);
    return true;
  }
};

/**
 * Verifica se um usuário tem acesso a um documento específico
 * @param {number} userId - ID do usuário
 * @param {string} userRole - Role do usuário (professor, colaborador, administrador)
 * @param {number} documentId - ID do documento
 * @returns {boolean} - true se tem acesso, false se restrito
 */
export const canAccessDocument = (userId, userRole, documentId) => {
  console.log(`🔍 === VERIFICANDO ACESSO AO DOCUMENTO ===`);
  console.log(`User ID: ${userId}, Role: ${userRole}, Document ID: ${documentId}`);
  
  // Admin sempre tem acesso
  if (userRole === 'administrador') {
    console.log(`✅ ADMIN - ACESSO TOTAL AO DOCUMENTO ${documentId}`);
    return true;
  }

  // Carregar restrições do localStorage
  const storageKey = `restrictions_${userId}_${userRole}`;
  const savedRestrictions = localStorage.getItem(storageKey);
  
  console.log(`🔑 Storage Key: ${storageKey}`);
  console.log(`📦 Dados salvos: ${savedRestrictions}`);
  
  if (!savedRestrictions) {
    // Se não há configuração salva, por padrão permite acesso
    console.log(`✅ SEM RESTRIÇÕES - PERMITINDO ACESSO AO DOCUMENTO ${documentId}`);
    return true;
  }

  try {
    const restrictions = JSON.parse(savedRestrictions);
    const restrictedDocuments = restrictions.documents || [];
    
    console.log(`📋 Documentos restritos (raw): [${restrictedDocuments.join(', ')}]`);
    
    // Comparar por string para suportar IDs não numéricos (ex: template_1)
    const documentIdStr = String(documentId);
    const isRestricted = new Set(restrictedDocuments.map(id => String(id))).has(documentIdStr);
    
    console.log(`🔠 Comparando por string: '${documentIdStr}' ∈ [${restrictedDocuments.map(id => String(id)).join(', ')}] => ${isRestricted}`);
    console.log(`🚫 Documento ${documentId} está restrito? ${isRestricted}`);
    console.log(`✅ Resultado final: ${!isRestricted ? 'PERMITIDO' : 'NEGADO'}`);
    console.log(`🔍 === FIM VERIFICAÇÃO DOCUMENTO ${documentId} ===`);
    
    // Se está na lista de restritos, não tem acesso
    return !isRestricted;
  } catch (error) {
    console.error('❌ Erro ao processar restrições de documento:', error);
    // Em caso de erro, permite acesso por segurança
    console.log(`✅ ERRO - PERMITINDO ACESSO POR SEGURANÇA AO DOCUMENTO ${documentId}`);
    return true;
  }
};

/**
 * Filtra uma lista de layouts baseado nas permissões granulares
 * @param {Array} layouts - Lista de layouts
 * @param {number} userId - ID do usuário
 * @param {string} userRole - Role do usuário
 * @returns {Array} - Lista filtrada de layouts
 */
export const filterAllowedLayouts = (layouts, userId, userRole) => {
  // Admin vê todos
  if (userRole === 'administrador') {
    return layouts;
  }

  // Filtrar apenas layouts com acesso permitido
  return layouts.filter(layout => canAccessLayout(userId, userRole, layout.id));
};

/**
 * Filtra uma lista de documentos baseado nas permissões granulares
 * @param {Array} documents - Lista de documentos
 * @param {number} userId - ID do usuário
 * @param {string} userRole - Role do usuário
 * @returns {Array} - Lista filtrada de documentos
 */
export const filterAllowedDocuments = (documents, userId, userRole) => {
  console.log(`🔍 === INICIANDO FILTRO DE DOCUMENTOS ===`);
  console.log(`Total de documentos: ${documents.length}`);
  console.log(`User ID: ${userId}, User Role: ${userRole}`);
  
  // Admin vê todos
  if (userRole === 'administrador') {
    console.log(`✅ ADMIN - RETORNANDO TODOS OS ${documents.length} DOCUMENTOS`);
    return documents;
  }

  // Verificar se há restrições salvas
  const storageKey = `restrictions_${userId}_${userRole}`;
  const savedRestrictions = localStorage.getItem(storageKey);
  console.log(`🔑 Verificando restrições no localStorage: ${storageKey}`);
  console.log(`📦 Dados encontrados: ${savedRestrictions ? 'SIM' : 'NÃO'}`);
  
  if (savedRestrictions) {
    try {
      const restrictions = JSON.parse(savedRestrictions);
      console.log(`📋 Restrições carregadas:`, restrictions);
    } catch (e) {
      console.error(`❌ Erro ao fazer parse das restrições:`, e);
    }
  }

  // Preparar conjunto de IDs restritos (string) para checagem rápida
  const restrictionsRaw = localStorage.getItem(`restrictions_${userId}_${userRole}`);
  let restrictedSetDocs = new Set();
  if (restrictionsRaw) {
    try {
      const parsed = JSON.parse(restrictionsRaw);
      restrictedSetDocs = new Set((parsed.documents || []).map(id => String(id)));
      console.log('📋 Conjunto de documentos restritos (set):', Array.from(restrictedSetDocs));
    } catch (e) {
      console.error('❌ Erro ao parsear restrições para filtro:', e);
    }
  }

  // Filtrar apenas documentos com acesso permitido
  const filteredDocuments = documents.filter(document => {
    // Considerar múltiplas chaves possíveis do mesmo documento
    const keys = [document.id, document.template_id].filter(Boolean).map(id => String(id));
    const isRestricted = keys.some(k => restrictedSetDocs.has(k));

    const docName = document.name || document.title || `ID: ${document.id}`;
    const docType = document.status || 'normal';
    console.log(`📄 Documento "${docName}" (keys: [${keys.join(', ')}], Tipo: ${docType}): ${!isRestricted ? 'INCLUÍDO' : 'EXCLUÍDO'}`);

    return !isRestricted;
  });
  
  console.log(`🔍 RESULTADO FILTRO: ${filteredDocuments.length} de ${documents.length} documentos permitidos`);
  console.log(`🔍 === FIM FILTRO DOCUMENTOS ===`);
  
  return filteredDocuments;
};

/**
 * Obtém informações sobre as permissões granulares de um usuário
 * @param {number} userId - ID do usuário
 * @param {string} userRole - Role do usuário
 * @returns {Object} - Objeto com estatísticas das permissões
 */
export const getGranularPermissionsInfo = (userId, userRole) => {
  if (userRole === 'administrador') {
    return {
      hasRestrictions: false,
      restrictedLayouts: [],
      restrictedDocuments: [],
      allowedLayouts: 'all',
      allowedDocuments: 'all'
    };
  }

  const savedRestrictions = localStorage.getItem(`restrictions_${userId}_${userRole}`);
  
  if (!savedRestrictions) {
    return {
      hasRestrictions: true,
      restrictedLayouts: 'all',
      restrictedDocuments: 'all',
      allowedLayouts: [],
      allowedDocuments: []
    };
  }

  const restrictions = JSON.parse(savedRestrictions);
  
  return {
    hasRestrictions: true,
    restrictedLayouts: restrictions.layouts || [],
    restrictedDocuments: restrictions.documents || [],
    allowedLayouts: restrictions.layouts ? 'filtered' : [],
    allowedDocuments: restrictions.documents ? 'filtered' : []
  };
};

/**
 * Debug: Log das permissões granulares de um usuário
 * @param {number} userId - ID do usuário
 * @param {string} userRole - Role do usuário
 */
export const debugGranularPermissions = (userId, userRole) => {
  console.log('🔍 === DEBUG PERMISSÕES GRANULARES ===');
  console.log('User ID:', userId);
  console.log('User Role:', userRole);
  
  const info = getGranularPermissionsInfo(userId, userRole);
  console.log('Permissions Info:', info);
  
  const savedRestrictions = localStorage.getItem(`restrictions_${userId}_${userRole}`);
  console.log('Raw localStorage data:', savedRestrictions);
  
  console.log('=== FIM DEBUG PERMISSÕES GRANULARES ===');
};