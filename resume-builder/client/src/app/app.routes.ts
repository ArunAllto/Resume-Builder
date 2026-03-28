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
import { userGuard } from './core/guards/user.guard';
import { MyDraftsComponent } from './pages/my-drafts/my-drafts.component';
import { UsersComponent } from './pages/admin/users/users.component';
import { TestimonialsComponent } from './pages/admin/testimonials/testimonials.component';
import { CouponsComponent } from './pages/admin/coupons/coupons.component';
import { ContactSubmissionsComponent } from './pages/admin/contact-submissions/contact-submissions.component';
import { SiteSettingsComponent } from './pages/admin/site-settings/site-settings.component';

// New page imports
import { TemplatesComponent } from './pages/templates/templates.component';
import { ResumeExamplesComponent } from './pages/resume-examples/resume-examples.component';
import { ExampleDetailComponent } from './pages/resume-examples/example-detail/example-detail.component';
import { CoverLettersComponent } from './pages/cover-letters/cover-letters.component';
import { PricingComponent } from './pages/pricing/pricing.component';
import { BlogComponent } from './pages/blog/blog.component';
import { ArticleDetailComponent } from './pages/blog/article-detail/article-detail.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { FaqComponent } from './pages/faq/faq.component';
import { PrivacyComponent } from './pages/legal/privacy.component';
import { TermsComponent } from './pages/legal/terms.component';
import { ResumeFormatsComponent } from './pages/guides/resume-formats.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'builder', component: TemplateListComponent },
  { path: 'my-drafts', component: MyDraftsComponent, canActivate: [userGuard] },
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
      { path: 'users', component: UsersComponent },
      { path: 'testimonials', component: TestimonialsComponent },
      { path: 'coupons', component: CouponsComponent },
      { path: 'contact-submissions', component: ContactSubmissionsComponent },
      { path: 'site-settings', component: SiteSettingsComponent },
    ],
  },
  { path: 'templates', component: TemplatesComponent },
  { path: 'resume-examples', component: ResumeExamplesComponent },
  { path: 'resume-examples/:slug', component: ExampleDetailComponent },
  { path: 'cover-letters', component: CoverLettersComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'blog/:slug', component: ArticleDetailComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'resume-formats', component: ResumeFormatsComponent },
  { path: '**', redirectTo: '' },
];
