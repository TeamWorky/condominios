import { Pipe, PipeTransform } from '@angular/core';
import { formatRut } from '@condominios/shared/validators/rut.validator';

@Pipe({
  name: 'rutFormat',
  standalone: true,
})
export class RutFormatPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return formatRut(value);
  }
}
