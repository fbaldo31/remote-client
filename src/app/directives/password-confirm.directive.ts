import { Directive } from '@angular/core';
import { NG_VALIDATORS, Validators, ValidationErrors, AbstractControl, FormGroup } from '@angular/forms';

@Directive({
  selector: '[appPasswordConfirm]',
  providers: [{ provide: NG_VALIDATORS, useExisting: PasswordConfirmDirective, multi: true }]
})
export class PasswordConfirmDirective extends Validators {

  validate(control: AbstractControl): ValidationErrors {
    return this.passwordConfirmValidator(control);
  }

  passwordConfirmValidator(control: AbstractControl): ValidationErrors | null {
    const passwd = control.parent.get('pass');
    const confirm = control;
    console.log('check', passwd.value === confirm.value);
    if (passwd.value === confirm.value) {

      confirm.markAsPristine();

      if (!control.parent.errors) {
        console.log('errors', control.parent);
        control.parent.markAsPristine();
      }
    }

    return passwd && confirm && passwd.value === confirm.value ? null : { 'passwordMatch': true };
  }
}
