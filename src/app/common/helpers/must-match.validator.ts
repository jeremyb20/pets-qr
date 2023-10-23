import { FormGroup } from '@angular/forms';

// custom validator to check that two fields match
export function MustMatch(key: string, confirmationKey: string) {
    return (group: FormGroup) => {
        const input = group.controls[key];
        const confirmationInput = group.controls[confirmationKey];
        return confirmationInput.setErrors(
            input.value !== confirmationInput.value ? {notEquivalent: true} : null
        );
    };
}