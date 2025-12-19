// Form-specific type definitions

export interface QuestionCondition {
  id: string;
  value: string;
}

export interface BaseQuestion {
  id: string;
  title: string;
  required?: boolean;
  condition?: QuestionCondition;
  description?: string;
  buttonText?: string;
}

export interface WelcomeQuestion extends BaseQuestion {
  type: "welcome";
  buttonText: string;
}

export interface TextQuestion extends BaseQuestion {
  type: "text";
}

export interface NumberQuestion extends BaseQuestion {
  type: "number";
}

export interface EmailQuestion extends BaseQuestion {
  type: "email";
}

export interface SelectQuestion extends BaseQuestion {
  type: "select";
  options: string[];
  multipleAnswers?: boolean;
}

export interface MultiSelectQuestion extends BaseQuestion {
  type: "multiselect";
  options: string[];
}

export interface TextAreaQuestion extends BaseQuestion {
  type: "textarea";
}

export interface PhotoUploadQuestion extends BaseQuestion {
  type: "photo";
}

export type Question =
  | WelcomeQuestion
  | TextQuestion
  | NumberQuestion
  | EmailQuestion
  | SelectQuestion
  | MultiSelectQuestion
  | TextAreaQuestion
  | PhotoUploadQuestion;

export interface FormAnswers {
  [key: string]: string | string[] | File[];
}
