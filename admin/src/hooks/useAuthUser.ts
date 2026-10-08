import { useEffect, useState } from "react";
import {
  AUTH_USER_UPDATED_EVENT,
  AuthUser,
  getUser,
} from "../service/alumniService";

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(() => getUser());

  useEffect(() => {
    const handleUserUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<AuthUser | null>;
      setUser(customEvent.detail ?? null);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "auth_user") {
        setUser(getUser());
      }
    };

    window.addEventListener(AUTH_USER_UPDATED_EVENT, handleUserUpdated as EventListener);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        AUTH_USER_UPDATED_EVENT,
        handleUserUpdated as EventListener
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return user;
}
