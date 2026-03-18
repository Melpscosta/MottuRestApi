import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useAuth } from '@/src/hooks/useAuth';
import { useApi } from '@/src/hooks/useApi';
import { testApiConnection, testRegisterEndpoint, testApiResponseFormat } from '@/src/utils/api.test';

export default function AuthExample() {
  const { user, login, register, logout, isAuthenticated } = useAuth();
  const { makeAuthenticatedRequest, isLoading, error } = useApi({
    onUnauthorized: () => {
      Alert.alert('Erro', 'Sessão expirada. Faça login novamente.');
    }
  });

  const [testResults, setTestResults] = useState<string>('');

  const handleTestApiConnection = async () => {
    try {
      const connectionTest = await testApiConnection();
      const registerTest = await testRegisterEndpoint();
      const formatTest = await testApiResponseFormat();
      
      setTestResults(`
        Conectividade da API: ${connectionTest.success ? '✅ OK' : '❌ Falhou'}
        ${connectionTest.details}
        
        Endpoint de Cadastro: ${registerTest.success ? '✅ OK' : '❌ Falhou'}
        ${registerTest.details}
        
        Formato da Resposta: ${formatTest.success ? '✅ OK' : '❌ Falhou'}
        ${formatTest.details}
      `);
    } catch (error) {
      setTestResults(`Erro nos testes: ${error}`);
    }
  };

  const handleTestAuthenticatedRequest = async () => {
    if (!isAuthenticated) {
      Alert.alert('Erro', 'Faça login primeiro');
      return;
    }

    try {
      // Exemplo de requisição autenticada
      const result = await makeAuthenticatedRequest('/api/test', {
        method: 'GET'
      });
      
      Alert.alert('Sucesso', 'Requisição autenticada funcionou!');
    } catch (error) {
      Alert.alert('Erro', `Falha na requisição: ${error}`);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Exemplo de Autenticação
      </Text>

      {user ? (
        <View>
          <Text>Usuário logado: {user.displayName}</Text>
          <Text>Email: {user.email}</Text>
          <Button title="Logout" onPress={logout} />
        </View>
      ) : (
        <View>
          <Text>Nenhum usuário logado</Text>
          <Button 
            title="Testar Login" 
            onPress={() => {
              // Exemplo de login
              login('test@example.com', 'password123')
                .then(() => Alert.alert('Sucesso', 'Login realizado!'))
                .catch(error => Alert.alert('Erro', error.message));
            }} 
          />
          <Button 
            title="Testar Cadastro" 
            onPress={() => {
              // Exemplo de cadastro
              register('Usuário Teste', 'test@example.com', 'password123')
                .then(() => Alert.alert('Sucesso', 'Cadastro realizado!'))
                .catch(error => Alert.alert('Erro', error.message));
            }} 
          />
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Testar Conectividade da API" onPress={handleTestApiConnection} />
        {testResults ? (
          <Text style={{ marginTop: 10, fontFamily: 'monospace' }}>
            {testResults}
          </Text>
        ) : null}
      </View>

      {isAuthenticated && (
        <View style={{ marginTop: 20 }}>
          <Button 
            title="Testar Requisição Autenticada" 
            onPress={handleTestAuthenticatedRequest} 
          />
        </View>
      )}

      {error && (
        <Text style={{ color: 'red', marginTop: 10 }}>
          Erro da API: {error}
        </Text>
      )}

      {isLoading && (
        <Text style={{ marginTop: 10 }}>
          Carregando...
        </Text>
      )}
    </View>
  );
}
