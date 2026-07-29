import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
  rememberMe: yup.boolean(),
});

export const registerSchema = yup.object({
  firstName: yup.string().required('First name is required').min(2, 'Min 2 characters').max(50, 'Max 50 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Min 2 characters').max(50, 'Max 50 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'At least 8 characters')
    .matches(/[A-Z]/, 'Must contain uppercase')
    .matches(/[a-z]/, 'Must contain lowercase')
    .matches(/[0-9]/, 'Must contain number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain special character'),
  confirmPassword: yup.string()
    .required('Please confirm password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  companyCode: yup.string().required('Company code is required'),
});

export const forgotPasswordSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

export const resetPasswordSchema = yup.object({
  password: yup.string()
    .required('Password is required')
    .min(8, 'At least 8 characters')
    .matches(/[A-Z]/, 'Must contain uppercase')
    .matches(/[a-z]/, 'Must contain lowercase')
    .matches(/[0-9]/, 'Must contain number'),
  confirmPassword: yup.string()
    .required('Please confirm password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

export const projectSchema = yup.object({
  name: yup.string().required('Project name is required').min(3, 'Min 3 characters').max(100, 'Max 100 characters'),
  description: yup.string().max(2000, 'Max 2000 characters'),
  status: yup.string().required('Status is required'),
  priority: yup.string().required('Priority is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().min(yup.ref('startDate'), 'End date must be after start date'),
  budget: yup.number().min(0, 'Budget cannot be negative'),
  clientId: yup.string(),
  departmentId: yup.string(),
  teamSize: yup.number().min(1, 'Team size must be at least 1'),
});

export const taskSchema = yup.object({
  title: yup.string().required('Task title is required').min(3, 'Min 3 characters').max(200, 'Max 200 characters'),
  description: yup.string().max(5000, 'Max 5000 characters'),
  status: yup.string().required('Status is required'),
  priority: yup.string().required('Priority is required'),
  projectId: yup.string().required('Project is required'),
  assigneeId: yup.string(),
  dueDate: yup.date(),
  estimatedHours: yup.number().min(0, 'Cannot be negative'),
  labels: yup.array().of(yup.string()),
});

export const employeeSchema = yup.object({
  firstName: yup.string().required('First name is required').min(2, 'Min 2 characters').max(50, 'Max 50 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Min 2 characters').max(50, 'Max 50 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().matches(/^[+]?[\d\s()-]{7,20}$/, 'Invalid phone number'),
  employeeId: yup.string(),
  designationId: yup.string().required('Designation is required'),
  departmentId: yup.string().required('Department is required'),
  dateOfJoining: yup.date().required('Date of joining is required'),
  dateOfBirth: yup.date(),
  address: yup.string().max(500, 'Max 500 characters'),
  salary: yup.number().min(0, 'Salary cannot be negative'),
  employmentType: yup.string().required('Employment type is required'),
  reportingManagerId: yup.string(),
});

export const companySchema = yup.object({
  name: yup.string().required('Company name is required').min(2, 'Min 2 characters').max(200, 'Max 200 characters'),
  email: yup.string().email('Invalid email'),
  phone: yup.string(),
  address: yup.string().max(500, 'Max 500 characters'),
  website: yup.string().url('Invalid URL'),
  logo: yup.string(),
  taxId: yup.string(),
  registrationNumber: yup.string(),
  foundedYear: yup.number().min(1800, 'Invalid year').max(new Date().getFullYear(), 'Invalid year'),
  industry: yup.string(),
  employeeCount: yup.number().min(1, 'Must be at least 1'),
});

export const departmentSchema = yup.object({
  name: yup.string().required('Department name is required').min(2, 'Min 2 characters').max(100, 'Max 100 characters'),
  description: yup.string().max(500, 'Max 500 characters'),
  headId: yup.string(),
  parentDepartmentId: yup.string(),
});

export const designationSchema = yup.object({
  title: yup.string().required('Designation title is required').min(2, 'Min 2 characters').max(100, 'Max 100 characters'),
  description: yup.string().max(500, 'Max 500 characters'),
  departmentId: yup.string().required('Department is required'),
  level: yup.number().min(0, 'Invalid level'),
  salaryRangeMin: yup.number().min(0, 'Cannot be negative'),
  salaryRangeMax: yup.number().min(yup.ref('salaryRangeMin'), 'Max must be greater than min'),
});

export const clientSchema = yup.object({
  name: yup.string().required('Client name is required').min(2, 'Min 2 characters').max(200, 'Max 200 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string(),
  company: yup.string(),
  address: yup.string().max(500, 'Max 500 characters'),
  website: yup.string().url('Invalid URL'),
  notes: yup.string().max(2000, 'Max 2000 characters'),
});

export const invoiceSchema = yup.object({
  invoiceNumber: yup.string().required('Invoice number is required'),
  clientId: yup.string().required('Client is required'),
  projectId: yup.string(),
  issueDate: yup.date().required('Issue date is required'),
  dueDate: yup.date().required('Due date is required'),
  items: yup.array().of(
    yup.object({
      description: yup.string().required('Description is required'),
      quantity: yup.number().required('Quantity is required').min(1, 'Min 1'),
      rate: yup.number().required('Rate is required').min(0, 'Cannot be negative'),
    })
  ).min(1, 'At least one item is required'),
  taxRate: yup.number().min(0, 'Cannot be negative').max(100, 'Max 100%'),
  discount: yup.number().min(0, 'Cannot be negative'),
  notes: yup.string().max(1000, 'Max 1000 characters'),
  terms: yup.string().max(1000, 'Max 1000 characters'),
});

export const expenseSchema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Min 3 characters').max(200, 'Max 200 characters'),
  amount: yup.number().required('Amount is required').min(0.01, 'Amount must be positive'),
  category: yup.string().required('Category is required'),
  date: yup.date().required('Date is required'),
  projectId: yup.string(),
  description: yup.string().max(500, 'Max 500 characters'),
  receipt: yup.mixed(),
});

export const leaveSchema = yup.object({
  leaveType: yup.string().required('Leave type is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  reason: yup.string().required('Reason is required').min(10, 'Min 10 characters').max(1000, 'Max 1000 characters'),
  halfDay: yup.boolean(),
  halfDayType: yup.string().when('halfDay', {
    is: true,
    then: (schema) => schema.required('Half day type is required'),
  }),
});

export const meetingSchema = yup.object({
  title: yup.string().required('Meeting title is required').min(3, 'Min 3 characters').max(200, 'Max 200 characters'),
  description: yup.string().max(2000, 'Max 2000 characters'),
  date: yup.date().required('Date is required'),
  startTime: yup.string().required('Start time is required'),
  endTime: yup.string()
    .required('End time is required')
    .test('is-greater', 'End time must be after start time', function (value) {
      const { startTime } = this.parent;
      if (!startTime || !value) return true;
      return value > startTime;
    }),
  participants: yup.array().of(yup.string()).min(1, 'At least one participant is required'),
  meetingLink: yup.string().url('Invalid URL'),
  location: yup.string().max(200, 'Max 200 characters'),
  projectId: yup.string(),
  recurring: yup.boolean(),
  recurringType: yup.string().when('recurring', {
    is: true,
    then: (schema) => schema.required('Recurring type is required'),
  }),
});
