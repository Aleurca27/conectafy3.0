'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader, Input, Button } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import Navbar from '@/components/Navbar';
import { sessionsApi } from '@/lib/api';
import { toast } from 'sonner';

export default function NewSessionPage() {
  const router = useRouter();
  const [sessionName, setSessionName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionName.trim()) {
      toast.error('El nombre de la sesión es requerido');
      return;
    }

    setLoading(true);

    try {
      const session = await sessionsApi.create(sessionName);
      toast.success('Sesión creada exitosamente');
      router.push(`/qr/${session.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto p-6 max-w-2xl">
        <Button
          variant="light"
          startContent={<Icon icon="mdi:arrow-left" />}
          onPress={() => router.back()}
          className="mb-6"
        >
          Volver
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Icon icon="mdi:plus-circle" className="text-3xl text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Nueva Sesión de WhatsApp</h1>
                <p className="text-gray-600 text-sm">
                  Crea una nueva conexión de WhatsApp
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleCreate} className="flex flex-col gap-6">
              <Input
                label="Nombre de la Sesión"
                placeholder="Ej: Mi WhatsApp Personal, Soporte Cliente, etc."
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                startContent={<Icon icon="mdi:tag" className="text-gray-400" />}
                description="Dale un nombre descriptivo a esta conexión"
                required
              />

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex gap-2 mb-2">
                  <Icon icon="mdi:information" className="text-blue-600 text-xl" />
                  <p className="font-semibold text-blue-800">
                    ¿Qué sucede al crear una sesión?
                  </p>
                </div>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1 ml-6">
                  <li>Se creará un contenedor Docker dedicado para esta sesión</li>
                  <li>Se generará un código QR para conectar WhatsApp Web</li>
                  <li>Podrás enviar y recibir mensajes desde esta conexión</li>
                  <li>La sesión permanecerá activa hasta que la elimines</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  color="default"
                  variant="flat"
                  onPress={() => router.back()}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={loading}
                  className="flex-1"
                  startContent={!loading && <Icon icon="mdi:check" />}
                >
                  Crear Sesión
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

