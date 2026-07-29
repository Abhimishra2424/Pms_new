import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, CardContent, CardHeader, Grid, TextField, Button,
  MenuItem, Divider, Alert, CircularProgress, Typography, Stack,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import FileUpload from '../../components/common/FileUpload';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { companySchema } from '../../utils/validators';
import {
  fetchCompanyStart, fetchCompanySuccess, fetchCompanyFailure,
  updateCompanyStart, updateCompanySuccess, updateCompanyFailure,
} from '../../redux/slices/companySlice';
import { getCompany, updateCompany } from '../../api/companyApi';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Real Estate', 'Construction', 'Other'];
const sizes = ['1-10', '11-50', '51-200', '201-1000', '1000+'];
const currencies = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'AED'];
const timezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Shanghai',
  'Australia/Sydney', 'Pacific/Auckland',
];
const dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY'];

function SectionCard({ title, children }) {
  return (
    <Card sx={{ mb: 3 }} component={motion.div} {...fadeInUp}>
      <CardHeader title={title} titleTypographyProps={{ variant: 'h6', fontWeight: 600 }} />
      <Divider />
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function CompanySettingsPage() {
  const dispatch = useDispatch();
  const { company, loading, error } = useSelector((state) => state.company);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(companySchema),
    defaultValues: {
      name: '', email: '', phone: '', website: '', industry: '', size: '',
      currency: 'USD', timezone: 'UTC', dateFormat: 'DD/MM/YYYY',
      address: '', city: '', state: '', country: '', zipCode: '',
      taxId: '', registrationNumber: '', logo: '',
    },
  });

  const fetchData = useCallback(async () => {
    dispatch(fetchCompanyStart());
    try {
      const { data } = await getCompany();
      dispatch(fetchCompanySuccess(data));
      reset(data);
    } catch (err) {
      dispatch(fetchCompanyFailure(err.response?.data?.message || err.message));
    }
  }, [dispatch, reset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onSubmit = async (formData) => {
    dispatch(updateCompanyStart());
    try {
      const { data } = await updateCompany(formData);
      dispatch(updateCompanySuccess(data));
      toast.success('Company settings updated successfully');
    } catch (err) {
      dispatch(updateCompanyFailure(err.response?.data?.message || err.message));
      toast.error(err.response?.data?.message || 'Failed to update company settings');
    }
  };

  if (loading && !company) return <CardSkeleton count={3} />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <PageHeader
        title="Company Settings"
        subtitle="Manage your company information"
        breadcrumbs={[
          { label: 'Company', href: '/company/settings' },
          { label: 'Settings' },
        ]}
      />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch({ type: 'company/clearCompanyError' })}>
            {error}
          </Alert>
        )}

        <SectionCard title="General Information">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Company Logo
              </Typography>
              <Controller
                name="logo"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    files={field.value ? [{ id: 'logo', name: 'Company Logo', preview: field.value }] : []}
                    onFilesChange={(files) => {
                      if (files.length > 0) {
                        field.onChange(files[0].preview || files[0]);
                      } else {
                        field.onChange('');
                      }
                    }}
                    multiple={false}
                    accept={{ 'image/*': [] }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Company Name" fullWidth required error={!!errors.name} helperText={errors.name?.message} />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
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
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="website"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Website" fullWidth error={!!errors.website} helperText={errors.website?.message} />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="industry"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="Industry" fullWidth>
                        {industries.map((i) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="size"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label="Company Size" fullWidth>
                        {sizes.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </TextField>
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Address">
          <Grid container spacing={3}>
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
        </SectionCard>

        <SectionCard title="Configuration">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Currency" fullWidth>
                    {currencies.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="timezone"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Timezone" fullWidth SelectProps={{ MenuProps: { sx: { maxHeight: 300 } } }}>
                    {timezones.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="dateFormat"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Date Format" fullWidth>
                    {dateFormats.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="taxId"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Tax ID" fullWidth error={!!errors.taxId} helperText={errors.taxId?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="registrationNumber"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Registration Number" fullWidth />
                )}
              />
            </Grid>
          </Grid>
        </SectionCard>

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => reset(company)} disabled={isSubmitting}>
            Reset
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={isSubmitting || loading}
            startIcon={isSubmitting && <CircularProgress size={16} />}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Box>
    </motion.div>
  );
}
