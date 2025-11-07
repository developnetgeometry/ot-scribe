import { ReactNode } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import tidalLogo from '@/assets/tidal-logo.png';
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { NotificationBell } from '@/components/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { InstallBanner } from '@/components/pwa/InstallBanner';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  CheckCircle, 
  Users, 
  Building2,
  Settings, 
  FileText,
  Eye,
  User,
  LogOut,
  Calendar,
  Home
} from 'lucide-react';
import { AppRole } from '@/types/otms';

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
    { path: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { path: '/hr/dashboard', label: 'HR Dashboard', icon: LayoutDashboard, roles: ['hr', 'admin'] },
    { path: '/supervisor/dashboard', label: 'Supervisor Dashboard', icon: LayoutDashboard, roles: ['supervisor'] },
    { path: '/employee/dashboard', label: 'Employee Dashboard', icon: LayoutDashboard, roles: ['employee'] },
    { path: '/management/dashboard', label: 'Management Dashboard', icon: LayoutDashboard, roles: ['management', 'admin'] },
    
    // Shared - Calendar (all users)
    { path: '/calendar', label: 'Calendar', icon: Calendar, roles: ['admin', 'hr', 'supervisor', 'employee', 'management'] },

    // Shared - Settings (all users)
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'hr', 'supervisor', 'employee', 'management'] },

    // Employee actions
    { path: '/ot/submit', label: 'Submit OT', icon: PlusCircle, roles: ['employee'] },
    { path: '/ot/history', label: 'OT History', icon: History, roles: ['employee'] },
    
    // Supervisor actions
    { path: '/supervisor/verify', label: 'Verify OT', icon: CheckCircle, roles: ['supervisor'] },
    
    // HR actions
    { path: '/hr/approve', label: 'Certify OT', icon: CheckCircle, roles: ['hr', 'admin'] },
    { path: '/hr/employees', label: 'Employees', icon: Users, roles: ['hr', 'admin'] },
    { path: '/hr/departments', label: 'Departments', icon: Building2, roles: ['hr', 'admin'] },
    { path: '/hr/ot-reports', label: 'OT Reports', icon: FileText, roles: ['hr', 'admin'] },
    
    // Management actions
    { path: '/management/approve', label: 'Approve OT', icon: CheckCircle, roles: ['management', 'admin'] },
    { path: '/management/report', label: 'Management Report', icon: Eye, roles: ['management', 'admin'] },
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.some(role => hasRole(role as AppRole))
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-5">
          <img src={tidalLogo} alt="Tidal Group" className="h-16 w-auto object-contain" />
          {open && (
            <span className="text-lg font-semibold text-sidebar-foreground">OTMS</span>
          )}
        </div>
      </SidebarHeader>
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
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Generate breadcrumb items from current path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    
    const breadcrumbLabels: Record<string, string> = {
      'admin': 'Admin',
      'hr': 'HR',
      'supervisor': 'Supervisor',
      'employee': 'Employee',
      'management': 'Management',
      'dashboard': 'Dashboard',
      'approve': 'Approve OT',
      'verify': 'Verify OT',
      'certify': 'Certify OT',
      'employees': 'Employees',
      'departments': 'Departments',
      'ot-reports': 'OT Reports',
      'report': 'Report',
      'ot': 'OT',
      'submit': 'Submit OT',
      'history': 'OT History',
      'settings': 'Settings',
      'calendar': 'Calendar',
      'profile': 'Profile',
    };

    return paths.map((path, index) => {
      const fullPath = '/' + paths.slice(0, index + 1).join('/');
      const label = breadcrumbLabels[path] || path.charAt(0).toUpperCase() + path.slice(1);
      return { path: fullPath, label, isLast: index === paths.length - 1 };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink onClick={() => navigate('/')} className="flex items-center gap-1 cursor-pointer">
                      <Home className="h-3.5 w-3.5" />
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.path} className="flex items-center gap-2">
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {crumb.isLast ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink onClick={() => navigate(crumb.path)} className="cursor-pointer">
                            {crumb.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <ThemeToggle />
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
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <InstallBanner />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}