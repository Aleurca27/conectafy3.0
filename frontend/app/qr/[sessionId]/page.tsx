'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardBody, CardHeader, Button, Spinner } from '@nextui-org/react';
import { Icon } from '@iconify/react';
import QRCode from 'react-qr-code';
import Navbar from '@/components/Navbar';
import { sessionsApi } from '@/lib/api';
import { toast } from 'sonner';

export default function QRPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState(false);

  useEffect(() => {
    loadQR();
    
    // Polling para verificar estado
    const interval = setInterval(checkStatus, 3000);
    
    return () => clearInterval(interval);
  }, [sessionId]);

  const loadQR = async () => {
    try {
      setLoading(true);
      setError(false);
      const qr = await sessionsApi.getQR(sessionId);
      setQrCode(qr);
    } catch (error: any) {
      console.error('Error loading QR:', error);
      setError(true);
      toast.error('Error al cargar código QR');
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      const currentStatus = await sessionsApi.getStatus(sessionId);
      setStatus(currentStatus);
      
      if (currentStatus === 'WORKING' || currentStatus === 'connected') {
        toast.success('¡WhatsApp conectado exitosamente!');
        setTimeout(() => {
          router.push('/sessions');
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handleRefresh = () => {
    loadQR();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto p-6 max-w-2xl">
        <Button
          variant="light"
          startContent={<Icon icon="mdi:arrow-left" />}
          onPress={() => router.push('/sessions')}
          className="mb-6"
        >
          Volver a Sesiones
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 w-full justify-between">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:qrcode" className="text-3xl text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">Escanear Código QR</h1>
                  <p className="text-gray-600 text-sm">
                    Conecta tu WhatsApp escaneando el código
                  </p>
                </div>
              </div>
              <Button
                isIconOnly
                variant="flat"
                onPress={handleRefresh}
                isLoading={loading}
              >
                <Icon icon="mdi:refresh" />
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col items-center gap-6">
              {loading ? (
                <div className="py-12">
                  <Spinner size="lg" />
                  <p className="text-gray-600 mt-4">Generando código QR...</p>
                </div>
              ) : error ? (
                <div className="py-12 text-center">
                  <Icon
                    icon="mdi:alert-circle"
                    className="text-6xl text-red-500 mx-auto mb-4"
                  />
                  <p className="text-gray-600 mb-4">
                    Error al generar el código QR
                  </p>
                  <Button color="primary" onPress={handleRefresh}>
                    Reintentar
                  </Button>
                </div>
              ) : qrCode ? (
                <>
                  <div className="bg-white p-6 rounded-lg shadow-lg">
                    <QRCode value={qrCode} size={300} />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg w-full">
                    <div className="flex gap-2 mb-2">
                      <Icon
                        icon="mdi:information"
                        className="text-blue-600 text-xl"
                      />
                      <p className="font-semibold text-blue-800">
                        Instrucciones
                      </p>
                    </div>
                    <ol className="list-decimal list-inside text-sm text-blue-700 space-y-2 ml-6">
                      <li>Abre WhatsApp en tu teléfono</li>
                      <li>
                        Toca <strong>Menú</strong> o{' '}
                        <strong>Configuración</strong> y selecciona{' '}
                        <strong>Dispositivos vinculados</strong>
                      </li>
                      <li>
                        Toca <strong>Vincular un dispositivo</strong>
                      </li>
                      <li>Apunta tu teléfono hacia esta pantalla para escanear el código</li>
                    </ol>
                  </div>

                  {status === 'WORKING' || status === 'connected' ? (
                    <div className="bg-green-50 p-4 rounded-lg w-full">
                      <div className="flex gap-2 items-center">
                        <Icon
                          icon="mdi:check-circle"
                          className="text-green-600 text-2xl"
                        />
                        <p className="font-semibold text-green-800">
                          ¡Conectado exitosamente! Redirigiendo...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Spinner size="sm" />
                      <p className="text-sm">Esperando escaneo...</p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

