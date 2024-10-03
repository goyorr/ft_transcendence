import { DataProps, ParseData, dataLogin } from "@/types/types";

export const StyleInput = `
  rounded-md focus:ring-transparent  focus-visible:ring-offset-0 focus-visible:ring-0 focus:outline-none focus:ring focus:border-[#7c3aed] w-full px-[8px] py-[10px] text-xs border-[0.1px] border-slate-800 bg-transparent
  `;

const ALLOWED_IMAGE_EXTENSIONS = [
  "jpeg",
  "jpg",
  "png",
  "gif",
  "bmp",
  "tiff",
  "tif",
  "webp",
];

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

export const chekkImage = (file: File): boolean => {
  const { size, name } = file;

  if (size > 5242880) {
    return false;
  }

  const extension = name.split(".");
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension[extension.length - 1])) {
    return false;
  }

  return true;
};

export const CheckFields = (formData: DataProps): boolean => {
  if (formData.first_name.length < 6) {
    return false;
  }

  if (!isNotEmpty(formData.last_name)) {
    return false;
  }

  if (!isNotEmpty(formData.username)) {
    return false;
  }

  if (!validateEmail(formData.email)) {
    return false;
  }

  if (
    formData.enableTwoFA !== undefined &&
    typeof formData.enableTwoFA !== "boolean"
  ) {
    return false;
  }

  return true;
};

const translations = {
  en: {
    firstNameLength: "First name must be at least 6 characters",
    lastNameLength: "Last name must be at least 6 characters",
    passwordLength: "Password must be at least 8 characters",
    invalidEmail: "Please provide a valid email",
  },
  fr: {
    firstNameLength: "Le prénom doit comporter au moins 6 caractères",
    lastNameLength: "Le nom de famille doit comporter au moins 6 caractères",
    passwordLength: "Le mot de passe doit comporter au moins 8 caractères",
    invalidEmail: "Veuillez fournir un e-mail valide",
  },
};

const validateField = (
  fields: dataLogin,
  from?: string,
  lang: "en" | "fr" | null = "en"
): ParseData => {
  let messages;
  if (lang !== null) {
    messages = translations[lang];
  }

  const ErrorFields: ParseData = {
    success: true,
    fieldsError: {
      email: "",
      last_name: "",
      first_name: "",
      password: "",
    },
  };

  if (
    from === "up" &&
    (fields.first_name === undefined ||
      (fields.first_name && fields.first_name.length < 3))
  ) {
    ErrorFields.success = false;
    ErrorFields.fieldsError.first_name = messages && messages.firstNameLength;
  }
  if (
    from === "up" &&
    (fields.last_name === undefined ||
      (fields.last_name && fields.last_name.length < 3))
  ) {
    ErrorFields.success = false;
    ErrorFields.fieldsError.last_name = messages && messages.lastNameLength;
  }
  if (
    fields.password === undefined ||
    fields.password.length === 0 ||
    (fields.password && fields.password.length < 8)
  ) {
    ErrorFields.success = false;
    ErrorFields.fieldsError.password = messages && messages.passwordLength;
  }
  if (
    fields.email === undefined ||
    fields.email.length < 6 ||
    !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(fields.email)
  ) {
    ErrorFields.success = false;
    ErrorFields.fieldsError.email = messages && messages.invalidEmail;
  }

  return ErrorFields;
};

export default validateField;
