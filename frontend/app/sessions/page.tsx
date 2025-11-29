'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { sessionsApi } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SessionsPage() {
  const router = useRouter();
  const { sessions, setSessions } = useStore();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionsApi.getAll();
      setSessions(data);
    } catch (error) {
      toast.error('Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = async (sessionId: string) => {
    try {
      setActionLoading(sessionId);
      await sessionsApi.restart(sessionId);
      toast.success('Sesión reiniciada');
      loadSessions();
    } catch (error) {
      toast.error('Error al reiniciar sesión');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta sesión?')) return;

    try {
      setActionLoading(sessionId);
      await sessionsApi.delete(sessionId);
      toast.success('Sesión eliminada');
      loadSessions();
    } catch (error) {
      toast.error('Error al eliminar sesión');
    } finally {
      setActionLoading(null);
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
            <h1 className="text-4xl font-bold text-gray-800">
              Sesiones de WhatsApp
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona todas tus conexiones de WhatsApp
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

        {/* Sessions Table */}
        <Card>
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
              <Table aria-label="Sessions table">
                <TableHeader>
                  <TableColumn>NOMBRE</TableColumn>
                  <TableColumn>NÚMERO</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                  <TableColumn>ÚLTIMA CONEXIÓN</TableColumn>
                  <TableColumn>ACCIONES</TableColumn>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="mdi:whatsapp"
                            className="text-2xl text-green-600"
                          />
                          <span className="font-semibold">
                            {session.session_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {session.phone_number || (
                          <span className="text-gray-400">Sin número</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getStatusColor(session.status)}
                          size="sm"
                          variant="flat"
                        >
                          {getStatusText(session.status)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        {session.last_connected_at ? (
                          format(
                            new Date(session.last_connected_at),
                            "dd MMM yyyy, HH:mm",
                            { locale: es }
                          )
                        ) : (
                          <span className="text-gray-400">Nunca</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {session.status === 'disconnected' && (
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              onPress={() => router.push(`/qr/${session.id}`)}
                              isLoading={actionLoading === session.id}
                            >
                              Conectar
                            </Button>
                          )}
                          
                          {session.status === 'connected' && (
                            <Button
                              size="sm"
                              color="success"
                              variant="flat"
                              onPress={() => router.push(`/chat?session=${session.id}`)}
                            >
                              Abrir Chat
                            </Button>
                          )}

                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                              >
                                <Icon icon="mdi:dots-vertical" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Session actions">
                              <DropdownItem
                                key="restart"
                                startContent={<Icon icon="mdi:restart" />}
                                onPress={() => handleRestart(session.id)}
                              >
                                Reiniciar
                              </DropdownItem>
                              <DropdownItem
                                key="logs"
                                startContent={<Icon icon="mdi:text-box" />}
                                onPress={() => router.push(`/sessions/${session.id}/logs`)}
                              >
                                Ver Logs
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                startContent={<Icon icon="mdi:delete" />}
                                onPress={() => handleDelete(session.id)}
                              >
                                Eliminar
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

