import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { APP_NAME } from '../../constants/config';

export default function PageHeader({ title, subtitle, breadcrumbs, actions, metaTitle }) {
  return (
    <>
      <Helmet>
        <title>{metaTitle || `${title} | ${APP_NAME}`}</title>
      </Helmet>
      <Box sx={{ mb: 3 }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs sx={{ mb: 1 }}>
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return item.href && !isLast ? (
                <Link
                  key={item.label}
                  component={RouterLink}
                  to={item.href}
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                  fontSize="0.8rem"
                >
                  {item.label}
                </Link>
              ) : (
                <Typography key={item.label} color="text.primary" fontSize="0.8rem" fontWeight={500}>
                  {item.label}
                </Typography>
              );
            })}
          </Breadcrumbs>
        )}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={700}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && <Stack direction="row" spacing={1}>{actions}</Stack>}
        </Stack>
      </Box>
    </>
  );
}
