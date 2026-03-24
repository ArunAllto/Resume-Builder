import { Type } from '@angular/core';
import { ProfessionalTemplateComponent } from './professional/professional-template.component';
import { ModernTemplateComponent } from './modern/modern-template.component';
import { MinimalTemplateComponent } from './minimal/minimal-template.component';
import { CreativeTemplateComponent } from './creative/creative-template.component';

export const TEMPLATE_COMPONENTS: Record<string, Type<any>> = {
  professional: ProfessionalTemplateComponent,
  modern: ModernTemplateComponent,
  minimal: MinimalTemplateComponent,
  creative: CreativeTemplateComponent,
};

export {
  ProfessionalTemplateComponent,
  ModernTemplateComponent,
  MinimalTemplateComponent,
  CreativeTemplateComponent,
};
