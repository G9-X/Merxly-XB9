import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  useUserProfile,
  useUpdateUserProfile,
  useChangePassword,
} from '../../hooks/useUserProfile';
import { getProductImageUrl } from '../../utils/cloudinaryHelpers';
import { uploadImage } from '../../services/uploadService';
import { ImageType } from '../../types/enums';
import { Input } from '../../components/ui/Input';
import type {
  UpdateUserProfileDto,
  ChangePasswordDto,
} from '../../types/models/userProfile';
import { toast } from 'react-toastify';

type ApiErrorShape = {
  response?: {
    data?: {
      message?: string;
      errors?: string[];
    };
  };
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as ApiErrorShape;
  return (
    apiError.response?.data?.message ||
    apiError.response?.data?.errors?.join(', ') ||
    fallback
  );
};

export const UserProfilePage = () => {
  const { data, isLoading } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const changePasswordMutation = useChangePassword();

  const profile = data?.data;

  // Account Info Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    watch: watchProfile,
    reset: resetProfile,
    formState: { isDirty: isProfileDirty },
  } = useForm<UpdateUserProfileDto>();

  // Change Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch: watchPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordDto>();

  const [isPasswordDirty, setIsPasswordDirty] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset profile form when data loads
  useEffect(() => {
    if (profile) {
      resetProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phoneNumber || '',
        avatarPublicId: profile.avatarPublicId,
      });
    }
  }, [profile, resetProfile]);

  // Watch password fields to detect changes
  const passwordFields = watchPassword();
  useEffect(() => {
    const hasPasswordInput =
      passwordFields.currentPassword ||
      passwordFields.newPassword ||
      passwordFields.confirmNewPassword;
    setIsPasswordDirty(!!hasPasswordInput);
  }, [passwordFields]);

  const password = watchPassword('newPassword');

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should not exceed 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const result = await uploadImage(file, 'avatars', ImageType.Avatar);
      const newAvatarPublicId = result.data?.publicId;

      // Update form value
      resetProfile({
        ...watchProfile(),
        avatarPublicId: newAvatarPublicId,
      });

      // Submit the profile update
      await updateProfileMutation.mutateAsync({
        ...watchProfile(),
        avatarPublicId: newAvatarPublicId,
      });

      toast.success('Avatar updated successfully!');
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Failed to upload avatar'));
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onSubmitProfile = async (data: UpdateUserProfileDto) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      toast.success('Profile updated successfully!');
    } catch (error: unknown) {
      toast.error(
        `Profile update failed: ${extractErrorMessage(error, 'Unknown error')}`,
      );
    }
  };

  const onSubmitPassword = async (data: ChangePasswordDto) => {
    if (data.newPassword !== data.confirmNewPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync(data);
      toast.success('Password changed successfully!');
      resetPassword();
    } catch (error: unknown) {
      toast.error(
        `Password change failed: ${extractErrorMessage(error, 'Failed to change password')}`,
      );
    }
  };

  if (isLoading) {
    return (
      <div className='px-4 md:px-8 lg:px-20 py-6 md:py-12'>
        <div className='max-w-5xl mx-auto'>
          <div className='flex items-center justify-center py-20'>
            <p className='text-neutral-500'>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='px-4 md:px-8 lg:px-20 py-6 md:py-12'>
        <div className='max-w-5xl mx-auto'>
          <div className='flex items-center justify-center py-20'>
            <p className='text-red-500'>Failed to load profile</p>
          </div>
        </div>
      </div>
    );
  }

  const getAvatarContent = () => {
    if (profile.avatarPublicId) {
      return (
        <img
          src={getProductImageUrl(profile.avatarPublicId, 'logo')}
          alt={`${profile.firstName} ${profile.lastName}`}
          className='w-full h-full object-cover'
        />
      );
    }

    return (
      <div className='w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-4xl md:text-5xl lg:text-6xl font-semibold'>
        {profile.firstName?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    );
  };

  return (
    <div className='p-4 md:p-6 lg:p-10'>
      <div className='max-w-7xl mx-auto space-y-6 md:space-y-8'>
        {/* Account Info Section */}
        <div>
          <div className='bg-white border-t border-x border-neutral-200 rounded-t-lg px-4 md:px-6 py-3 md:py-4'>
            <h2 className='text-lg md:text-xl font-semibold text-neutral-900'>
              Account Information
            </h2>
          </div>
          <div className='bg-white border border-neutral-200 rounded-b-lg p-4 md:p-6'>
            <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
              <div className='flex flex-col md:flex-row gap-6 md:gap-8'>
                {/* Left side - Avatar */}
                <div className='shrink-0 flex flex-col items-center md:items-start'>
                  <div className='w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-neutral-200 shadow-lg'>
                    {getAvatarContent()}
                  </div>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleAvatarUpload}
                    className='hidden'
                  />
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className='cursor-pointer w-32 md:w-40 mt-4 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-xs md:text-sm font-medium hover:bg-neutral-200 transition-colors disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed'
                  >
                    {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
                  </button>
                </div>

                {/* Right side - Form Fields */}
                <div className='flex-1 space-y-4 md:space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
                    <Input
                      label='First Name'
                      type='text'
                      {...registerProfile('firstName')}
                    />
                    <Input
                      label='Last Name'
                      type='text'
                      {...registerProfile('lastName')}
                    />
                  </div>

                  <Input
                    label='Email Address'
                    type='email'
                    {...registerProfile('email')}
                  />

                  <Input
                    label='Phone Number'
                    type='tel'
                    {...registerProfile('phoneNumber')}
                  />

                  {/* Save Button */}
                  <div className='flex justify-end pt-3 md:pt-4'>
                    <button
                      type='submit'
                      disabled={
                        !isProfileDirty || updateProfileMutation.isPending
                      }
                      className='w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 text-sm md:text-base bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed'
                    >
                      {updateProfileMutation.isPending
                        ? 'Saving...'
                        : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password Section */}
        <div>
          <div className='bg-white border-t border-x border-neutral-200 rounded-t-lg px-4 md:px-6 py-3 md:py-4'>
            <h2 className='text-lg md:text-xl font-semibold text-neutral-900'>
              Change Password
            </h2>
          </div>
          <div className='bg-white border border-neutral-200 rounded-b-lg p-4 md:p-6'>
            <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
              <div className='space-y-4 md:space-y-6'>
                <Input
                  label='Current Password'
                  type='password'
                  {...registerPassword('currentPassword', {
                    required: 'Current password is required',
                  })}
                  error={passwordErrors.currentPassword?.message}
                />

                <Input
                  label='New Password'
                  type='password'
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    maxLength: {
                      value: 100,
                      message: 'Password cannot exceed 100 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message:
                        'Password must contain uppercase, lowercase, and number',
                    },
                  })}
                  error={passwordErrors.newPassword?.message}
                />

                <Input
                  label='Confirm New Password'
                  type='password'
                  {...registerPassword('confirmNewPassword', {
                    required: 'Please confirm your new password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  error={passwordErrors.confirmNewPassword?.message}
                />

                {/* Save Button */}
                <div className='flex justify-end pt-3 md:pt-4'>
                  <button
                    type='submit'
                    disabled={
                      !isPasswordDirty || changePasswordMutation.isPending
                    }
                    className='w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 text-sm md:text-base bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed'
                  >
                    {changePasswordMutation.isPending
                      ? 'Changing...'
                      : 'Change Password'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
