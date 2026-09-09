import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showError('Email y password son requeridos');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success && result.user?.tipoUsuario === 1) {
      showSuccess('Bienvenido, administrador');
      router.push('/admin/dashboard');
    } else if (result.success) {
      showError('No tenés permisos para acceder al panel de administración');
    } else {
      showError(result.error || 'Credenciales inválidas');
    }
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen">
      <div className="surface-card p-4 shadow-2 border-round w-full max-w-30rem">
        <div className="text-center mb-5">
          <h2 className="text-3xl font-medium text-900 mb-2">Panel de Administración</h2>
          <span className="text-600 font-medium">Iniciá sesión para continuar</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-900 font-medium mb-2">
              Email
            </label>
            <InputText
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              placeholder="admin@test.com"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-900 font-medium mb-2">
              Contraseña
            </label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              inputClassName="w-full"
              toggleMask
              feedback={false}
              placeholder="Contraseña"
            />
          </div>

          <Button
            type="submit"
            label={loading ? 'Ingresando...' : 'Ingresar'}
            icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
            className="w-full"
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
