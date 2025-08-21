import {useState, useCallback} from 'react';
import {validateEmail, validatePassword} from '../utils/helpers';

type ValidationRules = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  isEmail?: boolean;
  isPassword?: boolean;
  pattern?: RegExp;
  validate?: (value: string) => boolean | string;
};

type FieldConfig<T> = {
  [K in keyof T]: {
    value: T[K];
    rules?: ValidationRules;
    error?: string;
  };
};

type UseFormReturn<T> = {
  values: T;
  errors: {[K in keyof T]?: string};
  isValid: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleSubmit: (callback: (values: T) => void) => (e?: React.FormEvent) => void;
  resetForm: () => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
};

const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: {[K in keyof T]?: ValidationRules}
): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<{[K in keyof T]?: string}>({});
  const [isValid, setIsValid] = useState(false);

  const validateField = useCallback(
    (field: keyof T, value: any): string => {
      if (!validationRules || !validationRules[field]) return '';

      const rules = validationRules[field]!;
      const stringValue = String(value);

      if (rules.required && !stringValue.trim()) {
        return 'This field is required';
      }

      if (rules.minLength && stringValue.length < rules.minLength) {
        return `Must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && stringValue.length > rules.maxLength) {
        return `Must be less than ${rules.maxLength} characters`;
      }

      if (rules.isEmail && !validateEmail(stringValue)) {
        return 'Please enter a valid email';
      }

      if (rules.isPassword) {
        const passwordValidation = validatePassword(stringValue);
        if (!passwordValidation.valid) {
          return passwordValidation.message;
        }
      }

      if (rules.pattern && !rules.pattern.test(stringValue)) {
        return 'Invalid format';
      }

      if (rules.validate) {
        const customValidation = rules.validate(stringValue);
        if (typeof customValidation === 'string') {
          return customValidation;
        }
        if (customValidation === false) {
          return 'Invalid value';
        }
      }

      return '';
    },
    [validationRules]
  );

  const validateForm = useCallback(
    (valuesToValidate: T): boolean => {
      if (!validationRules) return true;

      const newErrors: {[K in keyof T]?: string} = {};
      let formIsValid = true;

      Object.keys(validationRules).forEach((field) => {
        const key = field as keyof T;
        const error = validateField(key, valuesToValidate[key]);
        if (error) {
          formIsValid = false;
          newErrors[key] = error;
        }
      });

      setErrors(newErrors);
      setIsValid(formIsValid);
      return formIsValid;
    },
    [validateField, validationRules]
  );

  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (validationRules?.[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({
          ...prev,
          [field]: error,
        }));

        // Update form validity
        const hasErrors = Object.values({
          ...errors,
          [field]: error,
        }).some((err) => err);
        setIsValid(!hasErrors);
      }
    },
    [errors, validateField, validationRules]
  );

  const handleSubmit = useCallback(
    (callback: (values: T) => void) =>
      (e?: React.FormEvent) => {
        e?.preventDefault();
        if (validateForm(values)) {
          callback(values);
        }
      },
    [validateForm, values]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsValid(false);
  }, [initialValues]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));  
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  return {
    values,
    errors,
    isValid,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
  };
};

export default useForm;
