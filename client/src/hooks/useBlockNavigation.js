import { useEffect, useRef } from 'react';

export function useBlockBackNavigation(showToast) {
  const backAttempts = useRef(0);
  const lastAttemptTime = useRef(0);

  useEffect(() => {
    // Push a new state to the history stack
    const pushState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    // Initial push
    pushState();

    // Handle back button press
    const handlePopState = (event) => {
      // Prevent the default back action
      event.preventDefault();
      
      // Push the state again to stay on the current page
      pushState();
      
      // Track back button attempts
      const now = Date.now();
      backAttempts.current += 1;
      
      // Show different messages based on attempts
      if (backAttempts.current === 1) {
        showToast?.('Navigation blocked: Use the logout button to exit the admin dashboard', 'warning', 5000);
      } else if (backAttempts.current === 2) {
        showToast?.('Back navigation is disabled for security. Please use the logout option.', 'warning', 5000);
      } else if (backAttempts.current === 3) {
        showToast?.('Multiple attempts detected. Admin dashboard requires proper logout procedure.', 'error', 6000);
      } else if (backAttempts.current >= 4) {
        showToast?.('Security Alert: Unauthorized navigation attempts detected. Please logout properly.', 'error', 7000);
      }
      
      // Reset counter after 10 seconds of inactivity
      if (now - lastAttemptTime.current > 10000) {
        backAttempts.current = 0;
      }
      lastAttemptTime.current = now;
    };

    // Add event listener for popstate (back button)
    window.addEventListener('popstate', handlePopState);

    // Cleanup function
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showToast]);
}

export function usePreventRefresh() {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Silently prevent refresh/close without showing dialog
      event.preventDefault();
      event.returnValue = '';
    };

    // Add event listener for beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}
