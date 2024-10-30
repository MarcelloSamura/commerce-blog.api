import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Sets the visibility of a route as public.
 * This decorator sets a route as public, meaning that an access_token is not required to access the route.
 * @returns A decorator function to set the visibility of a route.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
