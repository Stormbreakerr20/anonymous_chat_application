export const HOST = import.meta.env.VITE_HOST;

export const AUTH_ROUTES = "http://localhost:3000/api/auth"

export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`;
export const GET_USER_INFO = `${AUTH_ROUTES}/user-info`;