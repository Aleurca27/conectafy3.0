'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardBody,
  Button,
  Input,
  Avatar,
  Spinner,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { sessionsApi, messagesApi, Session, Contact, Message } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get('session');

  const { sessions, setSessions } = useStore();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Modal para nuevo contacto
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newContactNumber, setNewContactNumber] = useState('');

  useEffect(() => {
    checkAuth();
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadContacts();
    }
  }, [selectedSession]);

  useEffect(() => {
    if (selectedSession && selectedContact) {
      loadMessages();
      
      // Polling para nuevos mensajes cada 3 segundos
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedSession, selectedContact]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login');
      return;
    }
  };

  const loadSessions = async () => {
    try {
      const data = await sessionsApi.getAll();
      const connectedSessions = data.filter((s) => s.status === 'connected');
      setSessions(connectedSessions);
      
      if (sessionIdFromUrl) {
        const session = connectedSessions.find((s) => s.id === sessionIdFromUrl);
        if (session) {
          setSelectedSession(session);
        }
      } else if (connectedSessions.length > 0) {
        setSelectedSession(connectedSessions[0]);
      }
      
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar sesiones');
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    if (!selectedSession) return;

    try {
      const data = await messagesApi.getContacts(selectedSession.id);
      setContacts(data);
    } catch (error) {
      toast.error('Error al cargar contactos');
    }
  };

  const loadMessages = async () => {
    if (!selectedSession || !selectedContact) return;

    try {
      const data = await messagesApi.getChatMessages(
        selectedSession.id,
        selectedContact.phone_number
      );
      setMessages(data);
      
      // Marcar como leído
      if (selectedContact.unread_count > 0) {
        await messagesApi.markAsRead(
          selectedSession.id,
          selectedContact.phone_number
        );
        loadContacts(); // Recargar para actualizar contador
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedSession || !selectedContact) return;

    setSending(true);

    try {
      await sessionsApi.sendMessage(
        selectedSession.id,
        selectedContact.phone_number,
        messageText
      );
      
      setMessageText('');
      toast.success('Mensaje enviado');
      
      // Recargar mensajes
      setTimeout(loadMessages, 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleNewContact = async () => {
    if (!newContactNumber.trim() || !selectedSession) return;

    try {
      // Enviar mensaje para crear el contacto
      await sessionsApi.sendMessage(
        selectedSession.id,
        newContactNumber,
        '¡Hola! Este es un mensaje desde Conectafy.'
      );
      
      toast.success('Mensaje enviado al nuevo contacto');
      setNewContactNumber('');
      onClose();
      
      // Recargar contactos
      setTimeout(loadContacts, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al enviar mensaje');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto p-6">
          <Card>
            <CardBody className="text-center py-12">
              <Icon
                icon="mdi:whatsapp"
                className="text-6xl text-gray-300 mx-auto mb-4"
              />
              <p className="text-gray-600 mb-4">
                No tienes sesiones conectadas
              </p>
              <Button
                color="primary"
                onPress={() => router.push('/sessions')}
              >
                Ir a Sesiones
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto p-6">
        {/* Header con selector de sesión */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Select
              label="Sesión activa"
              selectedKeys={selectedSession ? [selectedSession.id] : []}
              onChange={(e) => {
                const session = sessions.find((s) => s.id === e.target.value);
                setSelectedSession(session || null);
                setSelectedContact(null);
              }}
              className="w-64"
            >
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  {session.session_name}
                </SelectItem>
              ))}
            </Select>
          </div>
          
          <Button
            color="primary"
            startContent={<Icon icon="mdi:message-plus" />}
            onPress={onOpen}
          >
            Nuevo Contacto
          </Button>
        </div>

        {/* Chat Layout */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
          {/* Sidebar de contactos */}
          <Card className="col-span-4">
            <CardBody className="p-0">
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold">Conversaciones</h2>
              </div>
              
              <div className="overflow-y-auto h-full">
                {contacts.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <Icon
                      icon="mdi:message-outline"
                      className="text-5xl text-gray-300 mx-auto mb-3"
                    />
                    <p className="text-gray-600 text-sm">
                      No hay conversaciones
                    </p>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="mt-3"
                      onPress={onOpen}
                    >
                      Iniciar chat
                    </Button>
                  </div>
                ) : (
                  contacts.map((contact) => (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                        selectedContact?.id === contact.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={contact.name || contact.phone_number[0]}
                          size="md"
                          color="primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-semibold truncate">
                              {contact.name || contact.phone_number}
                            </p>
                            <span className="text-xs text-gray-500">
                              {format(
                                new Date(contact.last_message_at),
                                'HH:mm'
                              )}
                            </span>
                          </div>
                          {contact.unread_count > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                                {contact.unread_count}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>

          {/* Área de chat */}
          <Card className="col-span-8">
            <CardBody className="p-0 flex flex-col h-full">
              {selectedContact ? (
                <>
                  {/* Header del chat */}
                  <div className="p-4 border-b flex items-center gap-3">
                    <Avatar
                      name={selectedContact.name || selectedContact.phone_number[0]}
                      size="md"
                      color="primary"
                    />
                    <div>
                      <p className="font-bold">
                        {selectedContact.name || selectedContact.phone_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedContact.phone_number}
                      </p>
                    </div>
                  </div>

                  {/* Mensajes */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <Icon
                          icon="mdi:message-text-outline"
                          className="text-5xl text-gray-300 mx-auto mb-3"
                        />
                        <p className="text-gray-600">No hay mensajes</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.from_me ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.from_me
                                ? 'bg-green-100'
                                : 'bg-white shadow'
                            }`}
                          >
                            <p className="text-sm">{message.body}</p>
                            <p className="text-xs text-gray-500 mt-1 text-right">
                              {format(new Date(message.timestamp), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input de mensaje */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-4 border-t flex gap-2"
                  >
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      color="primary"
                      isIconOnly
                      isLoading={sending}
                    >
                      <Icon icon="mdi:send" />
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Icon
                      icon="mdi:message-text"
                      className="text-6xl text-gray-300 mx-auto mb-4"
                    />
                    <p className="text-gray-600">
                      Selecciona una conversación para comenzar
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Modal nuevo contacto */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Enviar mensaje a nuevo contacto</ModalHeader>
          <ModalBody>
            <Input
              label="Número de teléfono"
              placeholder="5491234567890"
              value={newContactNumber}
              onChange={(e) => setNewContactNumber(e.target.value)}
              description="Incluye código de país sin +"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" onPress={handleNewContact}>
              Enviar mensaje
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

