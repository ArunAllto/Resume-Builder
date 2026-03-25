import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  ResumeData,
  defaultResumeData,
  Certification,
  LanguageItem,
} from '../../../core/models/resume.model';
import { Template } from '../../../core/models/template.model';
import { TemplateService } from '../../../core/services/template.service';
import { ResumeService } from '../../../core/services/resume.service';
import { AiService } from '../../../core/services/ai.service';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PersonalInfoFormComponent } from './personal-info-form/personal-info-form.component';
import { ExperienceFormComponent } from './experience-form/experience-form.component';
import { EducationFormComponent } from './education-form/education-form.component';
import { SkillsFormComponent } from './skills-form/skills-form.component';
import { ProjectsFormComponent } from './projects-form/projects-form.component';
import { LivePreviewComponent } from './live-preview/live-preview.component';

interface EditorTab {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PersonalInfoFormComponent,
    ExperienceFormComponent,
    EducationFormComponent,
    SkillsFormComponent,
    ProjectsFormComponent,
    LivePreviewComponent,
  ],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit, OnDestroy {
  templateId: string = '';
  template: Template | null = null;
  resumeData: ResumeData = JSON.parse(JSON.stringify(defaultResumeData));
  savedResumeId: string = '';

  activeTab: string = 'personal';
  mobileView: 'form' | 'preview' = 'form';
  saving = false;
  downloading = false;
  aiGenerating = false;
  loadingTemplate = true;

  private autoSaveTimer: ReturnType<typeof setInterval> | null = null;
  private readonly STORAGE_KEY = 'resume-builder-data';
  private readonly UPLOADED_KEY = 'uploaded-resume-data';

  tabs: EditorTab[] = [
    { key: 'personal', label: 'Personal', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' },
    { key: 'summary', label: 'Summary', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
    { key: 'experience', label: 'Experience', icon: 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' },
    { key: 'education', label: 'Education', icon: 'M22 10v6M2 10l10-5 10 5-10 5z' },
    { key: 'skills', label: 'Skills', icon: 'M16 18 22 12 16 6M8 6 2 12 8 18' },
    { key: 'projects', label: 'Projects', icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' },
    { key: 'certifications', label: 'Certs', icon: 'M12 15l-2 5L12 18l2 2-2-5z' },
    { key: 'languages', label: 'Languages', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
  ];

  proficiencyOptions = ['basic', 'conversational', 'proficient', 'fluent', 'native'];

  private lastAutoSaveToast = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private templateService: TemplateService,
    private resumeService: ResumeService,
    private aiService: AiService,
    private apiService: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.templateId = this.route.snapshot.paramMap.get('templateId') ?? '';

    // Load template info
    if (this.templateId) {
      this.loadingTemplate = true;
      this.templateService.getTemplate(this.templateId).subscribe({
        next: (tmpl) => {
          this.template = tmpl;
          this.loadingTemplate = false;
        },
        error: () => {
          this.loadingTemplate = false;
        },
      });
    } else {
      this.loadingTemplate = false;
    }

    // Load uploaded resume data first, then localStorage draft
    this.loadResumeData();

    // Auto-save every 3 seconds
    this.autoSaveTimer = setInterval(() => {
      this.saveToLocalStorage();
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    this.saveToLocalStorage();
  }

  loadResumeData(): void {
    // Check for uploaded resume data first
    const uploaded = localStorage.getItem(this.UPLOADED_KEY);
    if (uploaded) {
      try {
        const parsed = JSON.parse(uploaded);
        this.resumeData = this.mergeWithDefaults(parsed);
        localStorage.removeItem(this.UPLOADED_KEY);
        return;
      } catch {}
    }

    // Fall back to saved draft
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.resumeData = this.mergeWithDefaults(parsed);
      } catch {}
    }
  }

  private mergeWithDefaults(data: Partial<ResumeData>): ResumeData {
    return {
      personalInfo: { ...defaultResumeData.personalInfo, ...(data.personalInfo || {}) },
      summary: data.summary ?? '',
      experience: data.experience ?? [],
      education: data.education ?? [],
      skills: data.skills ?? [],
      projects: data.projects ?? [],
      certifications: data.certifications ?? [],
      languages: data.languages ?? [],
    };
  }

  saveToLocalStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.resumeData));
    const now = Date.now();
    if (now - this.lastAutoSaveToast >= 30000) {
      this.lastAutoSaveToast = now;
      this.toast.info('Changes saved');
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  toggleMobileView(): void {
    this.mobileView = this.mobileView === 'form' ? 'preview' : 'form';
  }

  goBack(): void {
    this.router.navigate(['/builder']);
  }

  // Data change handlers
  onPersonalInfoChange(data: any): void {
    this.resumeData = { ...this.resumeData, personalInfo: data };
  }

  onSummaryChange(): void {
    // Triggered by ngModel directly
  }

  onExperienceChange(data: any): void {
    this.resumeData = { ...this.resumeData, experience: data };
  }

  onEducationChange(data: any): void {
    this.resumeData = { ...this.resumeData, education: data };
  }

  onSkillsChange(data: any): void {
    this.resumeData = { ...this.resumeData, skills: data };
  }

  onProjectsChange(data: any): void {
    this.resumeData = { ...this.resumeData, projects: data };
  }

  // Certifications inline
  addCertification(): void {
    const cert: Certification = {
      id: crypto.randomUUID(),
      name: '',
      issuer: '',
      date: '',
      url: '',
    };
    this.resumeData = {
      ...this.resumeData,
      certifications: [...this.resumeData.certifications, cert],
    };
  }

  removeCertification(index: number): void {
    this.resumeData = {
      ...this.resumeData,
      certifications: this.resumeData.certifications.filter((_, i) => i !== index),
    };
  }

  // Languages inline
  addLanguage(): void {
    const lang: LanguageItem = {
      id: crypto.randomUUID(),
      name: '',
      proficiency: 'conversational',
    };
    this.resumeData = {
      ...this.resumeData,
      languages: [...this.resumeData.languages, lang],
    };
  }

  removeLanguage(index: number): void {
    this.resumeData = {
      ...this.resumeData,
      languages: this.resumeData.languages.filter((_, i) => i !== index),
    };
  }

  // AI Enhance handler (passed to child components)
  aiEnhanceHandler = async (type: string, text: string): Promise<string> => {
    return firstValueFrom(this.aiService.enhance(text, type));
  };

  async generateAISummary(): Promise<void> {
    if (this.aiGenerating) return;
    this.aiGenerating = true;
    try {
      const context = `Name: ${this.resumeData.personalInfo.fullName}. ` +
        `Experience: ${this.resumeData.experience.map(e => e.position + ' at ' + e.company).join(', ')}. ` +
        `Skills: ${this.resumeData.skills.map(s => s.name).join(', ')}.`;
      const enhanced = await firstValueFrom(this.aiService.enhance(context, 'summary'));
      this.resumeData = { ...this.resumeData, summary: enhanced };
      this.toast.success('Text enhanced with AI');
    } catch (err) {
      console.error('AI summary generation failed:', err);
      this.toast.warning('AI enhancement unavailable');
    } finally {
      this.aiGenerating = false;
    }
  }

  // Save to backend
  async saveResume(): Promise<void> {
    if (this.saving) return;
    this.saving = true;
    try {
      const payload = {
        templateId: this.templateId,
        data: this.resumeData,
      };
      if (this.savedResumeId) {
        await firstValueFrom(this.resumeService.updateResume(this.savedResumeId, payload));
      } else {
        const res: any = await firstValueFrom(this.resumeService.saveResume(payload));
        if (res?.id) {
          this.savedResumeId = res.id;
        }
      }
      this.saveToLocalStorage();
      this.toast.success('Resume saved!');
    } catch (err) {
      console.error('Save failed:', err);
      this.toast.error('Failed to save resume');
    } finally {
      this.saving = false;
    }
  }

  // Download handler
  async downloadPDF(): Promise<void> {
    if (this.downloading) return;
    this.downloading = true;
    this.toast.info('Generating PDF...');
    try {
      // Try to download from backend if we have a saved ID
      if (this.savedResumeId) {
        const url = `${this.apiService.baseUrl}/download/${this.savedResumeId}`;
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.resumeData.personalInfo.fullName || 'resume'}.pdf`;
        link.click();
      } else {
        // Fallback: download as JSON
        const blob = new Blob([JSON.stringify(this.resumeData, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.resumeData.personalInfo.fullName || 'resume'}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download failed:', err);
      this.toast.error('Failed to generate PDF');
    } finally {
      this.downloading = false;
    }
  }

  get templateCategory(): string {
    return this.template?.category || 'professional';
  }
}
