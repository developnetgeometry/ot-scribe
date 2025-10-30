import { ReactNode } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  CheckCircle, 
  Users, 
  Settings, 
  FileText,
  Eye,
  User,
  LogOut
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

function AppSidebar() {
  const { roles, hasRole } = useAuth();
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  const menuItems = [
    // Role-specific dashboards
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { path: '/hr/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['hr'] },
    { path: '/supervisor/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['supervisor'] },
    { path: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['employee'] },
    { path: '/bod/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['bod'] },
    
    // Employee actions
    { path: '/ot/submit', label: 'Submit OT', icon: PlusCircle, roles: ['employee'] },
    { path: '/ot/history', label: 'OT History', icon: History, roles: ['employee'] },
    
    // Supervisor actions
    { path: '/supervisor/verify', label: 'Verify OT', icon: CheckCircle, roles: ['supervisor'] },
    
    // HR actions
    { path: '/hr/approve', label: 'Approve OT', icon: CheckCircle, roles: ['hr'] },
    { path: '/hr/employees', label: 'Employees', icon: Users, roles: ['hr'] },
    { path: '/hr/settings', label: 'HR Settings', icon: Settings, roles: ['hr'] },
    { path: '/hr/ot-reports', label: 'OT Reports', icon: FileText, roles: ['hr'] },
    
    // BOD actions
    { path: '/bod/review', label: 'BOD Review', icon: Eye, roles: ['bod'] },
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.some(role => hasRole(role as any))
  );

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.path} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {open && <span>{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card flex items-center justify-between px-6">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}