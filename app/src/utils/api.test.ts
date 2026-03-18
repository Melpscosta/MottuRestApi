// Função para testar a conectividade com a API
export const testApiConnection = async (): Promise<{ success: boolean; details: string }> => {
  try {
    console.log('Testando conectividade com a API...');
    
    // Teste simples de conectividade
    const response = await fetch('https://api-mottu-sp3-java-production.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        senha: 'test123'
      }),
    });

    const responseData = await response.json();
    
    console.log('API Status:', response.status);
    console.log('Resposta da API:', JSON.stringify(responseData, null, 2));

    // Se chegou até aqui, a API está respondendo
    const isConnected = response.status !== 500; // Considera erro 500 como falha de conectividade
    
    return {
      success: isConnected,
      details: `Status: ${response.status}, Resposta: ${JSON.stringify(responseData)}`
    };
  } catch (error) {
    console.error('Erro ao testar conectividade com a API:', error);
    return {
      success: false,
      details: `Erro: ${error}`
    };
  }
};

// Função para testar o endpoint de cadastro
export const testRegisterEndpoint = async (): Promise<{ success: boolean; details: string }> => {
  try {
    console.log('Testando endpoint de cadastro...');
    
    const testEmail = `test${Date.now()}@test.com`;
    const response = await fetch('https://api-mottu-sp3-java-production.up.railway.app/api/auth/cadastro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: 'Usuário Teste',
        email: testEmail,
        senha: 'test123'
      }),
    });

    const responseData = await response.json();
    
    console.log('Cadastro Status:', response.status);
    console.log('Resposta do Cadastro:', JSON.stringify(responseData, null, 2));

    const isWorking = response.status === 201 || response.status === 400; // 201 = sucesso, 400 = email já existe
    
    return {
      success: isWorking,
      details: `Status: ${response.status}, Resposta: ${JSON.stringify(responseData)}`
    };
  } catch (error) {
    console.error('Erro ao testar endpoint de cadastro:', error);
    return {
      success: false,
      details: `Erro: ${error}`
    };
  }
};

// Função para testar o formato da resposta da API
export const testApiResponseFormat = async (): Promise<{ success: boolean; details: string }> => {
  try {
    console.log('Testando formato da resposta da API...');
    
    // Teste de login para ver o formato da resposta
    const response = await fetch('https://api-mottu-sp3-java-production.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        senha: 'test123'
      }),
    });

    const responseData = await response.json();
    
    console.log('Formato da resposta:', JSON.stringify(responseData, null, 2));
    
    // Analisar a estrutura da resposta baseada no formato real da API
    const hasToken = 'token' in responseData;
    const hasNome = 'nome' in responseData;
    const hasEmail = 'email' in responseData;
    const hasPerfil = 'perfil' in responseData;
    const hasTipo = 'tipo' in responseData;
    
    const analysis = {
      hasToken,
      hasNome,
      hasEmail,
      hasPerfil,
      hasTipo,
      responseKeys: Object.keys(responseData),
      responseStructure: responseData,
      expectedFormat: {
        token: 'string',
        tipo: 'string',
        nome: 'string',
        email: 'string',
        perfil: 'string'
      }
    };
    
    console.log('Análise da estrutura:', analysis);
    
    // Verificar se tem todos os campos esperados
    const hasExpectedFormat = hasToken && hasNome && hasEmail && hasPerfil && hasTipo;
    
    return {
      success: hasExpectedFormat,
      details: `Análise: ${JSON.stringify(analysis, null, 2)}`
    };
  } catch (error) {
    console.error('Erro ao testar formato da resposta:', error);
    return {
      success: false,
      details: `Erro: ${error}`
    };
  }
};
