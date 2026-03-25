import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { TemplateListComponent } from './pages/builder/template-list/template-list.component';
import { EditorComponent } from './pages/builder/editor/editor.component';
import { UploadComponent } from './pages/upload/upload.component';
import { AdminLoginComponent } from './pages/admin/login/admin-login.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin/dashboard/admin-dashboard.component';
import { TemplateManagerComponent } from './pages/admin/template-manager/template-manager.component';
import { TemplateDesignerComponent } from './pages/admin/template-designer/template-designer.component';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'builder', component: TemplateListComponent },
  { path: 'builder/:templateId', component: EditorComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  {
    path: 'admin/templates/designer',
    component: TemplateDesignerComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'admin/templates/designer/:templateId',
    component: TemplateDesignerComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'templates', component: TemplateManagerComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
