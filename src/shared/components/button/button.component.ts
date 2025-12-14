import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() type: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' = 'primary';
  @Input() variant: 'default' | 'tab' = 'default';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() active: boolean = false;
  @Input() disabled: boolean = false;
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }

  getButtonClasses(): string {
    if (this.variant === 'tab') {
      return `tab-button${this.active ? ' active' : ''}`;
    }
    return `btn btn-${this.type} btn-${this.size}`;
  }
}

