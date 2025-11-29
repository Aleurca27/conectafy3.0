'use client';

import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from '@nextui-org/react';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';

export default function Navbar() {
  const router = useRouter();
  const user = useStore((state) => state.user);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada');
      router.push('/login');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <NextUINavbar isBordered>
      <NavbarBrand>
        <Icon icon="logos:whatsapp-icon" className="text-3xl mr-2" />
        <p className="font-bold text-xl">Conectafy</p>
      </NavbarBrand>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Button
            variant="light"
            startContent={<Icon icon="mdi:view-dashboard" />}
            onPress={() => router.push('/dashboard')}
          >
            Dashboard
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            variant="light"
            startContent={<Icon icon="mdi:whatsapp" />}
            onPress={() => router.push('/sessions')}
          >
            Sesiones
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            variant="light"
            startContent={<Icon icon="mdi:message" />}
            onPress={() => router.push('/chat')}
          >
            Mensajes
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              as="button"
              className="transition-transform"
              color="primary"
              name={user?.email?.[0]?.toUpperCase() || 'U'}
              size="sm"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Conectado como</p>
              <p className="font-semibold">{user?.email || 'Usuario'}</p>
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              onPress={handleLogout}
              startContent={<Icon icon="mdi:logout" />}
            >
              Cerrar Sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </NextUINavbar>
  );
}

