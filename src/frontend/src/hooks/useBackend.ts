import type { backendInterface } from "../backend.d";
import { useActor } from "./useActor";

export function useBackend(): {
  backend: backendInterface | null;
  isLoading: boolean;
} {
  const { actor, isFetching } = useActor();
  return {
    backend: actor as unknown as backendInterface | null,
    isLoading: isFetching,
  };
}
