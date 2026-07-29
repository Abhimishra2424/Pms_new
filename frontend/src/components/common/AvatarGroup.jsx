import React from 'react';
import { Avatar, Tooltip, AvatarGroup as MuiAvatarGroup, Box } from '@mui/material';
import { getInitials, generateAvatarColor } from '../../utils/helpers';

export default function AvatarGroup({ users, max = 4, size = 32, spacing = 'small' }) {
  if (!users || users.length === 0) return null;

  return (
    <MuiAvatarGroup max={max} spacing={spacing} total={users.length} sx={{ justifyContent: 'flex-start' }}>
      {users.map((user) => {
        const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'U';
        const avatarUrl = user.avatar || user.profilePicture;
        return (
          <Tooltip key={user._id || user.id || name} title={name} arrow>
            <Avatar
              src={avatarUrl}
              alt={name}
              sx={{
                width: size,
                height: size,
                fontSize: size * 0.4,
                bgcolor: avatarUrl ? 'transparent' : generateAvatarColor(name),
              }}
            >
              {!avatarUrl && getInitials(name)}
            </Avatar>
          </Tooltip>
        );
      })}
    </MuiAvatarGroup>
  );
}
