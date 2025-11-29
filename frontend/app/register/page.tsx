'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Input, Button } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast.success('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardBody className="gap-4 p-8">
          {/* Logo y título */}
          <div className="text-center mb-4">
            <div className="flex justify-center mb-4">
              <Icon
                icon="logos:whatsapp-icon"
                className="text-6xl"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Conectafy</h1>
            <p className="text-gray-600 mt-2">Crea tu cuenta</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <Input
              type="email"
              label="Email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={
                <Icon icon="mdi:email" className="text-gray-400" />
              }
              required
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={
                <Icon icon="mdi:lock" className="text-gray-400" />
              }
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'}
                    className="text-gray-400"
                  />
                </button>
              }
              required
            />

            <Input
              type={showPassword ? 'text' : 'password'}
              label="Confirmar Contraseña"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              startContent={
                <Icon icon="mdi:lock-check" className="text-gray-400" />
              }
              required
            />

            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              Registrarse
            </Button>
          </form>

          {/* Link a login */}
          <div className="text-center mt-4">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <a
                href="/login"
                className="text-primary font-semibold hover:underline"
              >
                Inicia sesión aquí
              </a>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

