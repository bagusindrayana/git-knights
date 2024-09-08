import { redirect, type Handle } from '@sveltejs/kit';
import { handle as authenticationHandle } from './auth';
import { sequence } from '@sveltejs/kit/hooks';

async function authorizationHandle({ event, resolve }: { event: any; resolve: any }) {
    const session = await event.locals.auth();
    
    if(event.url.pathname.startsWith('/api')) {
        if (!session) {
            return {
                status: 401,
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    error: 'Unauthorized',
                }),
            };
        }
    } else if(event.url.pathname.startsWith('/player')) {
        if (!session) {
            return redirect(303,'/login');
        }
    }

    // If the request is still here, just proceed as normally
    return resolve(event);
}

// First handle authentication, then authorization
// Each function acts as a middleware, receiving the request handle
// And returning a handle which gets passed to the next function
export const handle: Handle = sequence(authenticationHandle, authorizationHandle)