import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Grid, Tabs, Tab, Box, Stack,
  CircularProgress, Alert, Avatar,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import FileUpload from '../../components/common/FileUpload';
import { employeeSchema } from '../../utils/validators';
import {
  createEmployeeStart, createEmployeeSuccess, createEmployeeFailure,
  updateEmployeeStart, updateEmployeeSuccess, updateEmployeeFailure,
} from '../../redux/slices/employeeSlice';
import { createEmployee, updateEmployee } from '../../api/companyApi';
import { ROLE_LABELS } from '../../constants/roles';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

function TabPanel({ children, value, idx }) {
  if (value !== idx) return null;
  return <Box sx={{ pt: 3 }}>{children}</Box>;
}

export default function EmployeeFormPage({ open, onClose, employee, companyId }) {
  const dispatch = useDispatch();
  const { departments } = useSelector((state) => state.department);
  const { designations } = useSelector((state) => state.designation);
  const { employees: allEmployees } = useSelector((state) => state.employee);

  const isEdit = Boolean(employee);
  const [tabValue, setTabValue] = useState(0);
  const [avatarFile, setAvatarFile] = useState(null);

  const defaultValues = useMemo(() => ({
    firstName: '', lastName: '', email: '', phone: '', avatar: '',
    employeeId: '', departmentId: '', designationId: '', role: '', reportingManagerId: '',
    dateOfJoining: dayjs().format('YYYY-MM-DD'),
    dateOfBirth: '', gender: '', address: '', city: '', state: '', country: '', zipCode: '',
    employmentType: 'full_time',
  }), []);

  const { control, handleSubmit, reset, watch, setValue, trigger, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(employeeSchema),
    defaultValues,
  });

  const selectedDeptId = watch('departmentId');

  const filteredDesignations = useMemo(() => {
    if (!selectedDeptId || !designations) return [];
    return designations.filter((d) => {
      const deptId = typeof d.departmentId === 'object' ? d.departmentId._id || d.departmentId.id : d.departmentId;
      return deptId === selectedDeptId;
    });
  }, [selectedDeptId, designations]);

  useEffect(() => {
    if (open) {
      if (employee) {
        reset({
          firstName: employee.firstName || '',
          lastName: employee.lastName || '',
          email: employee.email || '',
          phone: employee.phone || '',
          avatar: employee.avatar || '',
          employeeId: employee.employeeId || '',
          departmentId: employee.departmentId?._id || employee.departmentId?.id || employee.departmentId || '',
          designationId: employee.designationId?._id || employee.designationId?.id || employee.designationId || '',
          role: employee.role || '',
          reportingManagerId: employee.reportingManagerId?._id || employee.reportingManagerId?.id || employee.reportingManagerId || '',
          dateOfJoining: employee.dateOfJoining ? dayjs(employee.dateOfJoining).format('YYYY-MM-DD') : '',
          dateOfBirth: employee.dateOfBirth ? dayjs(employee.dateOfBirth).format('YYYY-MM-DD') : '',
          gender: employee.gender || '',
          address: employee.address || '',
          city: employee.city || '',
          state: employee.state || '',
          country: employee.country || '',
          zipCode: employee.zipCode || '',
          employmentType: employee.employmentType || 'full_time',
        });
      } else {
        reset(defaultValues);
      }
      setTabValue(0);
      setAvatarFile(null);
    }
  }, [open, employee, reset, defaultValues]);

  const handleFormSubmit = async (formData) => {
    const payload = {
      ...formData,
      companyId,
      dateOfJoining: formData.dateOfJoining ? dayjs(formData.dateOfJoining).toISOString() : undefined,
      dateOfBirth: formData.dateOfBirth ? dayjs(formData.dateOfBirth).toISOString() : undefined,
    };

    if (avatarFile) {
      payload.avatar = avatarFile.preview || avatarFile;
    }

    if (isEdit) {
      dispatch(updateEmployeeStart());
      try {
        const { data } = await updateEmployee(employee._id || employee.id, payload);
        dispatch(updateEmployeeSuccess(data));
        toast.success('Employee updated successfully');
        onClose();
      } catch (err) {
        dispatch(updateEmployeeFailure(err.response?.data?.message || err.message));
        toast.error(err.response?.data?.message || 'Failed to update employee');
      }
    } else {
      dispatch(createEmployeeStart());
      try {
        const { data } = await createEmployee(payload);
        dispatch(createEmployeeSuccess(data));
        toast.success('Employee created successfully');
        onClose();
      } catch (err) {
        dispatch(createEmployeeFailure(err.response?.data?.message || err.message));
        toast.error(err.response?.data?.message || 'Failed to create employee');
      }
    }
  };

  const validateTab = async (tabIndex) => {
    let fields;
    if (tabIndex === 0) fields = ['firstName', 'lastName', 'email', 'phone'];
    else if (tabIndex === 1) fields = ['employeeId', 'departmentId', 'designationId', 'role', 'dateOfJoining'];
    else if (tabIndex === 2) fields = ['dateOfBirth', 'gender', 'address'];
    const output = await trigger(fields);
    return output;
  };

  const handleTabChange = async (_, newValue) => {
    await validateTab(tabValue);
    setTabValue(newValue);
  };

  const canProceed = !isSubmitting;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
      <DialogContent dividers>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Basic Info" />
          <Tab label="Employment Details" />
          <Tab label="Personal Info" />
        </Tabs>

        <TabPanel value={tabValue} idx={0}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Controller
                name="avatar"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    files={field.value ? [{ id: 'avatar-upload', name: 'Avatar', preview: field.value }] : []}
                    onFilesChange={(files) => {
                      if (files.length > 0) {
                        setAvatarFile(files[0]);
                        field.onChange(files[0].preview || files[0]);
                      } else {
                        setAvatarFile(null);
                        field.onChange('');
                      }
                    }}
                    multiple={false}
                    accept={{ 'image/*': [] }}
                  />
                )}
              />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="First Name" fullWidth required error={!!errors.firstName} helperText={errors.firstName?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Last Name" fullWidth required error={!!errors.lastName} helperText={errors.lastName?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Email" fullWidth required type="email" error={!!errors.email} helperText={errors.email?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Phone" fullWidth error={!!errors.phone} helperText={errors.phone?.message} />
                  )}
                />
              </Grid>
            </Grid>
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} idx={1}>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="employeeId"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Employee ID" fullWidth placeholder="Auto-generated if empty" error={!!errors.employeeId} helperText={errors.employeeId?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="employmentType"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Employment Type" fullWidth>
                      <MenuItem value="full_time">Full Time</MenuItem>
                      <MenuItem value="part_time">Part Time</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="intern">Intern</MenuItem>
                      <MenuItem value="probation">Probation</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="departmentId"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Department" fullWidth required error={!!errors.departmentId} helperText={errors.departmentId?.message}>
                      <MenuItem value="">Select Department</MenuItem>
                      {departments?.map((d) => (
                        <MenuItem key={d._id || d.id} value={d._id || d.id}>{d.name}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="designationId"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Designation" fullWidth required error={!!errors.designationId} helperText={errors.designationId?.message}>
                      <MenuItem value="">Select Designation</MenuItem>
                      {filteredDesignations.map((d) => (
                        <MenuItem key={d._id || d.id} value={d._id || d.id}>{d.title}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Role" fullWidth required error={!!errors.role} helperText={errors.role?.message}>
                      <MenuItem value="">Select Role</MenuItem>
                      {ROLE_OPTIONS.map((r) => (
                        <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="reportingManagerId"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Reporting Manager" fullWidth>
                      <MenuItem value="">None</MenuItem>
                      {allEmployees?.filter((e) => (e._id || e.id) !== (employee?._id || employee?.id)).map((e) => (
                        <MenuItem key={e._id || e.id} value={e._id || e.id}>
                          {e.firstName} {e.lastName}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="dateOfJoining"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Date of Joining" type="date" fullWidth required InputLabelProps={{ shrink: true }} error={!!errors.dateOfJoining} helperText={errors.dateOfJoining?.message} />
                  )}
                />
              </Grid>
            </Grid>
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} idx={2}>
          <Stack spacing={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Date of Birth" type="date" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.dateOfBirth} helperText={errors.dateOfBirth?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Gender" fullWidth error={!!errors.gender} helperText={errors.gender?.message}>
                      <MenuItem value="">Prefer not to say</MenuItem>
                      {GENDER_OPTIONS.map((g) => (
                        <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Address" fullWidth multiline rows={2} error={!!errors.address} helperText={errors.address?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="City" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="State" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Country" fullWidth />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="zipCode"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Zip Code" fullWidth />
                  )}
                />
              </Grid>
            </Grid>
          </Stack>
        </TabPanel>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'space-between' }}>
          <Button onClick={() => setTabValue(Math.max(0, tabValue - 1))} disabled={tabValue === 0}>
            Previous
          </Button>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            {tabValue < 2 ? (
              <Button variant="contained" onClick={() => setTabValue(tabValue + 1)}>
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit(handleFormSubmit)}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
              >
                {isEdit ? 'Update' : 'Create'} Employee
              </Button>
            )}
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
