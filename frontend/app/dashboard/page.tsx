'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { sessionsApi, Session } from '@/lib/api';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, setUser, sessions, setSessions } = useStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    connectedSessions: 0,
    disconnectedSessions: 0,
  });

  useEffect(() => {
    checkAuth();
    loadSessions();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }

    setUser(session.user);
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionsApi.getAll();
      setSessions(data);
      
      // Calcular estadísticas
      setStats({
        totalSessions: data.length,
        connectedSessions: data.filter((s) => s.status === 'connected').length,
        disconnectedSessions: data.filter((s) => s.status === 'disconnected').length,
      });
    } catch (error) {
      toast.error('Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'warning';
      case 'disconnected':
        return 'default';
      case 'error':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'connecting':
        return 'Conectando';
      case 'disconnected':
        return 'Desconectado';
      case 'error':
        return 'Error';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Gestiona tus conexiones de WhatsApp
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            startContent={<Icon icon="mdi:plus" />}
            onPress={() => router.push('/sessions/new')}
          >
            Nueva Sesión
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardBody className="flex flex-row items-center gap-4 p-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Icon
                  icon="mdi:whatsapp"
                  className="text-4xl text-blue-600"
                />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Sesiones</p>
                <p className="text-3xl font-bold">{stats.totalSessions}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-row items-center gap-4 p-6">
              <div className="p-3 bg-green-100 rounded-lg">
                <Icon
                  icon="mdi:check-circle"
                  className="text-4xl text-green-600"
                />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Conectadas</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.connectedSessions}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex flex-row items-center gap-4 p-6">
              <div className="p-3 bg-red-100 rounded-lg">
                <Icon
                  icon="mdi:close-circle"
                  className="text-4xl text-red-600"
                />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Desconectadas</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.disconnectedSessions}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sessions List */}
        <Card>
          <CardHeader className="flex justify-between">
            <h2 className="text-2xl font-bold">Sesiones Recientes</h2>
            <Button
              variant="light"
              endContent={<Icon icon="mdi:arrow-right" />}
              onPress={() => router.push('/sessions')}
            >
              Ver todas
            </Button>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <Icon
                  icon="mdi:whatsapp"
                  className="text-6xl text-gray-300 mx-auto mb-4"
                />
                <p className="text-gray-600 mb-4">
                  No tienes sesiones de WhatsApp
                </p>
                <Button
                  color="primary"
                  onPress={() => router.push('/sessions/new')}
                >
                  Crear primera sesión
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.slice(0, 6).map((session) => (
                  <Card key={session.id} className="border">
                    <CardBody className="gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-lg">
                            {session.session_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {session.phone_number || 'Sin número'}
                          </p>
                        </div>
                        <Chip
                          color={getStatusColor(session.status)}
                          size="sm"
                          variant="flat"
                        >
                          {getStatusText(session.status)}
                        </Chip>
                      </div>
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => router.push(`/sessions/${session.id}`)}
                      >
                        Ver detalles
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

