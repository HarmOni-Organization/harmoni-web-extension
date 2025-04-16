import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { register, selectAuthError, selectAuthStatus, clearError } from './authSlice';
import { isEmailUnique, isUsernameUnique } from '../../../services/auth';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const isLoading = status === 'loading';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateUsername = async (username: string) => {
    if (username.length < 3) {
      setFormErrors((prev) => ({
        ...prev,
        username: 'Username must be at least 3 characters',
      }));
      return false;
    }

    try {
      const isUnique = await isUsernameUnique(username);
      if (!isUnique) {
        setFormErrors((prev) => ({
          ...prev,
          username: 'Username is already taken',
        }));
        return false;
      }
    } catch (error) {
      // If API check fails, we'll continue and let server validation handle it
    }

    setFormErrors((prev) => ({ ...prev, username: '' }));
    return true;
  };

  const validateEmail = async (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormErrors((prev) => ({
        ...prev,
        email: 'Please enter a valid email address',
      }));
      return false;
    }

    try {
      const isUnique = await isEmailUnique(email);
      if (!isUnique) {
        setFormErrors((prev) => ({
          ...prev,
          email: 'Email is already registered',
        }));
        return false;
      }
    } catch (error) {
      // If API check fails, we'll continue and let server validation handle it
    }

    setFormErrors((prev) => ({ ...prev, email: '' }));
    return true;
  };

  const validatePassword = (password: string, confirmPassword: string) => {
    let isValid = true;

    if (password.length < 8) {
      setFormErrors((prev) => ({
        ...prev,
        password: 'Password must be at least 8 characters',
      }));
      isValid = false;
    } else {
      setFormErrors((prev) => ({ ...prev, password: '' }));
    }

    if (password !== confirmPassword) {
      setFormErrors((prev) => ({
        ...prev,
        confirmPassword: 'Passwords do not match',
      }));
      isValid = false;
    } else {
      setFormErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }

    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) dispatch(clearError());
  };

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'username' && value) {
      await validateUsername(value);
    } else if (name === 'email' && value) {
      await validateEmail(value);
    } else if (name === 'password' || name === 'confirmPassword') {
      if (formData.password && formData.confirmPassword) {
        validatePassword(formData.password, formData.confirmPassword);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear all errors first
    setFormErrors({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });

    // Validate all fields
    const isUsernameValid = await validateUsername(formData.username);
    const isEmailValid = await validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password, formData.confirmPassword);

    if (isUsernameValid && isEmailValid && isPasswordValid) {
      dispatch(
        register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        })
      );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create an account</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Join HarmOni and access all your tools
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            className={`w-full px-3 py-2 border ${
              formErrors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white`}
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
          />
          {formErrors.username && (
            <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={`w-full px-3 py-2 border ${
              formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white`}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
          />
          {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className={`w-full px-3 py-2 border ${
              formErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white`}
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
          />
          {formErrors.password && (
            <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className={`w-full px-3 py-2 border ${
              formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white`}
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
          />
          {formErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
